import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../types';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, DiscordGatewayAdapterCreator, StreamType } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import prism from 'prism-media';

// Set FFmpeg path for prism-media
prism.FFmpeg.getInfo = () => ({
    command: ffmpeg.path,
    info: ffmpeg.version,
    version: ffmpeg.version,
    output: ffmpeg.path,
    url: ffmpeg.url
});

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Rejoins le canal vocal et lance une vidéo YouTube.')
        .addStringOption(option =>
            option.setName('recherche')
                .setDescription('Le terme de recherche pour la vidéo YouTube')
                .setRequired(true)
        ) as SlashCommandBuilder,
    
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const recherche = interaction.options.getString('recherche', true);

        // Vérifie si l'utilisateur est dans un canal vocal
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: 'Vous devez être dans un canal vocal pour utiliser cette commande.', ephemeral: true });
            return;
        }

        // Vérifiez les permissions du bot dans le canal vocal
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions || !permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            await interaction.reply({ content: 'Je n\'ai pas les permissions nécessaires pour rejoindre et parler dans ce canal.', ephemeral: true });
            return;
        }

        // Recherche la vidéo YouTube
        const video = await ytSearch(recherche).then(results => results.videos.length > 0 ? results.videos[0] : null);
        if (!video) {
            await interaction.reply({ content: 'Aucune vidéo trouvée pour cette recherche.', ephemeral: true });
            return;
        }

        // Rejoins le canal vocal si il passe toutes les conditions
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The bot has connected to the channel!');
        });

        // Gérer les erreurs de connexion
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    connection.destroy();
                }
            } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                console.log('The connection was destroyed!');
            }
        });

        // Créer un lecteur audio
        const player = createAudioPlayer();

        // Log player state changes
        player.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });

        // Créer une ressource audio à partir de la vidéo YouTube
        const stream = ytdl(video.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

        // Log resource state
        resource.playStream.on('error', error => {
            console.error('Error in stream playback:', error);
        });

        stream.on('info', info => {
            console.log('Stream info:', info);
        });

        stream.on('error', error => {
            console.error('Stream error:', error);
        });

        // Lire la ressource audio
        player.play(resource);
        connection.subscribe(player);

        // Répondre à l'interaction
        await interaction.reply(`Lecture de **${video.title}**`);

        // Déconnexion automatique lorsque la lecture est terminée
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Playback ended, disconnecting...');
            connection.destroy();
        });

        // Log connection state changes
        connection.on('stateChange', (oldState, newState) => {
            console.log(`Voice connection transitioned from ${oldState.status} to ${newState.status}`);
        });
    },
    
    cooldown: 5
};

export default command;
