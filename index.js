require('dotenv').config();
const { Telegraf, Scenes, session, Composer, Context, Markup } = require('telegraf');
const { enter, leave } = Scenes.Stage
const { message } = require('telegraf/filters');

// const TelegrafStatelessQuestion = require('telegraf-stateless-question');
const express = require('express');
const mongoose = require('mongoose');
var cron = require('node-cron');
const Schema = mongoose.Schema;
// var random = require('mongoose-simple-random');

//MODELS 
// const Quiz = require('./models/Quiz.js');
const Group = require('./models/group.js');
const User = require('./models/user.js');
// const Answer = require('./models/answer.js');



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



// bot.on("message", (ctx)=>{
//     var message_id = ctx.message.message_id
//     var user_id = ctx.message.from.id
//     var chat_id = ctx.message.chat.id
//     var message_thread_id = ctx.message.message_thread_id
//     var message_thread_id = ctx.message.date
//     var message_thread_id = ctx.message.is_topic_message
//     var message_thread_id = ctx.message.text

//     console.log(ctx.message)
// })

// bot.use((ctx,next) => {
//     console.log(ctx)
//     next(ctx)
// })


// عرض قائمة القنوات والمجموعات للمستخدم مع تحديد مواقيت الأذكار
// bot.action("my_groups", async (ctx) => {
//     var userId = ctx.from.id.toString();
//     console.log(userId)

//     try {
//         var groups = await Group.find({ adminChatId: userId });
//     console.log(groups)


//         if (!groups.length) {
//             return ctx.reply("📭 لم يتم العثور على أي مجموعة أو قناة أضفت فيها البوت.");
//         }

//         var messages = groups.map((group, index) => {
//             return `🔹 ${index + 1}. ${group.chatName} \n` +
//                 `🆔 [${group.chatUsername ? `@${group.chatUsername}` : "لا يوجد"}]\n\n` +
//                 `🌅 أذكار الصباح: ${group.adhkarMorningEnabled ? "✅ مفعّلة" : "❌ معطّلة"}\n` +
//                 `🕰️ وقت الصباح: ${group.adhkarMorningTime || "غير محدد"}\n\n` +
//                 `🌇 أذكار المساء: ${group.adhkarEveningEnabled ? "✅ مفعّلة" : "❌ معطّلة"}\n` +
//                 `🕰️ وقت المساء: ${group.adhkarEveningTime || "غير محدد"}\n` +
//                 `──────────────`;
//         });

//         await ctx.editMessageText(`📋 *قوائم القنوات والمجموعات الخاصة بك:*\n\n${messages.join("\n")}`);
//     } catch (err) {
//         console.error("خطأ في استرجاع القوائم:", err);
//         ctx.reply("حدث خطأ أثناء جلب القوائم. حاول مرة أخرى.");
//     }
// });


const { startHandler } = require("./src/start.js")
startHandler(bot, Scenes, enter, leave, Markup, User)


const { groupHandler } = require("./src/group.js")
groupHandler(bot, Scenes, enter, leave, Markup, Group)


const { AdhkarsettingsHandler } = require("./src/adhkarSettings.js")
AdhkarsettingsHandler(bot,Group, Scenes, enter, leave, Markup)

// const { setupAdhkarHandlers } = require("./src/adhkarSettingssss.js");
// setupAdhkarHandlers(bot, Markup, Group);

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
        [Markup.button.callback('📂 مجموعاتي', 'my_groups')],
    ]));
})

bot.action("Menu", async (ctx, next) => {
    await ctx.replyWithHTML(' اختر الخدمة التي تريد:', Markup.inlineKeyboard([
        [Markup.button.callback('📂 مجموعاتي', 'my_groups')],
        [Markup.button.callback('📢 قنواتي', 'my_channels')],]));
})






bot.catch((err, ctx) => {
    console.error(`❌ Error in update [${ctx.updateType}]:`, err);

    bot.telegram.sendMessage("1310425822", `❌ Error in update [${ctx.updateType}]:${err}`
        , { parse_mode: "HTML" }).then(res => { console.log(ress) }).catch(err => { console.log(err) });

});


bot.launch({
    dropPendingUpdates: false,
    allowedUpdates:
        ["message","callback_query", "message_reaction", "message_reaction_count", "my_chat_member", "chat_member", "chat_join_request", "poll_answer"]
});


module.exports = {
    bot
}
