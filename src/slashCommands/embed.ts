import { SlashCommandBuilder, TextChannel, EmbedBuilder, ColorResolvable, PermissionFlagsBits } from "discord.js"
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("embed")
    .addStringOption(option => {
      return option
        .setName("title")
        .setDescription("Titre du message Embed.")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("description")
        .setDescription("Description du message Embed.")
        .setRequired(true);
    })
    .addChannelOption(option => {
      return option
        .setName("channel")
        .setDescription("Salon dans lequel le message Embed sera envoyé.")
        .setRequired(true);
    })
    .addStringOption(option => {
      return option
        .setName("color")
        .setDescription("Choisissez une option ou tapez une couleur en code hexadécimal, par example: #000000")
        .setRequired(true)
        .setAutocomplete(true);
    })
    .setDescription("Créer un Embed personalisé et l'envoie dans un salon")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder
  ,
  autocomplete: async (interaction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const choices = [
        { name: "White", value: "White" },
        { name: "Aqua", value: "Aqua" },
        { name: "Green", value: "Green" },
        { name: "Blue", value: "Blue" },
        { name: "Yellow", value: "Yellow" },
        { name: "Purple", value: "Purple" },
        { name: "LuminousVividPink", value: "LuminousVividPink" },
        { name: "Fuchsia", value: "Fuchsia" },
        { name: "Gold", value: "Gold" },
        { name: "Orange", value: "Orange" },
        { name: "Red", value: "Red" },
        { name: "Grey", value: "Grey" },
        { name: "Navy", value: "Navy" },
        { name: "DarkAqua", value: "DarkAqua" },
        { name: "DarkGreen", value: "DarkGreen" },
        { name: "DarkBlue", value: "DarkBlue" },
        { name: "DarkPurple", value: "DarkPurple" },
        { name: "DarkVividPink", value: "DarkVividPink" },
        { name: "DarkGold", value: "DarkGold" },
        { name: "DarkOrange", value: "DarkOrange" },
        { name: "DarkRed", value: "DarkRed" },
        { name: "DarkGrey", value: "DarkGrey" },
        { name: "DarkerGrey", value: "DarkerGrey" },
        { name: "LightGrey", value: "LightGrey" },
        { name: "DarkNavy", value: "DarkNavy" }
      ];
      let filtered: { name: string, value: string }[] = []
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.name.includes(focusedValue)) filtered.push(choice);
      }
      await interaction.respond(
        filtered
      );
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }
  },
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const options: { [key: string]: string | number | boolean } = {};
      if (!interaction.options) return interaction.editReply({ content: "Une erreur est survenue..." });
      for (let i = 0; i < interaction.options.data.length; i++) {
        const element = interaction.options.data[i];
        if (element.name && element.value) options[element.name] = element.value;
      }
      const embed = new EmbedBuilder()
        .setColor(options.color.toString() as ColorResolvable)
        .setTitle(options.title.toString())
        .setDescription(options.description.toString())
        .setAuthor({ name: interaction.client.user?.username || 'Default Name', iconURL: interaction.client.user?.avatarURL() || undefined })
        .setThumbnail(interaction.client.user?.avatarURL() || null)
        .setTimestamp()
        .setFooter({ text: "Test embed message", iconURL: interaction.client.user?.avatarURL() || undefined });
      let selectedTextChannel = interaction.channel?.client.channels.cache.get(options.channel.toString()) as TextChannel
      selectedTextChannel.send({ embeds: [embed] });
      return interaction.editReply({ content: "Message Embed envoyé avec succès." })
    } catch (error) {
      interaction.editReply({ content: "Une erreur est survenue..." });
    }

  },
  cooldown: 10
}

export default command