const moment = require('moment-timezone');

const fs = require('fs');
const path = require('path');

const cronHandler = async (bot, Group, QuranPage,AthkarData, cron, Scenes, enter, leave, Markup) => {

    const photoPath = path.join(__dirname, '../db/athkarPhoto', 'athkarEvening.jpg');


    function splitMessage(text, maxLength = 4000) {
        const parts = [];
        let remainingText = text;

        while (remainingText.length > maxLength) {
            // نحاول القطع عند آخر سطر أو جملة مناسبة قبل الحد الأقصى
            let splitIndex = remainingText.lastIndexOf('\n', maxLength);
            if (splitIndex === -1) {
                splitIndex = remainingText.lastIndexOf('. ', maxLength);
            }
            if (splitIndex === -1 || splitIndex < maxLength * 0.5) {
                splitIndex = maxLength;
            }

            parts.push(remainingText.slice(0, splitIndex).trim());
            remainingText = remainingText.slice(splitIndex).trim();
        }

        if (remainingText.length > 0) {
            parts.push(remainingText);
        }

        return parts;
    }

    // الدالة لإرسال أذكار الصباح أو المساء حسب التصنيف
    async function sendAdhkarByCategory(bot, chatId, category) {
        try {

            // التحقق من وجود التصنيف
            var adhkarList = AthkarData[category];
            if (!adhkarList || !Array.isArray(adhkarList)) {
                return console.log(`❌ لم يتم العثور على أذكار في هذا التصنيف. ${category}`);
            }

            // إعداد الرسالة
            let message = `<b>${category}</b>\n\n`;

            adhkarList.forEach((item, index) => {
                message += `<blockquote><b>${item.content} (${item.count})</b>\n</blockquote>`;
                message += `\n`;
            });

            var parts = splitMessage(message);

            for (const part of parts) {
                await bot.telegram.sendMessage(chatId, part + `\n<b>@elWirdBot</b>`, { parse_mode: 'HTML' }).then(res => { console.log(res) }).catch(err => { console.log(err) });
            }

            // إرسال الرسالة

        } catch (err) {
            console.error('❌ خطأ أثناء إرسال الأذكار:', err.message);
            bot.telegram.sendMessage(chatId, 'حدث خطأ أثناء تحميل الأذكار.');
        }
    }


    async function getFileIdsFromPage(startPage) {
        // startPage = (startPage === 1) ? 1 : startPage + 1;

        const pages = await QuranPage.find({
            page: { $gte: startPage, $lt: startPage + 10 }
        }).sort({ page: 1 });

        return pages.map(p => p.file_id);
    }

    // تشتغل كل ساعة بين 4 و12 
    // 0 4-12,16-22
    cron.schedule('* * * * *', async () => {
        var currentHourInKSA = moment().tz('Asia/Riyadh').hour();
        console.log(currentHourInKSA)
        // فلتر الوقت لتحديد أذكار الصباح أو المساء حسب الساعة الحالية في السعودية
        var adhkarFilter = (currentHourInKSA >= 5 && currentHourInKSA <= 12)
            // ✅ إذا كانت الساعة بين 5 و 12 → أذكار الصباح
            ? { adhkarMorningEnabled: true, adhkarMorningTime: currentHourInKSA }

            : (currentHourInKSA >= 16 && currentHourInKSA <= 22)
                // ✅ إذا كانت الساعة بين 16 و 22 → أذكار المساء
                ? { adhkarEveningEnabled: true, adhkarEveningTime: currentHourInKSA }

                // ⛔ غير ذلك → لا يتم تفعيل أي نوع من الأذكار
                : {};


        // جلب المجموعات التي توقيتها يساوي الساعة الحالية
        var groupsForAdhkar = await Group.find(adhkarFilter);


        console.log(groupsForAdhkar)
        // sendAdhkarByCategory(bot, /*group.chatId*/"1310425822", category = "أذكار النوم")
        for (const group of groupsForAdhkar) {
            try {
                let category = adhkarFilter.adhkarMorningEnabled
                    ? "أذكار الصباح"
                    : adhkarFilter.adhkarEveningEnabled
                        ? "أذكار المساء"
                        : "غير محدد";
                sendAdhkarByCategory(bot, group.chatId, category)
            } catch (err) {
                console.error(`خطأ في الإرسال إلى ${group.chatId}:`, err.message);
            }
        }


        var currentPeriod = currentHourInKSA < 12 ? 'morning' : 'evening';
        var QuranWirdFilter = {
            quranWirdEnabled: true,
            [`quranTimes.${currentPeriod}`]: currentHourInKSA
        };

        var groupsForQuranWird = await Group.find(QuranWirdFilter);


        for (const group of groupsForQuranWird) {
            try {
                var pagesIds = await getFileIdsFromPage(group.quranCurrentPage);
                const resu = pagesIds.map((fileId, index) => {
                    return {
                        type: "photo",
                        media: fileId,
                        parse_mode: "HTML",
                        caption: index === 0 ? `📖 الصفحات ${group.quranCurrentPage}-${group.quranCurrentPage + 9}` : undefined
                    };
                });

                // console.log(group)
                // console.log(resu)
                bot.telegram.sendMediaGroup(group.chatId, resu).then(async res => {
                    console.log(res)


                    const updatedGroup = await Group.findOneAndUpdate(
                        { chatId: res[0].chat.id },
                        { $set: { quranCurrentPage: group.quranCurrentPage+10} },
                        { upsert: true, new: true }
                    );

                    console.log(updatedGroup)

                })



            } catch (err) {
                console.error(`خطأ في الإرسال إلى ${group.chatId}:`, err.message);
            }
        }



    });


}


module.exports = {
    cronHandler
}