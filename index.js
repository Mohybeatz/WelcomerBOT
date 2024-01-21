const { MessageAttachment, MessageEmbed, Client } = require('discord.js');
const { resolveImage, Canvas} = require("canvas-constructor/cairo")
const Keyv = require('keyv');
const db = new Keyv('sqlite://./storage/database.sqlite');
db.on('error', err => console.log('Connection Error', err));
const {
    token,
    prefix
} = require('./config.json')
let canvax = require('canvas')
canvax.registerFont("./storage/Uni Sans Heavy.otf", { family: 'Discord' })
canvax.registerFont("./storage/DejaVuSansCondensed-Bold.ttf", { family: 'Discordx' })
const client = new Client({
    intents: ["GUILDS","GUILD_MEMBERS","GUILD_MESSAGES"]
  }) // کلاینت به عنوان یک کلاینت جدید دیسکورد (ربات)
  /*
  کد زیر اطلاعاتی در مورد ربات ارائه می دهد
  وقتی آماده شد
  */
  client.once("ready", () => {
    console.log(`[STATUS] ${client.user.tag} is now online!\n[INFO] Bot by Mohy Beatz https://www.youtube.com/@MohyBeatz\n[INFO] Bot serving on Ready to serve in ${client.guilds.cache.size} servers\n[INFO] Bot serving ${client.users.cache.size} users\n[Invite Link] https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
  });
  /* ممبر وقتی پیامی را تشخیص می دهد
  سپس کد را اجرا کنید */
  client.on("messageCreate", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
// کامند ها 👇

// دیدن پینگ
    if(command === "ping") {
      message.reply(`پینگ شما درحال حاضر **${client.ws.ping}ms** (مقادیر در میلی ثانیه)`)
    }
    if(command === "add") {
     client.emit("guildMemberAdd", message.member)
    }
    // تنظیم کردن چنلی که پیام ولکام توش بیاد
    if(command === "setchannel") {
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      let channel = message.mentions.channels.first()
      if(!channel) return message.reply(`:x: | Missing arguments, required \`<channel>\`\n __Example__: ${prefix}setchannel ${message.channel}`)
      await db.set(`${message.guild.id}`, channel.id)
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(` با موفقیت کانال خوشامدگویی را روی ${channel} گزاشتید ✔`)
          .setColor("#2F3136")
          .setTimestamp()
          .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
        ]
      })
    }
    // دیدن چنلی که برای ولکام تنظیم شده
    if(command === "channel") {
      let channel = await db.get(`${message.guild.id}`)
      if(channel) {
        message.reply({
          embeds: [ new MessageEmbed()
            .setDescription(`ولکام با موفقیت روی چنل${message.guild.channels.cache.get(channel)} گزاشته شد 😉`)
            .setColor("#2F3136")
            .setTimestamp()
            .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
          ]
        })
      }
    }
    // تنظیم پس زمینه[عکس] برای پیام ولکام
    if(command === "setbackground"){
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      if(args[0] && !args[0].startsWith("http")) return message.reply("Please provide a valid URL for an image **or** upload an image to set as background.")
      let background = message.attachments.first() ? message.attachments.first().url : args[0]
      if(!background) return message.reply(`:x: | Missing arguments, required \`<background>\`\n __Example__: ${prefix}setbackground <attachment> [ Can be URL or an uploaded image ]`)
      await db.set(`bg_${message.guild.id}`, background)
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(`👍 | پس‌زمینه با موفقیت روی [این تصویر] تنظیم شد(${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
          .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
        ]
      })
    }
      // دیدن پس زمینه ای که برای ولکام گزاشتید
    if(command === "background") {
    let background = await db.get(`bg_${message.guild.id}`)
    if(background) {
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(` پس زمینه روی [این تصویر] تنظیم شده است(${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
          .setFooter(`${message.author.tag}`, message.author.displayAvatarURL())
        ]
      })
    }
  }
  });
/* کلاینت وقتی تشخیص داد عضو جدید بپیوندید */

client.on('guildMemberAdd', async member => {
  let channelwelc = await db.get(`${member.guild.id}`)
  if(!channelwelc) return;
  let channel = member.guild.channels.cache.get(channelwelc)
   let buffer_attach =  await generareCanvas(member)
   const attachment = new MessageAttachment(buffer_attach, 'welcome.png')
   let embed = new MessageEmbed()
    .setTitle(`Welcome to ${member.guild.name}`)
    .setDescription(`سلام ${member.user} <:1166018490487017615:1197222370587447296> . خیلی خوش اومدی به سرور <:pink:1091083296294838393> . به لطف تو سرور الان ${member.guild.memberCount} نفره!`)
    .setColor('#2F3136')
    .setThumbnail(member.displayAvatarURL({
      dynamic: true
    }))
    .setTimestamp()
    .setFooter('Made By Mohy Beatz<:MohyBeatz:1198518108894285904>')
    .setImage("attachment://welcome.png")

    channel?.send({ embeds: [embed], files: [attachment] })
})


async function generareCanvas(member) {
  const avatar = await resolveImage(member.user.displayAvatarURL({ 'size': 2048, 'format': "png" }))
  const background = await resolveImage(await db.get(`bg_${member.guild.id}`)) ?? await resolveImage("https://cdn.discordapp.com/attachments/910400703862833192/910426253947994112/121177.png")
  const { weirdToNormalChars } = require('weird-to-normal-chars')
  const name = weirdToNormalChars(member.user.username)
  let canvas = new Canvas(1024, 450)
  .printImage(background, 0, 0, 1024, 450)
  .setColor("#2F3136")
  .printCircle(512, 155, 120)
  .printCircularImage(avatar, 512, 155, 115)
  .setTextAlign('center')
  .setTextFont('70px Discord')
  .printText(`Welcome`, 512, 355)
  .setTextAlign("center")
  .setColor("#FFFFFF")
  .setTextFont('45px Discordx')
  .printText(`${name}`, 512, 395)
  .setTextAlign("center")
  .setColor("#FFFFFF")
  .setTextFont('30px Discord')
  .printText(`To ${member.guild.name}`, 512, 430)
  return canvas.toBufferAsync()
}


client.login(token)
//Made By Mohy Beatz