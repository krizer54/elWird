const inlineAthkarHandler = (bot, AthkarData,uuidv4) => {

  const adhkarMessage = (category) => {
    var adhkarList = AthkarData[category]
    // إعداد الرسالة
    let message = `<b>${category}</b>\n\n`;

    adhkarList.forEach((item, index) => {
      message += `<blockquote><b>${item.content} (${item.count})</b>\n</blockquote>`;
      message += `\n`;
    });
    return message
  }


  bot.inlineQuery(/^t/, async (ctx,next) => {
    var categories = [
      { "category": "أذكار الصباح", "desc": "حصن للإنسان من الشيطان وشرور الدنيا، وتجلب الطمأنينة والسكينة للقلب" },
      { "category": "أذكار الاستيقاظ", "desc": "تجلب الخير والبركة للمسلم في يومه، وتحميه من الشرور" },
      { "category": "أذكار المساء", "desc": "تحصّن المسلم من الشرور، وتجلب له الأجر والثواب" },
      { "category": "أذكار النوم", "desc": "أذكار النوم تحمي من شرور الشيطان وتوسوساته" },
      { "category": "أذكار بعد الصلاة", "desc": "سبب لمغفرة الذنوب، ورفعة الدرجات، ودفع الهموم والغموم" },
      { "category": "تسابيح", "desc": "تسابيح" },
      { "category": "أدعية قرآنية", "desc": "أدعية قرآنية" },
      { "category": "أدعية الأنبياء", "desc": "أدعية الأنبياء" },
    ]

    const results = categories.map((el) => {
      var list = adhkarMessage(el.category)
      // console.log(list)

      return {
        type: 'article',
        id: uuidv4(),
        title: `📖 ${el.category}`,
        description: `${el.desc}`,
        input_message_content: {
          message_text: list,
          parse_mode: 'HTML',
        },
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
              { text: `قائمة الأذكار `, switch_inline_query_current_chat: `t ` },
            ],
            [
              { text: `البحث عن صفحة مصحف `, switch_inline_query_current_chat: `p ` },
            ],
          ]
        }
      };
    })

    await ctx.answerInlineQuery(results, { cache_time: 30 });

    next(ctx)

  })



};

module.exports = {
  inlineAthkarHandler
};