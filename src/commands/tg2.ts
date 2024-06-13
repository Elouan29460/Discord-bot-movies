import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";

// Fonction utilitaire pour attendre un certain nombre de millisecondes
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const command: Command = {
    name: "tg2",
    execute: async (message, args) => {
        const allowedUserId = '341709663567478787';
        if (message.author.id !== allowedUserId) {
            return message.channel.send("Vous n'êtes pas autorisé à utiliser cette commande.");
        }

        // Vérifie si un membre a été mentionné
        let toGreet = message.mentions.members?.first();
        if (!toGreet) {
            return message.channel.send("Veuillez mentionner un utilisateur pour cette commande.");
        }

        // Parse le nombre de répétitions à partir des arguments
        let repeatCount = parseInt(args[1], 10);
        if (isNaN(repeatCount) || repeatCount <= 0) {
            return message.channel.send("Veuillez fournir un nombre valide de répétitions.");
        }

        // Limite le nombre de répétitions à 100 pour éviter les abus
        repeatCount = Math.min(repeatCount, 100);

        // Envoie le message le nombre de fois spécifié
        for (let i = 0; i < repeatCount; i++) {
            await message.channel.send(`Je souhaite que <@${toGreet.id}> ferme sa gueule !`);
            await wait(1000); // Attendre 1 seconde avant d'envoyer le prochain message
        }
    },
    cooldown: 10,
    aliases: ["FermeTaGueule (2)"],
    permissions: [PermissionFlagsBits.ViewChannel]
}

export default command;
