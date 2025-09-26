const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
  new SlashCommandBuilder()
    .setName('active-dev-badge')
    .setDescription('Start your 24hr Active role play timer!'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registering PUBLIC slash command...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Public slash command registered');

    client.once('ready', async () => {
      console.log(`Logged in as ${client.user.tag}`);
      
      // Set bot's status
      client.user.setActivity('chill with pepper', { type: 3 }); // Type 3 is "Watching"
      
      // Set bot's about me with watermark
      const watermark = "Made with ❤️ by Pepper Salt | A active role play bot uwu!";
      
      // Function to ensure watermark stays
      const ensureWatermark = async () => {
        try {
          await client.application.edit({
            description: watermark
          });
        } catch (error) {
          console.error('Failed to update application description:', error);
        }
      };

      // Set initial watermark
      await ensureWatermark();
      
      // Check and reset watermark every 5 minutes
      setInterval(ensureWatermark, 5 * 60 * 1000);
    });

  

    client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== 'active-dev-badge') return;

      const userId = interaction.user.id;
      let userTimers = {};
      
      // Read existing timers
      try {
        userTimers = JSON.parse(fs.readFileSync('./userTimers.json'));
      } catch (error) {
        console.error('Error reading timer file:', error);
      }

      const now = Date.now();
      let future;
      let timeLeft;

      // Check if user already has an active timer
      if (userTimers[userId] && userTimers[userId] > now) {
        future = userTimers[userId];
        timeLeft = `<t:${Math.floor(future / 1000)}:R>`;
      } else {
        // Set new timer
        future = now + 24 * 60 * 60 * 1000;
        timeLeft = `<t:${Math.floor(future / 1000)}:R>`;
        userTimers[userId] = future;
        
        // Save to file
        fs.writeFileSync('./userTimers.json', JSON.stringify(userTimers, null, 2));
      }

      const embed = new EmbedBuilder()
        .setTitle('🚀 Active Developer Badge Timer')
        .setDescription(`
        **Congratulations!** Your 24-hour timer has been activated.
        
        ⏰ **Timer Ends:** ${timeLeft}
        
        Once the timer completes, click the button below to claim your **Active Developer Badge**!
        `)
        .addFields(
          { 
            name: '📋 Instructions', 
            value: `
            • Wait for the full 24 hours to pass
            • Click the "Citizen Ship" button below
            • Complete the verification process
            • Enjoy your new roleplay! 🎉
            `, 
            inline: false 
          },
          { 
            name: '⚡ Quick Links', 
            value: `
            🔗 [Developer Portal](https://discord.com/developers/applications)
            📚 [Our website](in construction)
            💡 [Support Server](under maintanance)
            `, 
            inline: true 
          },
          { 
            name: '🎯 Rp Benefits', 
            value: `
            ✨ Exclusive game play
            🎖️ Community status
            🚀 flex maybe
            `, 
            inline: true 
          }
        )
        .setColor('#00D4AA')
        .setThumbnail('https://cdn.discordapp.com/attachments/982331559371767808/1421107201967394956/a_dd9d42133d1a2cb475480650d577f2fa-25ED8.gif?ex=68d7d4b7&is=68d68337&hm=1d4a36a79cd1f9b80fa6a0786a6ade5fbbc0d5118ed4eb8d791a280f0a617bb3&') 
        .setFooter({ 
          text: '🔥 Active Developer Bot For Pepper Dev | Made with ❤️ by Pepper Salt',
          iconURL: 'https://cdn.discordapp.com/attachments/1332936607267033138/1400353273906593844/image_8.png' 
        })
        .setTimestamp()
        .setImage('https://cdn.discordapp.com/attachments/1395245783808348331/1400351640028053556/20250731_102557.png');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🏆 Claim Your rewards')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.com/developers/active-developer')
      );

      await interaction.reply({ 
        embeds: [embed], 
        components: [row],
        ephemeral: false 
      });
    });

    client.login(TOKEN);

  } catch (err) {
    console.error(err);
  }
})();
