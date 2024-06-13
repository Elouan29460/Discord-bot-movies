import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { Command } from "../types";

// Fonction utilitaire pour attendre un certain nombre de millisecondes
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const command: Command = {
    name: "tg",
    execute: async (message, args) => {
        // Vérifie si un membre a été mentionné
        let toGreet = message.mentions.members?.first();
        if (toGreet) {
            for (let i = 0; i < 10; i++) {
                // Crée un embed avec le contenu souhaité et une image
                const embed = new EmbedBuilder()
                    .setTitle('Ferme ta gueule')
                    .setDescription(`Je souhaite que <@${toGreet.id}> ferme sa gueule !`)
                    .setImage('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Twitch_0.jpg');

                // Envoie l'embed
                await message.channel.send({ embeds: [embed] });
                await wait(1000); // Attendre 1 seconde avant d'envoyer le prochain message
            }
        } else {
            message.channel.send("Veuillez mentionner un utilisateur pour cette commande.");
        }
    },
    cooldown: 10,
    aliases: ["FermeTaGueule"],
    permissions: [PermissionFlagsBits.Administrator]
}

export default command;
