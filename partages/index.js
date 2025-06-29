const { Client, GatewayIntentBits } = require('discord.js');
const { Octokit } = require('@octokit/rest');
const https = require('https');
require('dotenv').config();

// Configuration du client Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Configuration d'Octokit pour GitHub
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GITHUB_OWNER = 'Zhaal'; // Votre nom d'utilisateur GitHub
const GITHUB_REPO = 'EcoSimRPG'; // Le nom de votre dépôt

client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'proposer-partage') return;

    await interaction.deferReply({ ephemeral: true }); // Accuse réception, réponse visible seulement par l'utilisateur

    const attachment = interaction.options.getAttachment('fichier');

    // 1. Validation du fichier
    if (!attachment.name.endsWith('.json')) {
        await interaction.editReply('Erreur : Le fichier doit être au format .json.');
        return;
    }

    try {
        // 2. Téléchargement du contenu du fichier
        const fileContent = await downloadFile(attachment.url);
        
        // 3. Processus GitHub
        const newBranchName = `submission/${interaction.user.username}-${Date.now()}`;
        const filePath = `partages/${attachment.name}`;
        const commitMessage = `Nouvelle soumission de partage par ${interaction.user.tag}: ${attachment.name}`;
        const prTitle = `Soumission de partage: ${attachment.name}`;
        const prBody = `Soumission de **${attachment.name}** par l'utilisateur Discord **${interaction.user.tag}** (ID: ${interaction.user.id}).`;

        // Étape A: Obtenir le dernier commit de la branche 'main'
        const { data: mainBranch } = await octokit.rest.repos.getBranch({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            branch: 'main',
        });
        const mainBranchSha = mainBranch.commit.sha;

        // Étape B: Créer une nouvelle branche à partir de 'main'
        await octokit.rest.git.createRef({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            ref: `refs/heads/${newBranchName}`,
            sha: mainBranchSha,
        });

        // Étape C: Créer le fichier sur la nouvelle branche
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: filePath,
            message: commitMessage,
            content: Buffer.from(fileContent).toString('base64'), // Le contenu doit être encodé en Base64
            branch: newBranchName,
        });

        // Étape D: Créer la Pull Request
        const { data: pullRequest } = await octokit.rest.pulls.create({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            title: prTitle,
            head: newBranchName, // La branche à merger
            base: 'main',       // La branche de destination
            body: prBody,
        });

        await interaction.editReply(`Merci ! Votre proposition a été soumise avec succès. Vous pouvez suivre la Pull Request ici : ${pullRequest.html_url}`);

    } catch (error) {
        console.error('Erreur lors du processus GitHub:', error);
        await interaction.editReply('Une erreur est survenue lors de la création de la Pull Request sur GitHub. Veuillez contacter un administrateur.');
    }
});

// Fonction utilitaire pour télécharger le contenu d'un fichier depuis une URL
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', err => reject(err));
        });
    });
}


client.login(process.env.DISCORD_TOKEN);