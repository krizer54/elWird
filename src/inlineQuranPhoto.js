//const { bot } = require("../index");
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const inlineQuranPhotoHandler = (bot, QuranPage) => {


  bot.inlineQuery(/^p/, async (ctx, next) => {
    var match = ctx.inlineQuery.query.match(/^p/);
    var start = parseInt(match[1]);
    var end = parseInt(match[2]) || start;
    var offset = +ctx.inlineQuery.offset || 0;
    var limit = 50;

    let pagesToShow;

    if (!start) {
      return ctx.answerInlineQuery([
        {
          type: 'article',
          id: 1,
          title: '✍️ أكتب رقم الصفحة للبحث عنها',
          input_message_content: {
            message_text: '🔍 الرجاء كتابة رقم الصفحة للبحث عنها في القرآن الكريم.',
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
                { text: 'بحث عن صفحة', switch_inline_query_current_chat: 'p ' }
              ]
            ]
          }
        },
      ]);
    } else if (start && !end) {
      // صفحة واحدة
      pagesToShow = await QuranPage.find({ page: start });
    } else {
      // مجال صفحات
      var minPage = Math.min(start, end);
      var maxPage = Math.max(start, end);
      pagesToShow = await QuranPage.find({
        page: { $gte: minPage, $lte: maxPage }
      }).sort({ page: 1 }).limit(50);
    }

    var results = pagesToShow.map((page) => ({
      type: 'photo',
      id: String(page.page),
      photo_file_id: page.file_id,
      title: `الصفحة ${page.page}`,
      caption: `📖 الصفحة ${page.page}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'بحث عن أية', switch_inline_query_current_chat: 'a ' },
            { text: 'بحث عن صفحة', switch_inline_query_current_chat: 'p ' }
          ]
        ]
      }
    }));

    var next_offset = offset + limit < 605 ? String(offset + limit) : undefined;
    await ctx.answerInlineQuery(results.slice(offset, next_offset), { next_offset, cache_time: 10 });
    next(ctx)
  });
};

module.exports = {
  inlineQuranPhotoHandler
};