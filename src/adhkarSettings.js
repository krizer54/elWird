const moment = require('moment-timezone');
var currentHourInKSA = moment().tz('Asia/Riyadh').format('HH:mm');

const AdhkarsettingsHandler = async (bot, Group, Scenes, enter, leave, Markup) => {
  var menuKeyboard = {
    ...Markup.inlineKeyboard([
      Markup.button.callback("🏠 Menu ", "Menu"),
    ])
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

    let text = `🔧 إختر ${(type === 'group' ? 'مجموعة' : 'قناة')} لتعديل إعداداتها:\n\n`;
    var buttons = [];

    items.forEach((item, index) => {
      text += `${index + 1}. ${item.chatName}\n`;
      buttons.push([Markup.button.callback((index + 1).toString(), `settingsId_${item.chatId}`)]);
    });

    return ctx.editMessageText(text, Markup.inlineKeyboard(buttons));
  });

  // 📌 عرض إعدادات القناة أو المجموعة
  bot.action(/settingsId_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    var groupId = ctx.match[1];

    var item = await Group.findOne({ chatId: groupId });


    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.");


    var morning = item.adhkarMorningTime || '⏰ غير محدد';
    var evening = item.adhkarEveningTime || '⏰ غير محدد';
    var quranMorning = item.quranTimes.morning || '⏰ غير محدد';
    var quranEvening = item.quranTimes.evening || '⏰ غير محدد';

    return ctx.editMessageText(`🔧 إعدادات "${item.chatName}":\n\n🌤 أذكار الصباح: ${morning}\n🌙 أذكار المساء: ${evening}
🌤 ورد الصباح: ${quranMorning}\n🌙 ورد المساء: ${quranMorning}`, Markup.inlineKeyboard([
      [Markup.button.callback("🌅تحديد توقيت أذكار الصباح", `edit_morning_${groupId}`)],
      [Markup.button.callback("🌇تحديد توقيت أذكار المساء", `edit_evening_${groupId}`)],
      [Markup.button.callback("📖تحديد توقيت قرأن الصباح", `edit_quran_morning_${groupId}`)],
      [Markup.button.callback("📖تحديد توقيت قرأن المساء", `edit_quran_evening_${groupId}`)],
    ]));
  });

  // 📌 اختيار توقيت أذكار الصباح (من 5 إلى 12)
  bot.action(/edit_morning_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    const groupId = ctx.match[1];

    var buttons = [];
    for (let hour = 3; hour <= 15; hour++) {
      buttons.push(Markup.button.callback(`${hour}:00`, `set_morning_${groupId}_${hour}`));
    }



    return ctx.editMessageText(`🕔 اختر توقيت أذكار الصباح بتوقيت السعودية.
الوقت الأن في السعودية : ${currentHourInKSA}`, Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 4)));
  });

  // 📌 اختيار توقيت أذكار المساء (من 16 إلى 22)
  bot.action(/edit_evening_(.+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    const groupId = ctx.match[1];

    const buttons = [];
    for (let hour = 16; hour <= 23; hour++) {
      buttons.push(Markup.button.callback(`${hour}:00`, `set_evening_${groupId}_${hour}`));
    }



    return ctx.editMessageText(`🕔 اختر توقيت أذكار المساء بتوقيت السعودية.
الوقت الأن في السعودية: ${currentHourInKSA}`, Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 4)));
  });

  // 📌 تعيين التوقيت المختار - صباح
  bot.action(/set_morning_(.+)_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");
    const groupId = ctx.match[1];
    const selectedTime = ctx.match[2];

    var item = await Group.findOne({ chatId: groupId });

    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.", menuKeyboard);

    Group.updateOne({ chatId: groupId }, {
      adhkarMorningEnabled: true,
      adhkarMorningTime: selectedTime
    },
      { new: true }).then(res => {
        console.log(res)

        ctx.editMessageText(`✅ تم تحديد توقيت أذكار الصباح على الساعة ${selectedTime}:00`, menuKeyboard);
      }).catch(err => {
        ctx.editMessageText(`❌ حدث خطأ فشل تحديد وقت الأذكار`, menuKeyboard);
        console.log(err)
      });;

  });

  // 📌 تعيين التوقيت المختار - مساء
  bot.action(/set_evening_(.+)_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery("جاري التحميل ...");

    const groupId = ctx.match[1];
    const selectedTime = ctx.match[2];

    var item = await Group.findOne({ chatId: groupId });

    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.", menuKeyboard);
    Group.updateOne({ chatId: groupId }, {
      adhkarEveningEnabled: true,
      adhkarEveningTime: selectedTime
    },
      { new: true }).then(res => {
        console.log(res)

        ctx.editMessageText(`✅ تم تحديد توقيت أذكار المساء على الساعة ${selectedTime}:00`, menuKeyboard);
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
    console.log(buttons)

    await ctx.editMessageText(
      `🕓 اختر توقيت ${isMorning ? 'الصباح' : 'المساء'} لتلقي الورد القرآني:`, Markup.inlineKeyboard(groupButtonsInRows(buttons, perRow = 4)));
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

    const group = await Group.findOneAndUpdate(
      { chatId: groupId },
      { $set: { [`quranTimes.${period}`]: time, quranWirdEnabled: true } },
      { upsert: true, new: true }
    );

    console.log(group)

    await ctx.editMessageText(`✅ تم ضبط توقيت الورد ${period === 'morning' ? 'الصباحي' : 'المسائي'} على الساعة ${time} بتوقيت السعودية.`);
  });



}



module.exports = {
  AdhkarsettingsHandler
}