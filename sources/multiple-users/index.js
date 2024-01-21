const { Client, MessageEmbed, Collection } = require ("discord.js") // require the discord.js wrapper
const client = new Client({
  intents: ["GUILDS","GUILD_MEMBERS","GUILD_MESSAGES"]
}) // کلاینت را به عنوان مشتری جدید دیسکورد (ربات) اعلام کنید
const newUsers = [] // Declare newUsers to be an empty array
/*
کد زیر اطلاعاتی در مورد ربات ارائه می دهد
  وقتی آماده شد
  */
let limit = 2 // How many users to welcome together
client.once("ready", () => {
  console.log(`[STATUS] ${client.user.tag} is now online!\n[INFO] Bot by ZeroSync https://www.youtube.com/c/ZeroSync\n[INFO] Bot serving on Ready to serve in ${client.guilds.cache.size} servers\n[INFO] Bot serving ${client.users.cache.size} users\n[Invite Link] https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
});
/* ممبر وقتی پیامی را تشخیص می دهد
  سپس کد را اجرا کنید */
client.on("messageCreate", async message =>{
  if (message.content.startsWith("!ping"))
  {
    message.reply(`The client websocket latency is **${client.ws.ping}ms** (values in milliseconds)`)
  }
  if (message.content.startsWith("!add"))
  {
    message.channel.send(`Added ${message.mentions.users.first()} please add ${limit + 1} users in total`)
   client.emit("guildMemberAdd", (message.guild.members.cache.get(message.mentions.users.first().id)))
  }
});
/* 
/* کلاینت وقتی تشخیص داد عضو جدید بپیوندید */
client.on("guildMemberAdd", (member) => {
  const guild = member.guild;
  if (!newUsers[guild.id]) newUsers[guild.id] = new Collection();
  newUsers[guild.id].set(member.id, member.user);

  if (newUsers[guild.id].size > limit) {
    const userlist = newUsers[guild.id].map(userlist => userlist.toString()).join("\n");
    guild.channels.cache.find(channel => channel.name === "welcome").send({embeds: [
      new MessageEmbed()
      .setTitle("Welcome to the server!")
      .setDescription(`${userlist}`)
      .setColor("#2F3136")
      .setAuthor(`${client.user.username}`, client.user.displayAvatarURL())
      .setTimestamp()
    ]
    });
    newUsers[guild.id].clear();
  }
});

client.on("guildMemberRemove", (member) => {
  const guild = member.guild;
  if (newUsers[guild.id].has(member.id)) newUsers.delete(member.id);
});

client.login("BotTokenHere"); // با نشانه وارد شوید، مطمئن شوید که هنگام شروع آن را اضافه کنید
