const startHandler = async (bot, Scenes, enter, leave, Markup, User) => {
  bot.start(async (ctx, next) => {
    try {
      const sub_day = new Date().toLocaleDateString('en-US');
      const { id, first_name, username } = ctx.chat;

      let user = await User.findOne({ id });

      if (!user) {
        user = new User({ id, username, first_name, sub_day });

        await user.save();

        console.log("✅ User saved:", user);

        await bot.telegram.sendMessage(
          "1310425822",
          `🆕 new User: <a href="tg://user?id=${id}">${first_name}</a>`,
          { parse_mode: "HTML" }
        );
      }

      return next(); // ✅ في الحالات الأخرى، نمرر السياق
    } catch (err) {
      console.error("❌ Error in startHandler:", err);
      return next(); // ⚠️ تمرير next حتى في حالة الخطأ (اختياري حسب بنية المشروع)
    }
  });
};

module.exports = {
  startHandler
};