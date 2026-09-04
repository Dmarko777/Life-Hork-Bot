const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===============================
// الإعدادات
// ===============================

const SUPPORT_ROLE_ID = '1446972300380471438';
const TICKET_CATEGORY_ID = '1540086215351476435';

// ===============================

client.once('ready', () => {
    console.log(`تم تشغيل البوت: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أمر إنشاء لوحة التكت
    if (message.content === '!ticket-panel') {

        const embed = new EmbedBuilder()
            .setTitle('🎫 Life Hork | Support')
            .setDescription(
                'للتواصل مع الإدارة وطلب المساعدة\n' +
                'اضغط على الزر بالأسفل لفتح تذكرة.'
            )
            .setColor(0x2b2d31);

        const button = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('فتح تكت')
            .setEmoji('🎫')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});

// ===============================
// الأزرار
// ===============================

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isButton()) return;

    // ===============================
    // فتح التكت
    // ===============================

    if (interaction.customId === 'open_ticket') {

        const guild = interaction.guild;

        // التأكد إذا عنده تكت مفتوح
        const existingTicket = guild.channels.cache.find(
            channel =>
                channel.name === `ticket-${interaction.user.username.toLowerCase()}` &&
                channel.type === ChannelType.GuildText
        );

        if (existingTicket) {
            return interaction.reply({
                content: `لديك تكت مفتوح بالفعل: ${existingTicket}`,
                ephemeral: true
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,

            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: SUPPORT_ROLE_ID,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle('🎫 Life Hork | Ticket')
            .setDescription(
                `مرحبًا ${interaction.user}!\n\n` +
                'اكتب مشكلتك أو طلبك بالتفصيل وانتظر أحد أفراد الإدارة.\n\n' +
                'يمكن للإدارة استلام التكت من الزر بالأسفل.'
            )
            .setColor(0x2b2d31);

        const claimButton = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('استلام التكت')
            .setEmoji('📌')
            .setStyle(ButtonStyle.Success);

        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('إغلاق التكت')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(claimButton, closeButton);

        await ticketChannel.send({
            content: `${interaction.user} <@&${SUPPORT_ROLE_ID}>`,
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: `تم فتح تكتك: ${ticketChannel}`,
            ephemeral: true
        });
    }

    // ===============================
    // استلام التكت
    // ===============================

    if (interaction.customId === 'claim_ticket') {

        if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
            return interaction.reply({
                content: 'ليس لديك صلاحية لاستلام التكت.',
                ephemeral: true
            });
        }

        await interaction.channel.send(
            `📌 تم استلام التكت بواسطة ${interaction.user}`
        );

        await interaction.reply({
            content: 'تم استلام التكت بنجاح.',
            ephemeral: true
        });
    }

    // ===============================
    // إغلاق التكت
    // ===============================

    if (interaction.customId === 'close_ticket') {

        if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID)) {
            return interaction.reply({
                content: 'ليس لديك صلاحية إغلاق التكت.',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: '🔒 سيتم إغلاق التكت خلال 5 ثوانٍ...'
        });

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);
    }
});

// ===============================
// التوكن
// ===============================

client.login('MTU0NDA0ODY2MjU0NjQ4NTI3OA.GrsaVQ.uaf6DAlccGgdESaTXfS--i1MOeKBKaFq6DqKL0');
