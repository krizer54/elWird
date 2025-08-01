const examHandler = (bot, QuranData, uuidv4) => {

    bot.inlineQuery(/^e/, async (ctx) => {

        const surahNames = [
            "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف",
            "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل",
            "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان",
            "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبإ",
            "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان",
            "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم",
            "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة",
            "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
            "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات",
            "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى",
            "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق",
            "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة",
            "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص",
            "الفلق", "الناس"
        ];


        function getSura(suraNumber, from, to) {
            // استخراج جميع الآيات التابعة للسورة المحددة
            var suraAyat = QuranData.filter(entry => entry.sura_no === suraNumber && entry.aya_no >= from && entry.aya_no <= to);

            if (suraAyat.length === 0) return null;

            // جلب اسم السورة من أول آية (لأن الاسم مكرر في كل الآيات)
            var suraName = suraAyat[0].sura_name_ar;

            // استخراج الآيات فقط (نص بالرسم الإملائي مثلاً)
            var ayat = suraAyat.map(entry => entry.aya_text_emlaey).join(' ');

            return {
                name: suraName,
                ayat: ayat
            };
        }

        var input = ctx.inlineQuery.query.split('');

        var query = ctx.inlineQuery.query.trim();

        var mitch = query.match(/^e(\d+):(\d+)-(\d+)/);
        var match = query.match(/^e(\d+):(\d+)-(\d+)\s+(.+)$/);
        var buttonMessage

        console.log("match: " + match)

        console.log("mitch: " + mitch)
        console.log(input)
        console.log(!mitch && input[0] == "e")

        if (!mitch && input[0] == "e") {
            var offset = +ctx.inlineQuery.offset || 0;
            var limit = 50;
            var results = surahNames.map((el, index) => {
                index++
                return {
                    type: 'article',
                    id: uuidv4(),
                    // thumbnail_url: "https://drive.google.com/uc?export=download&id=1Py30P-FCVkwljQ7oXNNNx_WJ52ar3Nsk",
                    title: `📖 ${el}`,
                    description: `رقم السورة ${index}`,
                    input_message_content: {
                        message_text: `إضغط على الزر لإختبار نفسك في الأيات 1-3 من سورة ${el} `,
                        parse_mode: 'HTML',
                    },
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: `إختبار في سورة ${el}`, switch_inline_query_current_chat: `e${index}:1-3  ` },
                            ]
                        ]
                    }
                };
            })

            var next_offset = offset + limit < 114 ? String(offset + limit) : undefined;


            return await ctx.answerInlineQuery(results.slice(offset, next_offset), { cache_time: 0 });

            //         return ctx.answerInlineQuery([{
            //             type: 'article',
            //             id: 'invalid_format',
            //             title: '❌ تنسيق غير صحيح',
            //             description: 'يرجى كتابة الاستعلام بهذا الشكل: e2:10-12',
            //             input_message_content: {
            //                 message_text: `❌ تنسيق غير صحيح. جرب: e2:10-12
            // حيث أول رقم بعد حرف eيرمز لرقم السورة في المصحف و مايعد النقطتين هو مجال الأيات التي تريد إختبار نفسك فيها .`
            //             }
            //         }]);
        }

        if (!match && mitch) {
            buttonMessage = ""
            var results = [
                {
                    type: 'article',
                    id: 1,
                    title: "بدأ التحدي إبدأ كتابة الأيات",
                    thumbnail_url: "https://drive.google.com/uc?export=download&id=137WgkdpRbF9NFMK5HQkcjjd-mqLGbweU",
                    description: "بسم الله ",
                    input_message_content: {
                        message_text: `<b>📖 واصل المراجعة وبارك الله فيك.</b>`,
                        parse_mode: 'HTML'
                    },




                }
            ];

            buttonMessage = `اختبار في ${surahNames[mitch[1] - 1]} الآيات (${mitch[2]}–${mitch[3]})`

            ctx.answerInlineQuery(results, {
                cache_time: 0,
                button: {
                    text: buttonMessage,
                    start_parameter: "start"
                }
            });
        }


        var surahNum = parseInt(mitch[1]);
        var fromAyah = parseInt(mitch[2]);
        var toAyah = parseInt(mitch[3]);
        if (!match) return
        let title, description, thumbURL, message_text,buttonObj;



        var userWords = match[4].trim().split(/\s+/);

        var surah = await getSura(surahNum, fromAyah, toAyah)
        var surahName = surah.name;
        // var resultTitle = `اختبار في ${surahName} الآيات (${fromAyah}–${toAyah})`;
        var resultTitle = `اختبار في ${surahNames[mitch[1] - 1]} الآيات (${mitch[2]}–${mitch[3]})`



        var ayahs = surah.ayat
        let originalWords = ayahs.trim().split(/\s+/);

        let isCorrect = true;
        let errorIndex = -1;
        let correctCount = 0;
        var total = originalWords.length;

        // مقارنة كلمة بكلمة
        for (let i = 0; i < Math.min(userWords.length, originalWords.length); i++) {
            if (userWords[i] === originalWords[i]) {
                correctCount++;
                console.log("correctCount: " + correctCount)
            } else if (originalWords[i].startsWith(userWords[i])) {
                isCorrect = true;
            }
            else {
                isCorrect = false;
                errorIndex = i;
                break;
            }
        }

        var percentage = ((correctCount / total) * 100).toFixed(1);

        // ✅ شرط النجاح الكامل:
        var isCompletelyCorrect =
            isCorrect &&
            userWords.length >= originalWords.length &&
            correctCount === originalWords.length;
        console.log("isCompletelyCorrect: " + isCompletelyCorrect)


        if (isCorrect && !isCompletelyCorrect) {
            console.log(userWords)
            title = `✅ أحسنت! (${percentage}%)`;
            description = `كل الكلمات صحيحة!`;
            thumbURL = 'https://cdn-icons-png.flaticon.com/512/845/845646.png';
            message_text = `<blockquote><b>✅ أنت في المسار الصحيح لقد حققت ${percentage}% من الإختبار</b></blockquote>
${userWords.join(" ")}`
            buttonObj = { text: "الإستمرار في الإختبار", switch_inline_query_current_chat: `e${surahNum}:${fromAyah}-${toAyah}
${userWords.join(" ")}`}
        } else {
            description = '❌ خطأ عند الكلمة';
            let wrongWord = userWords[errorIndex] || '[كلمة ناقصة]';
            let expectedWord = originalWords[errorIndex] || '[كلمة زائدة]';
            title = `الكلمة الخاطئة: (${wrongWord}) بدلًا من (${expectedWord})`;
            thumbURL = 'https://cdn-icons-png.flaticon.com/512/1828/1828665.png';
            message_text = `<blockquote><b>❌ حاول مرة أخرى لقد حققت ${percentage}% من الإختبار</b></blockquote>
${userWords.join(" ")}`
  
            buttonObj = { text: "الإستمرار في الإختبار", switch_inline_query_current_chat: `e${surahNum}:${fromAyah}-${toAyah}
${userWords.join(" ")}` }

        }

        console.log(correctCount === originalWords.length)
        console.log("correctCount2: " + correctCount)
        console.log("originalWords: " + originalWords.length)



        if (isCompletelyCorrect) {
            title = "🎉 ما شاء الله! ✅ نجحت في الاختبار"
            description = "لقد كتبت الآيات بدقة دون أي خطأ — أحسنت!"
            thumbURL = "https://drive.google.com/uc?export=download&id=1H7u3_6fY431LuD68q5yyOBIa90DEYwFF"
            message_text = `<blockquote><b>تحدي حفظ الأيات ${fromAyah}-${toAyah} من سورة ${surahName}</b></blockquote>
<b>🎯 أحسنت! أكملت كتابة الآيات دون أخطاء.
📖 واصل المراجعة وبارك الله فيك.</b>`
            buttonObj = { text: "تحديد إختبار جديد", switch_inline_query_current_chat: 'e' }

        }


        var results = [
            {
                type: 'article',
                id: 1,
                title,
                thumbnail_url: thumbURL,
                description: description,
                input_message_content: {
                    message_text,
                    parse_mode: 'HTML'
                },
                reply_markup: {
                    inline_keyboard: [
                        [
                            buttonObj
                        ]
                    ]
                }



            }
        ];

        ctx.answerInlineQuery(results, {
            cache_time: 0,
            button: {
                text: resultTitle,
                start_parameter: "start"
            }
        });
    });
}

module.exports = {
    examHandler
};