import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
import fetch from 'node-fetch'; // Importation de node-fetch v2
import { SlashCommand } from '../../types';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des identifiants uniques

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('film')
        .setDescription('Rechercher les films ou séries les plus probables à partir d\'un nom donné')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom du film ou de la série à rechercher')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Le type de média (film ou série)')
                .setRequired(false)
                .addChoices(
                    { name: 'Film', value: 'movie' },
                    { name: 'Série', value: 'tv' }
                )
        ) as SlashCommandBuilder,
    
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const name = interaction.options.getString('nom', true);
        const type = interaction.options.getString('type') || 'movie';
        const userId = interaction.user.id;
        const interactionId = uuidv4(); // Générer un identifiant unique pour cette interaction

        if (!name) {
            await interaction.reply({ content: 'Veuillez fournir un nom de film ou de série.' });
            return;
        }

        try {
            const response = await fetch(`${TMDB_API_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}&language=fr-FR`);
            const data = await response.json() as { results: any[] };

            if (data.results.length > 0) {
                let currentIndex = 0;
                const results = data.results.sort((a, b) => b.vote_average - a.vote_average); // Trier par note décroissante

                const generateEmbed = (index: number) => {
                    const result = results[index];
                    const title = type === 'movie' ? result.title : result.name;
                    return new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(result.overview || 'Pas de description disponible.')
                        .setThumbnail(`https://image.tmdb.org/t/p/w500${result.poster_path}`)
                        .addFields(
                            { name: 'Date de sortie', value: result.release_date || result.first_air_date || 'Inconnue', inline: true },
                            { name: 'Note', value: result.vote_average.toString() || 'Non noté', inline: true }
                        )
                        .setColor('#999da3');
                };

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`previous_${interactionId}`)
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentIndex === 0),
                        new ButtonBuilder()
                            .setCustomId(`next_${interactionId}`)
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentIndex === results.length - 1),
                        new ButtonBuilder()
                            .setCustomId(`delete_${interactionId}`)
                            .setLabel('Supprimer')
                            .setStyle(ButtonStyle.Danger)
                    );

                await interaction.reply({ embeds: [generateEmbed(currentIndex)], components: [row] });

                const filter = (i: ButtonInteraction) => i.customId.endsWith(`_${interactionId}`) && i.user.id === userId;

                const collector = interaction.channel?.createMessageComponentCollector({
                    filter,
                    componentType: ComponentType.Button,
                    time: 900000 // 15 minutes en millisecondes
                });

                collector?.on('collect', async i => {
                    if (!i.isButton()) return;

                    if (i.customId === `delete_${interactionId}`) {
                        try {
                            await i.message.delete();
                        } catch (error) {
                            console.error('Erreur lors de la suppression du message :', error);
                        }
                        return;
                    }

                    if (i.customId === `previous_${interactionId}` && currentIndex > 0) {
                        currentIndex--;
                    } else if (i.customId === `next_${interactionId}` && currentIndex < results.length - 1) {
                        currentIndex++;
                    }

                    try {
                        if (!i.deferred && !i.replied) {
                            await i.deferUpdate();
                        }

                        await i.editReply({
                            embeds: [generateEmbed(currentIndex)],
                            components: [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(`previous_${interactionId}`)
                                            .setLabel('Précédent')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentIndex === 0),
                                        new ButtonBuilder()
                                            .setCustomId(`next_${interactionId}`)
                                            .setLabel('Suivant')
                                            .setStyle(ButtonStyle.Primary)
                                            .setDisabled(currentIndex === results.length - 1),
                                        new ButtonBuilder()
                                            .setCustomId(`delete_${interactionId}`)
                                            .setLabel('Supprimer')
                                            .setStyle(ButtonStyle.Danger)
                                    )
                            ]
                        });
                    } catch (error) {
                        if (error.code === 10062) {
                            console.error('Unknown interaction:', error);
                        } else if (error.code === 40060) {
                            console.error('Interaction has already been acknowledged:', error);
                        } else {
                            throw error;
                        }
                    }
                });

                collector?.on('end', async () => {
                    try {
                        await interaction.editReply({ components: [] });
                    } catch (error) {
                        console.error('Erreur lors de la modification du message :', error);
                    }
                });
            } else {
                await interaction.reply({ content: `Aucun résultat trouvé pour "${name}".` });
            }
        } catch (error) {
            console.error('Erreur lors de la recherche :', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la recherche. Veuillez réessayer plus tard.' });
        }
    },

    cooldown: 5
};

export default command;
