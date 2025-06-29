const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Charge les variables de .env

const commands = [
    {
        name: 'proposer-partage',
        description: 'Propose un nouveau fichier de partage pour EcoSimRPG.',
        options: [
            {
                name: 'fichier',
                type: 11, // 11 = Attachment (pièce jointe)
                description: 'Le fichier .json de votre création.',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();