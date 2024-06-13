import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel } from 'discord.js';
import axios from 'axios';
import { SlashCommand } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const VALORANT_API_URL = 'https://valorant-api.com/v1/agents?language=fr-FR';

interface Agent {
    displayName: string;
    displayIconSmall: string;
    isPlayableCharacter: boolean;
}

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Tire au sort un certain nombre de champions Valorant')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre de champions à tirer au sort (entre 1 et 5)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5)
        ) as SlashCommandBuilder,
    
    execute: async (interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> => {
        if (interaction.isChatInputCommand()) {
            await handleChatInputCommand(interaction);
        } else if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
    },
    
    cooldown: 5
};

async function handleChatInputCommand(interaction: ChatInputCommandInteraction) {
    const nombre = interaction.options.getInteger('nombre', true);

    try {
        // Récupérer les données des champions depuis l'API Valorant
        const response = await axios.get(VALORANT_API_URL);
        const agents: Agent[] = response.data.data.filter((agent: Agent) => agent.isPlayableCharacter);

        // Mélanger les champions et en prendre le nombre spécifié
        let shuffledChampions = agents.sort(() => 0.5 - Math.random());
        let selectedChampions = shuffledChampions.slice(0, nombre);

        const embeds = selectedChampions.map((champion, index) => createEmbed(champion, index));
        const buttons = selectedChampions.map((_, index) => createButton(index));
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

        await interaction.reply({
            embeds: embeds,
            components: [actionRow]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des champions :', error);
        await interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération des champions. Veuillez réessayer plus tard.', ephemeral: true });
    }
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
    const [action, index, uuid] = interaction.customId.split('_');
    const championIndex = parseInt(index);

    if (action !== 'replace') return;

    try {
        const response = await axios.get(VALORANT_API_URL);
        const agents: Agent[] = response.data.data.filter((agent: Agent) => agent.isPlayableCharacter);

        let shuffledChampions = agents.sort(() => 0.5 - Math.random());
        let selectedChampions = shuffledChampions.slice(0, 5); // Assume 5 for simplicity, adjust as needed

        const newChampion = shuffledChampions.find(c => !selectedChampions.includes(c) && c.displayName !== selectedChampions[championIndex].displayName);

        if (newChampion) {
            selectedChampions[championIndex] = newChampion;

            const newEmbeds = selectedChampions.map((champion, index) => createEmbed(champion, index));
            const newButtons = selectedChampions.map((_, index) => createButton(index));
            const newActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(newButtons);

            console.log('Updating interaction with new champions.');
            await interaction.update({
                embeds: newEmbeds,
                components: [newActionRow]
            });
        } else {
            console.log('No new champion found for replacement.');
            await interaction.reply({ content: 'Aucun nouveau champion disponible pour remplacement.', ephemeral: true });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des champions :', error);
        await interaction.reply({ content: 'Une erreur s\'est produite lors de la récupération des champions. Veuillez réessayer plus tard.', ephemeral: true });
    }
}

function createEmbed(champion: Agent, index: number) {
    return new EmbedBuilder()
        .setTitle(`Joueur ${index + 1}: ${champion.displayName}`)
        .setThumbnail(champion.displayIconSmall)
        .setColor('#999da3');
}

function createButton(index: number) {
    return new ButtonBuilder()
        .setCustomId(`replace_${index}_${uuidv4()}`)
        .setLabel(`J${index + 1}`)
        .setStyle(ButtonStyle.Primary);
}

export default command;
