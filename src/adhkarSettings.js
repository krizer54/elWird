const settingsHandler = async (bot, Group, Scenes, enter, leave, Markup) => {
var menuKeyboard = {
    ...Markup.inlineKeyboard([
        Markup.button.callback("🏠 Menu ", "Menu"),
    ])
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
    await ctx.answerCbQuery();
    var groupId = ctx.match[1];

    var item = await Group.findOne({ chatId: groupId });


    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.");


    var morning = item.adhkarMorningTime || '⏰ غير محدد';
    var evening = item.adhkarEveningTime || '⏰ غير محدد';

    return ctx.editMessageText(`🔧 إعدادات "${item.chatName}":\n\n🌤 أذكار الصباح: ${morning}\n🌙 أذكار المساء: ${evening}`, Markup.inlineKeyboard([
      [Markup.button.callback("🌅تحديد توقيت أذكار الصباح", `edit_morning_${groupId}`)],
      [Markup.button.callback("🌇تحديد توقيت أذكار المساء", `edit_evening_${groupId}`)],
    ]));
  });

  // 📌 اختيار توقيت أذكار الصباح (من 5 إلى 12)
  bot.action(/edit_morning_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const groupId = ctx.match[1];

    const buttons = [];
    for (let hour = 5; hour <= 12; hour++) {
      buttons.push([Markup.button.callback(`${hour}:00`, `set_morning_${groupId}_${hour}`)]);
    }

    return ctx.editMessageText("🕔 اختر توقيت أذكار الصباح:", Markup.inlineKeyboard(buttons));
  });

  // 📌 اختيار توقيت أذكار المساء (من 16 إلى 22)
  bot.action(/edit_evening_(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const groupId = ctx.match[1];

    const buttons = [];
    for (let hour = 16; hour <= 22; hour++) {
      buttons.push([Markup.button.callback(`${hour}:00`, `set_evening_${groupId}_${hour}`)]);
    }

    return ctx.editMessageText("🕔 اختر توقيت أذكار المساء:", Markup.inlineKeyboard(buttons));
  });

  // 📌 تعيين التوقيت المختار - صباح
  bot.action(/set_morning_(.+)_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const groupId = ctx.match[1];
    const selectedTime = ctx.match[2];

    var item = await Group.findOne({ chatId: groupId });

    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.",menuKeyboard);

    Group.updateOne({ chatId: groupId }, {
      adhkarMorningEnabled: true,
      adhkarMorningTime: selectedTime
    },
    {new: true }).then(res => {
      console.log(res)

      ctx.editMessageText(`✅ تم تحديد توقيت أذكار الصباح على الساعة ${selectedTime}:00`,menuKeyboard);
    }).catch(err => {
      ctx.editMessageText(`❌ حدث خطأ فشل تحديد وقت الأذكار`,menuKeyboard);
      console.log(err)
    });;

  });

  // 📌 تعيين التوقيت المختار - مساء
  bot.action(/set_evening_(.+)_(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const groupId = ctx.match[1];
    const selectedTime = ctx.match[2];

    var item = await Group.findOne({ chatId: groupId });

    if (!item) return ctx.reply("❌ لم يتم العثور على هذه المجموعة.",menuKeyboard);
    Group.updateOne({ chatId: groupId }, {
      adhkarEveningEnabled: true,
      adhkarEveningTime: selectedTime
    },
    {new: true }).then(res => {
      console.log(res)

      ctx.editMessageText(`✅ تم تحديد توقيت أذكار المساء على الساعة ${selectedTime}:00`,menuKeyboard);
    }).catch(err => {
      ctx.editMessageText(`❌ حدث خطأ فشل تحديد وقت الأذكار`,menuKeyboard);
      console.log(err)
    });
  });



}



module.exports = {
  settingsHandler
}