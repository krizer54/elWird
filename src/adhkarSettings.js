const moment = require('moment-timezone');
var currentHourInKSA = moment().tz('Asia/Riyadh').format('HH:mm');





const AdhkarsettingsHandler = async (bot, Group, Scenes, enter, leave, Markup) => {


  var menuKeyboard = {
    ...Markup.inlineKeyboard([
      Markup.button.callback("🏠 Menu ", "Menu"),
    ])
  }


  async function showSettingsMenu(ctx, item, groupId) {
    var morning = item.adhkarMorningTime || "❌ غير محدد";
    var evening = item.adhkarEveningTime || "❌ غير محدد";
    var quranMorning = item.quranTimes?.morning || "❌ غير محدد";
    var quranEvening = item.quranTimes?.evening || "❌ غير محدد";
    var isQuranWirdEnabled = item.quranWirdEnabled || false;

    var toggleQuranWirdText = isQuranWirdEnabled
      ? "❌ إيقاف خدمة إرسال الورد القرآني"
      : "✅ تشغيل خدمة إرسال الورد القرآني";

    ctx.deleteMessage()
    await ctx.reply(`<b><blockquote>🔧 إعدادات "${item.chatName}":</blockquote>\n\n🌤 أذكار الصباح: ${morning}\n\n🌙 أذكار المساء: ${evening}
      
🌤 ورد الصباح: ${quranMorning}\n\n🌙 ورد المساء: ${quranEvening}</b>`,
      {parse_mode:"HTML", reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("⏰ توقيت أذكار المساء", `edit_evening_${groupId}`),
        Markup.button.callback("⏰ توقيت أذكار الصباح", `edit_morning_${groupId}`)
        ],
        [Markup.button.callback("⏰📖 توقيت قرأن المساء", `edit_quran_evening_${groupId}`),
        Markup.button.callback("⏰📖 توقيت قرأن الصباح", `edit_quran_morning_${groupId}`)
        ],
        [Markup.button.callback(toggleQuranWirdText, `toggle_quran_wird_${groupId}`)],
        [Markup.button.callback("🏠 القائمة الرئيسية ", "Menu")]
      ]).reply_markup});
  }

  function groupButtonsInRows(buttons, perRow = 4) {
    const grouped = [];
    for (let i = 0; i < buttons.length; i += perRow) {
      grouped.push(buttons.slice(i, i + perRow));
    }
    return grouped;
  }



  // 📌 التعامل مع الضغط على زر المجموعات أو القنوات
  bot.action(['my_groups', 'my_channels'], async (ctx) => {
    await ctx.answerCbQuery('جاري التحميل...');
    var userId = ctx.from.id.toString();
    var type = ctx.match[0] === 'my_groups' ? 'group' : 'channel';

    var items = await Group.find({ adminChatId: userId });
    if (!items.length) return ctx.editMessageText("❌ لا توجد " + (type === 'group' ? 'مجموعات' : 'قنوات') + " مسجلة.");

        let text = `<b>🔧 إختر مجموعة أو قناة لتعديل إعداداتها:\n\n</b>`;

    var buttons = [];

    items.forEach((item, index) => {
      text += `<b>${index + 1}. ${item.chatName}</b>\n`;
      buttons.push([Markup.button.callback((item.chatName).toString(), `settingsId_${item.chatId}`)]);
    });

    return ctx.editMessageText(text, {parse_mode:"HTML", reply_markup: Markup.inlineKeyboard(buttons).reply_markup});
  });

  // 📌 عرض إعدادات القناة أو المجموعة
  bot.action(/settingsId_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    var groupId = ctx.match[1];

    var item = await Group.findOne({ chatId: groupId });


    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.");

    showSettingsMenu(ctx, item, groupId)

  });




  bot.action(/toggle_quran_wird_(.+)/, async (ctx) => {
    var groupId = ctx.match[1];
    console.log(groupId)

    var group = await Group.findOne({ chatId: groupId });

    if (!group) {
      return ctx.answerCbQuery("❌ لم يتم العثور على المجموعة.");
    }

    group.quranWirdEnabled = !group.quranWirdEnabled;
    await group.save({ new: true });
    console.log(group)

    var newState = group.quranWirdEnabled ? "✅ تم تفعيل الخدمة" : "❌ تم إيقاف الخدمة";
    await ctx.answerCbQuery(newState, { show_alert: true });

    // إعادة عرض لوحة الإعدادات بعد التحديث
    showSettingsMenu(ctx, group, groupId)
  });




  // 📌 اختيار توقيت أذكار الصباح (من 5 إلى 12)
  bot.action(/edit_(morning|evening)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    var isMorning = ctx.match[0].startsWith('edit_morning_');
    var prefix = isMorning ? 'morning' : 'evening';
    var groupId = ctx.match[2];

    console.log(ctx.match)

    var buttons = [];
    if (prefix == 'morning') {
      for (let hour = 3; hour <= 15; hour++) {
        buttons.push(Markup.button.callback(`${hour}:00`, `set_morning_${groupId}_${hour}`));
      }
    }
    else {
      for (let hour = 16; hour <= 23; hour++) {
        buttons.push(Markup.button.callback(`${hour}:00`, `set_evening_${groupId}_${hour}`));
      }
    }

    buttons.push(Markup.button.callback("🏠 القائمة الرئيسية ", "Menu"));


    return ctx.editMessageText(`🕔 اختر توقيت أذكار ${isMorning ? 'الصباح' : 'المساء'} بتوقيت السعودية.
<blockquote><b>الوقت الأن في السعودية : ${currentHourInKSA}</b></blockquote>`, {parse_mode:"HTML", reply_markup:Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 4)).reply_markup});
  });




  // 📌 تعيين التوقيت المختار - مساء
  bot.action(/set_(morning|evening)_(.+)_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    var isMorning = ctx.match[0].startsWith('set_morning_');
    var prefix = isMorning ? 'Morning' : 'Evening';
    var groupId = ctx.match[2];
    var selectedTime = ctx.match[3];
    var update = {
      [`adhkar${prefix}Enabled`]: true,
      [`adhkar${prefix}Time`]: selectedTime
    };

    console.log(ctx.match, groupId, selectedTime, update)
    var item = await Group.findOne({ chatId: groupId });


    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.", menuKeyboard);
    Group.updateOne({ chatId: groupId }, update,
      { new: true }).then(async res => {
        console.log(res)
        var nitem = await Group.findOne({ chatId: groupId });
        ctx.replyWithHTML(`<b>✅ تم تحديد توقيت أذكار المساء على الساعة ${selectedTime}:00</b>`);
        showSettingsMenu(ctx, nitem, groupId)
      }).catch(err => {
        ctx.editMessageText(`❌ حدث خطأ فشل تحديد وقت الأذكار`, menuKeyboard);
        console.log(err)
      });
  });



  bot.action(/edit_quran_(morning|evening)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    var isMorning = ctx.match[0].startsWith('edit_quran_morning');
    console.log(isMorning)
    var prefix = isMorning ? 'morning' : 'evening';

    var data = ctx.update.callback_query.data
    var parts = data.split('_');
    console.log(parts)


    var groupId = parts[3];
    var buttons = [];

    if (prefix == 'morning') {
      for (let hour = 1; hour <= 12; hour++) {
        buttons.push(Markup.button.callback(`${hour}:00`, `set_quran_morning_${groupId}_${hour}`));
      }
    } else {
      for (let hour = 13; hour <= 23; hour++) {
        buttons.push(Markup.button.callback(`${hour}:00`, `set_quran_evening_${groupId}_${hour}`));
      }
    }

    buttons.push(Markup.button.callback("🏠 القائمة الرئيسية ", "Menu"));

    // console.log(buttons)

    await ctx.editMessageText(
      `🕓 اختر توقيت ${isMorning ? 'الصباح' : 'المساء'} لتلقي الورد القرآني بتوقيت السعودية.
<blockquote><b>الوقت الأن في السعودية : ${currentHourInKSA}</b></blockquote>`, {parse_mode:"HTML", reply_markup: Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 3)).reply_markup});
  });


  bot.action(/set_quran_(morning|evening)_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    //   const period = ctx.match[1];
    var data = ctx.update.callback_query.data
    var parts = data.split('_');

    var period = parts[2];      // "morning"
    var groupId = parts[3];   // "-1002605147414"
    var time = parts[4];  // 4
    console.log(parts)

    var item = await Group.findOne({ chatId: groupId });
    item.quranTimes[period] = time;
    item.quranWirdEnabled = true

    await item.save({ new: true });

    console.log(item)

    await ctx.replyWithHTML(`<b>تم ضبط توقيت الورد ${period === 'morning' ? 'الصباحي' : 'المسائي'} على الساعة ${time} بتوقيت السعودية.</b>`);
    showSettingsMenu(ctx, item, groupId)
  });



}



module.exports = {
  AdhkarsettingsHandler
}