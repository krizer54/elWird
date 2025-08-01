let originalText = "", hasWon = false;

async function fetchAyat(surah, from, to) {
    const resp = await fetch(`/api/ayat?surah=${surah}&from=${from}&to=${to}`);
    if (!resp.ok) throw new Error(resp.status);
    return (await resp.json()).text.trim();
}

document.addEventListener('DOMContentLoaded', () => {
    const surahSelect = document.getElementById('surah');
    const fromInput = document.getElementById('from');
    const header = document.querySelector("header");
    const feedbackArea = document.getElementById('feedbackArea');

    const toInput = document.getElementById('to');
    const textarea = document.getElementById('userInput');

    fetch('db/data/quran.json').then(r => r.json()).then(data => {
        var surahs = [...new Set(data.map(item => item.sura_name_ar))];
        // return surahs.map((name, i) => ({ id: i + 1, name }));
        console.log(surahs)
        surahs.forEach((surahName, index) => { index++; const o = document.createElement('option'); o.value = index; o.text = surahName; surahSelect.add(o); });
    });

    function load(surah, from, to) {
        fetchAyat(surah, from, to).then(text => {
            originalText = text;
            hasWon = false;
            const first = originalText.split(/\s+/)[0] || '';
            textarea.disabled = false;
            textarea.value = first + ' ';
            textarea.focus();
            feedbackArea.innerHTML = `<div class="feedback-note">🚀 <b>التحدي بدأ!</b> الكلمة: <b>${first}</b></div>`;
            document.querySelector("header").classList.add("collapsed");
            document.getElementById("toggleHeader").style.display = "block";
            document.getElementById("winBox").style.display = "none";



        });
    }

    surahSelect.onchange = () => {
        setTimeout(() => {
            fromInput.focus();
        }, 100); // 100ms كافية لتحديث DOM قبل التركيز
    };
    
    fromInput.oninput = toInput.oninput = () => {
        if (+toInput.value < +fromInput.value) toInput.value = fromInput.value;
        showStartButtonIfReady();


    };

    textarea.oninput = () => {
        if (hasWon) return;
        const userWords = textarea.value.trim().split(/\s+/);
        const originalWords = originalText.trim().split(/\s+/);
        let feedback = '', allCorrect = true;
        for (let i = 0; i < originalWords.length; i++) {
            const uw = userWords[i] || '';
            const ow = originalWords[i];
            if (uw === ow || ow.startsWith(uw)) {
                feedback += `<span class="correct">${uw}</span> `;
                if (uw !== ow) allCorrect = false;
            } else {
                feedback += `<span class="incorrect" title="الكلمة الصحيحة: ${ow}">${uw}</span> `;
                allCorrect = false;
            }
        }
        feedbackArea.innerHTML = feedback;

        if (allCorrect && userWords.length === originalWords.length) {
            hasWon = true;
            document.getElementById("winBox").style.display = "block";

            document.getElementById('retryBtn').onclick = (e) => {
                const header = document.querySelector("header");
                header.classList.remove("collapsed");
                document.getElementById("winbox").style.display = "none";

            };
        }
    };

    document.getElementById("toggleHeader").addEventListener("click", () => {
        header.classList.toggle("collapsed");

    });

    // وظيفة لإظهار زر "بدأ التحدي" فقط إذا السورة والأيات مكتملة
    function showStartButtonIfReady() {
        const surahVal = document.getElementById("surah").value;
        const fromVal = document.getElementById("from").value;
        const toVal = document.getElementById("to").value;

        const ready = surahVal && fromVal && toVal;
        document.getElementById("startChallengeBtn").style.display = ready ? "inline-block" : "none";
    }


    document.getElementById("startChallengeBtn").addEventListener('click', () => {
        const surah = document.getElementById("surah").value;
        const from = Number(document.getElementById("from").value);
        const to = Number(document.getElementById("to").value);

        document.getElementById("startChallengeBtn").style.display = "none"; // إخفاء بعد الضغط

        load(surah, from, to); // التحدي يبدأ
    });


});
