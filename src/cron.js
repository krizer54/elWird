const moment = require('moment-timezone');

const fs = require('fs');
const path = require('path');

const cronHandler = async (bot, Group, cron, Scenes, enter, leave, Markup) => {

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
            // تحميل الملف
            const filePath = path.join(__dirname, '../db/data/adkar.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // التحقق من وجود التصنيف
            const adhkarList = data[category];
            if (!adhkarList || !Array.isArray(adhkarList)) {
                return bot.telegram.sendMessage(chatId, '❌ لم يتم العثور على أذكار في هذا التصنيف.');
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

    // تشتغل كل ساعة بين 4 و12 
    // 0 4-12,16-22
    cron.schedule('0 3-15,16-23 * * *', async () => {
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
        const groups = await Group.find(adhkarFilter);
        console.log(groups)
        for (const group of groups) {
            try {
                let category = adhkarFilter.adhkarMorningEnabled
                    ? "أذكار الصباح"
                    : adhkarFilter.adhkarEveningEnabled
                        ? "أذكار المساء"
                        : "غير محدد";

                sendAdhkarByCategory(bot, group.chatId/*"1310425822"*/, category)
                // bot.telegram.sendPhoto(group.chatId, { source: fs.createReadStream(photoPath) }, {
                //     caption: '🕌 أذكار الصباح'
                // }).then(res => { console.log(res) }).catch(err => { console.log(err) });

            } catch (err) {
                console.error(`خطأ في الإرسال إلى ${group.chatId}:`, err.message);
            }
        }
    });


}


module.exports = {
    cronHandler
}