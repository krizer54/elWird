require('dotenv').config();
const { Telegraf, Scenes, session, Composer, Context, Markup } = require('telegraf');
const { enter, leave } = Scenes.Stage
const { message, callbackQuery } = require('telegraf/filters');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { readFileSync } = require('fs');

const express = require('express');
const mongoose = require('mongoose');
var cron = require('node-cron');
const Schema = mongoose.Schema;

//MODELS 
const Group = require('./models/group.js');
const User = require('./models/user.js');
const QuranPage = require('./models/quran.js');

// تحميل البيانات من JSON
const QuranData = JSON.parse(readFileSync('./db/data/quran.json', 'utf8'));
const AthkarData = JSON.parse(fs.readFileSync('./db/data/adkar.json', 'utf8'));



// const { inboard } = require('./inlineBoards');



const app = express()
// API للآيات
app.get('/api/ayat', (req, res) => {
  var surah = parseInt(req.query.surah);
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
  var quran = JSON.parse(readFileSync('./db/data/quran.json', 'utf8'));;

  var result = quran
    .filter(entry => entry.sura_no === surah && entry.aya_no >= from && entry.aya_no <= to)
    .map(entry => entry.aya_text_emlaey)
    .join(' ');

  res.json({ text: result });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/db', express.static(path.join(__dirname, 'db')));

var PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`));


const bot = new Telegraf(process.env.BOT_TOKEN);
const URL = "https://fluffy-pancake-vj65p4x5x93pr66-3000.app.github.dev/"
mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.log(`mongoose error : ` + err));

// bot.telegram.setWebhook(`${process.env.URL}/bot${process.env.API_TOKEN}`).then(res => {
//     console.log(`webhook was set ${res}`)
// });

// استجابة البحث
// bot.on('inline_query', async (ctx) => {
//     const query = ctx.inlineQuery.query.trim();



app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
bot.use(session());


async function uploadQuranPages(bot, chatId) {
    for (let page = 1; page <= 604; page++) {
        var photoPath = path.join(__dirname, './db/data/images', `${page}.jpg`);

        try {
            var res = await bot.telegram.sendPhoto(chatId, { source: fs.createReadStream(photoPath) }, {
                caption: `📖 Page ${page}`
            });

            var file_id = res.photo?.[2]?.file_id || res.photo.at(-1)?.file_id;
            var exists = await QuranPage.findOne({ page });

            if (!exists) {
                await QuranPage.create({ page, file_id });
                console.log(`✅ Saved file_id for page ${page}`);
            } else {
                console.log(`ℹ️ Page ${page} already saved.`);
            }

            await new Promise(resolve => setTimeout(resolve, 500)); // To avoid rate limits
        } catch (err) {
            console.error(`❌ Error at page ${page}:`, err.message);
        }
    }
}


// uploadQuranPages(bot, "1310425822")




const { startHandler } = require("./src/start.js")
startHandler(bot, Scenes, enter, leave, Markup, User)


const { groupHandler } = require("./src/group.js")
groupHandler(bot, Scenes, enter, leave, Markup, Group)


const { AdhkarsettingsHandler } = require("./src/adhkarSettings.js")
AdhkarsettingsHandler(bot, Group, Scenes, enter, leave, Markup)


const { cronHandler } = require("./src/cron.js")
cronHandler(bot, Group, QuranPage, AthkarData, cron, Scenes, enter, leave, Markup)

const { inlineQuranPhotoHandler } = require("./src/inlineQuranPhoto.js")
inlineQuranPhotoHandler(bot, QuranPage, uuidv4)

const { inlineQuranayaHandler } = require("./src/inlineQuranAya.js");
inlineQuranayaHandler(bot, QuranData, uuidv4)


const { inlineAthkarHandler } = require("./src/inlineAthkar.js");
inlineAthkarHandler(bot, AthkarData, uuidv4)


const { examHandler } = require("./src/exam.js");
examHandler(bot, QuranData, uuidv4)


bot.on("inline_query", async (ctx, next) => {

    const services = [
        {
            category: "@elwirdBot e",
            desc: "✍️ خدمة اختبار الحفظ — Exam",
            message_text: "<b>📘 خدمة elwird e</b>\n\n" +
                "🔹 <u>اختبر نفسك في الحفظ</u>!\n" +
                "أدخل رقم السورة: ثم المدى الذي تريد اختبار نفسك فيه وسيقوم البوت بإنشاء اختبار آلي لمساعدتك على تثبيت الحفظ.\n\n" +
                " مثال لإختبار في سورة الفاتحة الأيات 1-7: "+
                "<i> @elwird e1:1-7 </i>",
            photo: "https://drive.google.com/uc?export=download&id=1ZY4LZAzH5VtJJroAm_WazSr-H6yC3B2p"
        },
        {
            category: "@elwirdBot a",
            desc: "📖 البحث عن آية — Aya",
            message_text: "<b>📖 خدمة elwird a</b>\n\n" +
                "🔍 <b>ابحث عن آية في المصحف</b> بجزء من نصها.\n" +
                "ستحصل على جميع المواضع التي وردت فيها.\n\n" +
                "<i>@elwirdbot a إن الله غفور رحيم</i>",
            photo: "https://drive.google.com/uc?export=download&id=1BpJB33NGUDUA9Mk4KPCtsLG96zywqxID"

        },
        {
            category: "@elwirdBot t",
            desc: "🕌 عرض الأذكار — Thikr",
            message_text: "<b>🕌 خدمة elwird t</b>\n\n" +
                "🔸 <u>عرض أذكار الصباح والمساء</u> بسهولة.\n" +
                "يمكنك استعراض الذكر بنقرة.\n\n" +
                "<i> @elwirdbot t</i>",
            photo: "https://drive.google.com/uc?export=download&id=1srA9kruwOr_0vwC9R3I98YTBQqhcDuVM"

        },
        {
            category: "@elwirdBot p",
            desc: "📄 البحث عن صفحة — Page",
            message_text: "<b>📄 خدمة elwird p</b>\n\n" +
                "🧭 <u>استعرض صفحة من المصحف</u> مباشرة حسب رقمها.\n" +
                "مناسب للمتابعة اليومية.\n\n" +
                "<i> @elwirdbot p 213</i>",
            photo: "https://drive.google.com/uc?export=download&id=1nsY4JyhdDMXC5mUzmUVWXT7jqYiIhJ5y"

        }
    ];

    const results = services.map((el) => {

        // console.log(list)

        return {
            type: 'article',
            id: uuidv4(),
            thumbnail_url: el.photo,
            title: `📖 ${el.category}`,
            description: `${el.desc}`,
            input_message_content: {
                message_text: el.message_text,
                parse_mode: 'HTML',
            },
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
                        { text: `البحث عن صفحة مصحف `, switch_inline_query_current_chat: `p ` },
                    ],
                    [
                        { text: `قائمة الأذكار `, switch_inline_query_current_chat: `t ` },
                        { text: `إختبر حفظك `, switch_inline_query_current_chat: `e1:1-7` },
                    ],
                ]
            }
        };
    })

    await ctx.answerInlineQuery(results, { cache_time: 30 });

    next(ctx)

})

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
    reply_markup: {
        inline_keyboard: [
            [
                { text: '📂 خدمات المجموعات و القنوات', callback_data: 'my_groups' },
            ],
            [
                { text: `خدمات البحث `, switch_inline_query_current_chat: ` ` },
            ],
            [
                { text: `إختبر حفظك للأيات `, web_app:{url:process.env.WEBAPP_URL} },
            ]

        ]
    }
}

bot.command("menu", async (ctx, next) => {
    await ctx.replyWithHTML('⚙️ اختر الخدمة التي تريد:', menuKeyboard);
})

bot.action("Menu", async (ctx, next) => {
    await ctx.answerCbQuery('جاري التحميل...');
    await ctx.editMessageText(' اختر الخدمة التي تريد:', menuKeyboard);
})






bot.catch((err, ctx) => {
    console.error(`❌ Error in update [${ctx.updateType}]:`, err);

    bot.telegram.sendMessage("1310425822", `❌ Error in update [${ctx.updateType}]:${err}`
        , { parse_mode: "HTML" }).then(res => { console.log(res) }).catch(err => { console.log(err) });

});


bot.launch({
    dropPendingUpdates: false,
    allowedUpdates:
        ["message", "callback_query", "message_reaction", "inline_query", "message_reaction_count", "my_chat_member", "chat_member", "chat_join_request", "poll_answer"]
});


module.exports = {
    bot
}


// bot.action(/edit_quran_(morning|evening)_(.+)/, async (ctx) => {
//     await ctx.answerCbQuery("جاري التحميل ...");

//     var isMorning = ctx.match[0].startsWith('edit_quran_morning');
//     console.log(isMorning)
//     var prefix = isMorning ? 'morning' : 'evening';

//     var data = ctx.update.callback_query.data
//     var parts = data.split('_');
//     console.log(parts)


//     var groupId = parts[3];
//     var buttons = [];

//     if (prefix == 'morning') {
//         for (let hour = 1; hour <= 12; hour++) {
//             buttons.push(Markup.button.callback(`${hour}:00`, `set_quran_morning_${groupId}_${hour}`));
//         }
//     } else {
//         for (let hour = 13; hour <= 23; hour++) {
//             buttons.push(Markup.button.callback(`${hour}:00`, `set_quran_evening_${groupId}_${hour}`));
//         }
//     }
//     // console.log(buttons)

//     await ctx.editMessageText(
//         `🕓 اختر توقيت ${isMorning ? 'الصباح' : 'المساء'} لتلقي الورد القرآني:`, Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 4)));
// });