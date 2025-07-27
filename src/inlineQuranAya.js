//const { bot } = require("../index");
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const inlineQuranayaHandler = (bot, QuranData) => {

  bot.inlineQuery(/^a/, async (ctx) => {
    var input = ctx.inlineQuery.query.split(' ');
    input.shift();
    var query = input.join(' ');
    console.log(query)
    var offset = +ctx.inlineQuery.offset || 0;
    var limit = 50;


    if (!query || query.length < 2) {
      return ctx.answerInlineQuery([
        {
          type: 'article',
          id: 1,
          title: '✍️ أكتب محتوى الآية للبحث عنها',
          input_message_content: {
            message_text: '🔍 الرجاء كتابة جزء من الآية للبحث عنها في القرآن الكريم.',
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
              ],

            ]
          }
        },
      ]);
    }

    const results = QuranData
      .filter((aya) => aya.aya_text_emlaey.includes(query))
      .map((aya) => {
        return {
          type: 'article',
          id: uuidv4(),
          title: `📖 ${aya.aya_text_emlaey}`,
          description: `سورة ${aya.sura_name_ar} - آية ${aya.aya_no}`,
          input_message_content: {
            message_text: `<blockquote><b>${aya.aya_text_emlaey}</b></blockquote>\n\n📖<b>${aya.sura_name_ar}:${aya.aya_no} (صفحة ${aya.page})</b>`,
            parse_mode: 'HTML',
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
                { text: `عرض الصفحة ${aya.page} `, switch_inline_query_current_chat: `p ${aya.page}` },
              ],
            ]
          }
        };
      });
    var next_offset = offset + limit < 150 ? String(offset + limit) : undefined;

    // await ctx.answerInlineQuery(results, { cache_time: 0 });
    await ctx.answerInlineQuery(results.slice(offset, next_offset), { next_offset, cache_time: 10 });
    next(ctx)
  });


};

module.exports = {
  inlineQuranayaHandler
};