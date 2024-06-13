import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, Client, PermissionFlagsBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommand } from '../types';

// Remplacez par votre token de bot Discord, votre clientId, et guildId
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const authorizedUserId = '341709663567478787';

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('clearcommands')
        .setDescription('Supprime toutes les commandes (seulement pour l\'utilisateur autorisé)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (interaction.user.id !== authorizedUserId) {
            await interaction.reply({ content: 'Vous n\'êtes pas autorisé à utiliser cette commande.', ephemeral: true });
            return;
        }

        const rest = new REST({ version: '9' }).setToken(token);

        try {
            // Supprimer les commandes globales
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: [] }
            );

            // Supprimer les commandes de guilde
            const guildId = interaction.guildId;
            if (guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: [] }
                );
            }

            await interaction.reply({ content: 'Toutes les commandes ont été supprimées.', ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de la suppression des commandes:', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la suppression des commandes.', ephemeral: true });
        }
    },

    cooldown: 5
};

export default command;
