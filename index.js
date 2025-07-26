require('dotenv').config();
const { Telegraf, Scenes, session, Composer, Context, Markup } = require('telegraf');
const { enter, leave } = Scenes.Stage
const { message } = require('telegraf/filters');

const express = require('express');
const mongoose = require('mongoose');
var cron = require('node-cron');
const Schema = mongoose.Schema;

//MODELS 
const Group = require('./models/group.js');
const User = require('./models/user.js');



// const { inboard } = require('./inlineBoards');

const app = express()


const bot = new Telegraf(process.env.BOT_TOKEN);
const URL = "https://fluffy-pancake-vj65p4x5x93pr66-3000.app.github.dev/"
mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.log(`mongoose error : ` + err));

// bot.telegram.setWebhook(`${process.env.URL}/bot${process.env.API_TOKEN}`).then(res => {
//     console.log(`webhook was set ${res}`)
// });




app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
bot.use(session());








const { startHandler } = require("./src/start.js")
startHandler(bot, Scenes, enter, leave, Markup, User)


const { groupHandler } = require("./src/group.js")
groupHandler(bot, Scenes, enter, leave, Markup, Group)


const { AdhkarsettingsHandler } = require("./src/adhkarSettings.js")
AdhkarsettingsHandler(bot, Group, Scenes, enter, leave, Markup)


const { cronHandler } = require("./src/cron.js")
cronHandler(bot, Group, cron, Scenes, enter, leave, Markup)




// const { useHandler } = require('./src/use')
// useHandler(bot, User, Mostala7at);

// bot.use(ctx => { console.log(ctx) });


// bot.telegram.sendMessage("1310425822",
//     `<a href="https://t.me/toQuizBot?start=quizId_"682d7d50cc4cad69ea112946\>إضغط هنا لتجربة الكويز من جديد</a>`,
//     {parse_mode:'HTML',link_preview_options:{is_disabled:true}})

// bot.use(ctx => {
//     User.find({id:"1310425822"}).then((err, result) => {
//         console.log(result)
//     }).catch(err =>{
//         console.log(err)

//     })

// })

var menuKeyboard = {
    ...Markup.inlineKeyboard([
        Markup.button.callback("🏠 Menu ", "Menu"),
    ])
}

bot.command("menu", async (ctx, next) => {
    await ctx.replyWithHTML('⚙️ اختر الخدمة التي تريد:', Markup.inlineKeyboard([
        [Markup.button.callback('📂 مجموعاتي', 'my_groups')]
    ]));
})

bot.action("Menu", async (ctx, next) => {
    await ctx.replyWithHTML(' اختر الخدمة التي تريد:', Markup.inlineKeyboard([
        [Markup.button.callback('📂 مجموعاتي', 'my_groups')]]
    ));
})






bot.catch((err, ctx) => {
    console.error(`❌ Error in update [${ctx.updateType}]:`, err);

    bot.telegram.sendMessage("1310425822", `❌ Error in update [${ctx.updateType}]:${err}`
        , { parse_mode: "HTML" }).then(res => { console.log(ress) }).catch(err => { console.log(err) });

});


bot.launch({
    dropPendingUpdates: false,
    allowedUpdates:
        ["message", "callback_query", "message_reaction", "message_reaction_count", "my_chat_member", "chat_member", "chat_join_request", "poll_answer"]
});


module.exports = {
    bot
}
