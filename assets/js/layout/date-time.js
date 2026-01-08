const CONFIG = {
    REFRESH_INTERVAL: 1000,
    STATE_SWITCH_INTERVAL: {
        HIJRI: 6000,
        PUASA: 3000,
        SYARI: 3000,
        INDO: 3000,
        SHORT_MOMENT: 3000,
        MOMENT_CUSTOM: 3000,
        IMSAKIYAH1: 3000,
        IMSAKIYAH2: 3000,
        IMSAKIYAH3: 3000,
        IMSAKIYAH4: 3000
    },
    LOCATION: {
        NAME: 'Sumawe<br>Kab. Mlg',
        LATITUDE: -7.3984823,
        LONGITUDE: 112.7480991
    },
    ARABIC_DIGITS: '٠١٢٣٤٥٦٧٨٩',
    DISPLAY_STATES: ['HIJRI', 'PUASA', 'SYARI', 'INDO', 'SHORT_MOMENT', 'MOMENT_CUSTOM', 'IMSAKIYAH1', 'IMSAKIYAH2', 'IMSAKIYAH3', 'IMSAKIYAH4'],
    IMSAKIYAH_VIEWS: [
        { title1: "Imsak", key1: "imsak", title2: "Subuh", key2: "fajr" },
        { title1: "Terbit", key1: "sunrise", title2: "Duha", key2: "dhuha" },
        { title1: "Zuhur", key1: "dhuhr", title2: "Ashar", key2: "asr" },
        { title1: "Maghrib", key1: "maghrib", title2: "Isya", key2: "isha" }
    ]
};

const SYARI_DATA = {
    MOMEN: {
        newYear:     { m: 1,  d: 1,  name: 'Tahun Baru Hijriyah', icon: 'fa-calendar-plus' },
        tasua:       { m: 1,  d: 9,  name: 'Puasa Sunnah Tasu’a', icon: 'fa-dove' },
        asyura:      { m: 1,  d: 10, name: 'Puasa Sunnah Asyura', icon: 'fa-dove' },
        maulid:      { m: 3,  d: 12, name: 'Maulid Nabi Muhammad SAW', icon: 'fa-star-and-crescent' },
        harlahNU:    { m: 7,  d: 16, name: 'Harlah Nahdlatul Ulama', icon: 'fa-handshake-simple' },
        isramiraj:   { m: 7,  d: 27, name: 'Isra’ Mi’raj', icon: 'fa-moon' },
        nishfuSyaban:{ m: 8,  d: 15, name: 'Nishfu Sya’ban', icon: 'fa-moon-stars' },
        ramadhan:    { m: 9,  d: 1,  name: 'Awal Ramadhan', icon: 'fa-calendar-check' },
        nuzul:       { m: 9,  d: 17, name: 'Nuzulul Qur’an', icon: 'fa-book-quran' },
        idulfitri:   { m: 10, d: 1,  name: 'Idul Fitri', icon: 'fa-hand-sparkles' },
        arafah:      { m: 12, d: 9,  name: 'Puasa Sunnah Arafah', icon: 'fa-dove' },
        iduladha:    { m: 12, d: 10, name: 'Idul Adha', icon: 'fa-kaaba' },
        tasyriq:     { m: 12, range: [11,13], name: 'Tasyriq', icon: 'fa-praying-hands' }
    },
    MOMEN_CATEGORIES: {
        SYARI: ['newYear', 'tasua', 'asyura', 'ramadhan', 'nuzul', 'idulfitri', 'arafah', 'iduladha'],
        INDO:  ['harlahNU', 'maulid', 'isramiraj']
    },
    HARAM_PUASA: [{ m: 10, d: 1 }, { m: 12, d: 10 }, { m: 12, range: [11, 13] }],
    PUASA_ROUTINE: [
        { type: 'weekday', value: 1, name: 'Puasa Sunnah Senin' },
        { type: 'weekday', value: 4, name: 'Puasa Sunnah Kamis' },
        { type: 'hijriRange', min: 13, max: 15, exclude: [9, 12], name: 'Puasa Sunnah Ayyamul Bidh' },
        { type: 'hijriFix', m: 10, min: 2, max: 7, name: 'Puasa Sunnah 6 Hari Syawal' }
    ]
};

const GREGORIAN_DATA = {
    MOMEN: {
        newYearGreg:            { m: 1,  d: 1,  name: 'Tahun Baru Masehi', icon: 'fa-calendar' },
        pagarNusa:              { m: 1,  d: 3,  name: 'Harlah Pagar Nusa', icon: 'fa-shield-halved' },
        santriNasional:         { m: 2,  d: 22, name: 'Hari Santri Nasional', icon: 'fa-graduation-cap' },
        ipnu:                   { m: 2,  d: 24, name: 'Harlah IPNU', icon: 'fa-users' },
        ippnu:                  { m: 3,  d: 2,  name: 'Harlah IPPNU', icon: 'fa-people-group' },
        muslimat:               { m: 3,  d: 29, name: 'Harlah Muslimat NU', icon: 'fa-person-dress' },
        kartini:                { m: 4,  d: 21, name: 'Hari Kartini', icon: 'fa-person-dress' },
        ansorFatayat:           { m: 4,  d: 24, name: 'Harlah GP Ansor & Fatayat NU', icon: 'fa-person-running' },
        buruh:                  { m: 5,  d: 1,  name: 'Hari Buruh Internasional', icon: 'fa-hammer' },
        pendidikanNasional:     { m: 5,  d: 2,  name: 'Hari Pendidikan Nasional', icon: 'fa-book-open' },
        kebangkitan:            { m: 5,  d: 20, name: 'Hari Kebangkitan Nasional', icon: 'fa-flag' },
        pancasilaLahir:         { m: 6,  d: 1,  name: 'Hari Lahir Pancasila', icon: 'fa-leaf' },
        pramuka:                { m: 8,  d: 10, name: 'Hari Pramuka', icon: 'fa-campground' },
        kemerdekaan:            { m: 8,  d: 17, name: 'Hari Kemerdekaan RI', icon: 'fa-flag-indonesia' },
        kesaktianPancasila:     { m: 10, d: 1,  name: 'Hari Kesaktian Pancasila', icon: 'fa-shield' },
        sumpahPemuda:           { m: 10, d: 28, name: 'Sumpah Pemuda', icon: 'fa-heart' },
        pahlawan:               { m: 11, d: 10, name: 'Hari Pahlawan', icon: 'fa-medal' },
        resolusiJihad:          { m: 11, d: 18, name: 'Hari Resolusi Jihad Surabaya', icon: 'fa-book' },
        guru:                   { m: 11, d: 25, name: 'Hari Guru Nasional', icon: 'fa-chalkboard-user' },
        natal:                  { m: 12, d: 25, name: 'Natal', icon: 'fa-christmas-tree' },
        hariAnakNasional:       { m: 7,  d: 23, name: 'Hari Anak Nasional', icon: 'fa-child' },
        hariPengkhianatanPKI:   { m: 9,  d: 30, name: 'Hari Pengkhianatan PKI (G30S/PKI)', icon: 'fa-exclamation-triangle' },
        hariBatikNasional:      { m: 10, d: 2,  name: 'Hari Batik Nasional', icon: 'fa-paintbrush' }
    },
    MOMEN_CATEGORIES: {
        SHORT_MOMENT: ['newYearGreg', 'pagarNusa', 'santriNasional', 'ipnu', 'ippnu', 'muslimat', 'kartini', 'ansorFatayat', 'buruh', 'pendidikanNasional', 'kebangkitan', 'pancasilaLahir', 'pramuka', 'kemerdekaan', 'kesaktianPancasila', 'sumpahPemuda', 'pahlawan', 'guru', 'hariAnakNasional', 'hariPengkhianatanPKI', 'hariBatikNasional'],
        MOMENT_CUSTOM: ['resolusiJihad', 'natal']
    },
    VARYING_MOMENTS: [
        { name: 'Nyepi', icon: 'fa-temple', note: 'Kalender Saka/Lunar' },
        { name: 'Waisak', icon: 'fa-buddha', note: 'Kalender Buddha/Lunar' }
    ]
};

let prayerTimesData = null;
let currentStateIndex = 0;
let autoSwitchTimeout = null;
// Cache untuk render cycle saat ini
let cache = {
    nextValidStateIndex: null,
    nextSyariMoment: null,
    nextIndoMoment: null,
    nextShortMoment: null,
    nextCustomMoment: null,
    tomorrowFastingInfo: null,
    hijriFull: null,
    jawaCalendar: null
};

const parseArabicNumber = (str) => {
    // Normalisasi semua digit Arab ke Latin terlebih dahulu
    const normalized = str.replace(/[٠-٩]/g, digit => CONFIG.ARABIC_DIGITS.indexOf(digit).toString());
    return Number(normalized);
};

const getHijriNumeric = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return { day: 0, month: 0, year: 0 };
    
    try {
        const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'numeric', year: 'numeric'
        }).formatToParts(date);
        const hijriDate = {};
        
        parts.forEach(part => {
            if (['day', 'month', 'year'].includes(part.type)) {
                hijriDate[part.type] = parseArabicNumber(part.value);
            }
        });
        
        return (!hijriDate.day || !hijriDate.month) ? { day: 0, month: 0, year: 0 } : hijriDate;
    } catch (error) {
        console.error("Error parsing Hijri date:", error);
        return { day: 0, month: 0, year: 0 };
    }
};

// === KALENDER JAWA ===
const JAWA_DAYS = ['Ahad','Senen','Selasa','Rebo','Kemis','Jemuwah','Setu']; 
const PASARAN = ['Legi','Pahing','Pon','Wage','Kliwon']; 
const PASARAN_REF_DATE = new Date(1945, 7, 17); 
const PASARAN_REF_INDEX = 0; // Legi
const JAWA_MONTHS = [ '', 'Sura', 'Sapar', 'Mulud', 'Bakda Mulud', 'Jumadilawal', 'Jumadilakir', 'Rejeb', 'Ruwah', 'Pasa', 'Sawal', 'Dulkaidah', 'Besar' ];

const getJavanesePasaran = (date) => { 
    const diffDays = Math.floor((date - PASARAN_REF_DATE) / 86400000); 
    return PASARAN[(PASARAN_REF_INDEX + diffDays % 5 + 5) % 5]; 
}; 

const getJavaneseDay = (date) => { 
    return `${JAWA_DAYS[date.getDay()]} ${getJavanesePasaran(date)}`; 
};

const getJavaneseCalendar = (date) => { 
    if (!cache.jawaCalendar) {
        const hijri = getHijriNumeric(date); 
        if (!hijri.day || !hijri.month || !hijri.year) {
            cache.jawaCalendar = '<div class="jawa-calendar" dir="ltr">Kalender Jawa Tidak Tersedia</div>'; 
        } else {
            // Hapus baris baru dan spasi yang tidak perlu
            cache.jawaCalendar = '<div class="jawa-calendar" dir="ltr"><div class="jawa-day">' + getJavaneseDay(date) + '</div><div class="jawa-date">' + hijri.day + ' ' + JAWA_MONTHS[hijri.month] + ' ' + (hijri.year + 512) + ' J</div></div>';
        }
    }
    return cache.jawaCalendar;
};




const getHijriFull = (date) => { 
    if (!cache.hijriFull) {
        try {
            const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            }).formatToParts(date);
            const hijriData = { weekday: "", day: "", month: "", year: "" };
    
            parts.forEach(part => {
                if (Object.keys(hijriData).includes(part.type)) {
                    hijriData[part.type] = part.value;
                }
            });
    
            // Hapus baris baru dan spasi berlebih
            cache.hijriFull = '<span dir="rtl" class="hijri-text">' + hijriData.weekday + '، ' + hijriData.day + ' ' + hijriData.month + ' ' + hijriData.year + ' هـ</span>';
        } catch (error) {
            console.error("Error generating full Hijri date:", error);
            cache.hijriFull = '<span dir="rtl" class="hijri-text">Tanggal Hijri Tidak Tersedia</span>';
        }
    }
    return cache.hijriFull;
};


const isHaramToFast = (date) => {
    const hijriDate = getHijriNumeric(date);
    if (!hijriDate.day || !hijriDate.month) return false;

    return SYARI_DATA.HARAM_PUASA.some(item => {
        if (item.d && hijriDate.month === item.m && hijriDate.day === item.d) return true;
        if (item.range && hijriDate.month === item.m && hijriDate.day >= item.range[0] && hijriDate.day <= item.range[1]) return true;
        return false;
    });
};

const getNextMoment = (dataSource, categoryKey, type, maxDaysCheck = 3) => {
    const today = new Date();
    const targetMomentKeys = dataSource.MOMEN_CATEGORIES[categoryKey];
    const messageLabel = type === 'GREGORIAN' ? 'peringatan' : 'menuju';

    const adjustedMaxDays = type === 'HIJRI' ? 365 : maxDaysCheck;

    for (let daysAhead = 1; daysAhead <= adjustedMaxDays; daysAhead++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + daysAhead);

        if (type === 'HIJRI') {
            const hijriDate = getHijriNumeric(checkDate);
            if (!hijriDate.day || !hijriDate.month) continue;

            for (const momentKey of targetMomentKeys) {
                const targetMoment = dataSource.MOMEN[momentKey];
                // Cek dukungan penuh untuk range dan d
                if (targetMoment.m === hijriDate.month) {
                    if (targetMoment.d && hijriDate.day === targetMoment.d) {
                        return `
                        <i class="fa-solid ${targetMoment.icon}"></i>
                        <div class="icon-text-content">
                            <span class="line-1"><strong>${daysAhead} hari lagi ${messageLabel}</strong></span>
                            <span class="line-2">${targetMoment.name}</span>
                        </div>
                    `;
                    }
                    if (targetMoment.range && hijriDate.day >= targetMoment.range[0] && hijriDate.day <= targetMoment.range[1]) {
                        return `
                            <i class="fa-solid ${targetMoment.icon}"></i>
                            <div class="icon-text-content">
                                <span class="line-1"><strong>${daysAhead} hari lagi ${messageLabel}</strong></span>
                                <span class="line-2">${targetMoment.name}</span>
                            </div>
                        `;
                    }
                }
            }
        } else if (type === 'GREGORIAN') {
            const checkMonth = checkDate.getMonth() + 1;
            const checkDay = checkDate.getDate();

            for (const momentKey of targetMomentKeys) {
                const targetMoment = dataSource.MOMEN[momentKey];
                if (targetMoment.m === checkMonth && targetMoment.d === checkDay) {
                    return `
                        <i class="fa-solid ${targetMoment.icon}"></i>
                        <div class="icon-text-content">
                            <span class="line-1"><strong>${daysAhead} hari lagi peringatan</strong></span>
                            <span class="line-2">${targetMoment.name}</span>
                        </div>
                    `;
                }
            }
        }
    }
    return null;
};

const getNextSyariMoment = () => {
    if (cache.nextSyariMoment === null) {
        cache.nextSyariMoment = getNextMoment(SYARI_DATA, 'SYARI', 'HIJRI', 365);
    }
    return cache.nextSyariMoment;
};
const getNextIndoMoment = () => {
    if (cache.nextIndoMoment === null) {
        cache.nextIndoMoment = getNextMoment(SYARI_DATA, 'INDO', 'HIJRI', 365);
    }
    return cache.nextIndoMoment;
};
const getNextShortMoment = () => {
    if (cache.nextShortMoment === null) {
        cache.nextShortMoment = getNextMoment(GREGORIAN_DATA, 'SHORT_MOMENT', 'GREGORIAN', 3);
    }
    return cache.nextShortMoment;
};
const getNextCustomMoment = () => {
    if (cache.nextCustomMoment === null) {
        cache.nextCustomMoment = getNextMoment(GREGORIAN_DATA, 'MOMENT_CUSTOM', 'GREGORIAN', 3);
    }
    return cache.nextCustomMoment;
};

const getTomorrowFastingInfo = () => {
    if (cache.tomorrowFastingInfo === null) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (isHaramToFast(tomorrow)) {
            cache.tomorrowFastingInfo = [`
                <i class="fa-solid fa-exclamation-circle"></i>
                <div class="icon-text-content">
                    <span class="line-1"><strong>BESOK HARAM BERPUASA</strong></span>
                    <span class="line-2">(hari raya/tasyrik)</span>
                </div>
            `];
            return cache.tomorrowFastingInfo;
        }

        const hijriDate = getHijriNumeric(tomorrow);
        if (!hijriDate.day || !hijriDate.month) {
            cache.tomorrowFastingInfo = [];
            return cache.tomorrowFastingInfo;
        }

        const fastingInfo = new Set();
        const checkRoutineEligibility = (routine) => {
            switch (routine.type) {
                case 'weekday': 
                    return tomorrow.getDay() === routine.value;
                case 'hijriRange': 
                    return !routine.exclude?.includes(hijriDate.month) && hijriDate.day >= routine.min && hijriDate.day <= routine.max;
                case 'hijriFix': 
                    return hijriDate.month === routine.m && hijriDate.day >= routine.min && hijriDate.day <= routine.max;
                default: 
                    return false;
            }
        };

        SYARI_DATA.PUASA_ROUTINE.forEach(routine => {
            if (checkRoutineEligibility(routine)) {
                fastingInfo.add(`
                    <i class="fa-solid fa-dove"></i>
                    <div class="icon-text-content">
                        <span class="line-1"><strong>BESOK</strong></span>
                        <span class="line-2">${routine.name}</span>
                    </div>
                `);
            }
        });

        ['tasua', 'asyura', 'arafah'].forEach(momenKey => {
            const targetMoment = SYARI_DATA.MOMEN[momenKey];
            if (hijriDate.month === targetMoment.m) {
                if (targetMoment.d && hijriDate.day === targetMoment.d) {
                    fastingInfo.add(`
                        <i class="fa-solid ${targetMoment.icon}"></i>
                        <div class="icon-text-content">
                            <span class="line-1"><strong>BESOK</strong></span>
                            <span class="line-2">${targetMoment.name}</span>
                        </div>
                    `);
                }
                if (targetMoment.range && hijriDate.day >= targetMoment.range[0] && hijriDate.day <= targetMoment.range[1]) {
                    fastingInfo.add(`
                        <i class="fa-solid ${targetMoment.icon}"></i>
                        <div class="icon-text-content">
                            <span class="line-1"><strong>BESOK</strong></span>
                            <span class="line-2">${targetMoment.name}</span>
                        </div>
                    `);
                }
            }
        });

        cache.tomorrowFastingInfo = [...fastingInfo];
    }
    return cache.tomorrowFastingInfo;
};

const TIMEZONE = 7;
const STANDARD_MERIDIAN = TIMEZONE * 15;

const METHOD_SYAFII_ID = {
    fajrAngle: 20,
    ishaAngle: 18,
    asrShadow: 1,
    dhuhaDegreesAfterSunrise: 4.5,
    imsakMinutes: 10
};

const ASTRONOMY = {
    SUN_REFRACTION: 0.833
};

const OFFSET = {
    imsak   : 0,
    fajr    : 0,
    sunrise : 0,
    dhuha   : 0,
    dhuhr   : 0,
    asr     : 0,
    maghrib : 0,
    isha    : 0
};

const solarPosition = (date) => {
    const jd = (date.getTime() / 86400000) + 2440587.5;
    const T = (jd - 2451545.0) / 36525;

    const L0 = (280.46646 + T*(36000.76983 + T*0.0003032)) % 360;
    const M = 357.52911 + T*(35999.05029 - 0.0001537*T);
    const e = 0.016708634 - T*(0.000042037 + 0.0000001267*T);
    const C = (1.914602 - T*(0.004817 + 0.000014*T))*Math.sin(M*Math.PI/180) + 
              (0.019993 - 0.000101*T)*Math.sin(2*M*Math.PI/180) + 
              0.000289*Math.sin(3*M*Math.PI/180);
    const trueLong = L0 + C;
    const omega = 125.04 - 1934.136 * T;
    const lambda = trueLong - 0.00569 - 0.00478*Math.sin(omega*Math.PI/180);
    const epsilon0 = 23 + (26 + ((21.448 - T*(46.815 + T*(0.00059 - T*0.001813))))/60)/60;
    const epsilon = epsilon0 + 0.00256*Math.cos(omega*Math.PI/180);
    
    const decl = Math.asin(Math.sin(epsilon*Math.PI/180) * Math.sin(lambda*Math.PI/180));
    
    const y = Math.tan((epsilon/2)*Math.PI/180)**2;
    const eqTime = 4 * (
        y*Math.sin(2*L0*Math.PI/180) - 
        2*e*Math.sin(M*Math.PI/180) + 
        4*e*y*Math.sin(M*Math.PI/180)*Math.cos(2*L0*Math.PI/180) - 
        0.5*y*y*Math.sin(4*L0*Math.PI/180) - 
        1.25*e*e*Math.sin(2*M*Math.PI/180)
    ) * 180/Math.PI;

    return { decl, eqTime };
};

const normalizeTime = (t) => {
    return (t + 24) % 24;
};

function PrayTimes() {}

PrayTimes.prototype.getTimes = function(date, coords) {
    const latDeg = coords[0];
    const lng = coords[1];
    const lat = latDeg * Math.PI / 180;

    const { decl, eqTime } = solarPosition(
        new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    );

    const noon = 12 + (STANDARD_MERIDIAN - lng) / 15 - eqTime / 60;

    const sunAngleTime = (angle, afterNoon) => {
        const a = angle * Math.PI / 180;
        const cosH = (Math.sin(a) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
        const H = Math.acos(Math.min(1, Math.max(-1, cosH))) * 180 / Math.PI / 15;
        return noon + (afterNoon ? H : -H);
    };

    const asrTime = (shadowFactor) => {
        const phi = lat;
        const delta = decl;
        const angle = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(phi - delta))));
        const cosH = (Math.sin(angle) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
        const H = Math.acos(Math.min(1, Math.max(-1, cosH))) * 180 / Math.PI / 15;
        return noon + H;
    };

    const applyOffset = (time, key) => {
        return time + (OFFSET[key] || 0) / 60;
    };

    const fmt = (t) => {
        let h = Math.floor(t);
        let m = Math.round((t - h) * 60);
        if (m === 60) { h++; m = 0; }
        return String(h).padStart(2, '0') + ":" + String(m).padStart(2, '0');
    };

    const fajr = sunAngleTime(-METHOD_SYAFII_ID.fajrAngle, false);
    const sunrise = sunAngleTime(-ASTRONOMY.SUN_REFRACTION, false);
    const sunset = sunAngleTime(-ASTRONOMY.SUN_REFRACTION, true);
    const isha = sunAngleTime(-METHOD_SYAFII_ID.ishaAngle, true);
    const asr = asrTime(METHOD_SYAFII_ID.asrShadow);
    const dhuhr = noon;
    const dhuha = sunrise + METHOD_SYAFII_ID.dhuhaDegreesAfterSunrise / 15;

    return {
        imsak: fmt(normalizeTime(applyOffset(fajr - METHOD_SYAFII_ID.imsakMinutes/60, 'imsak'))),
        fajr: fmt(normalizeTime(applyOffset(fajr, 'fajr'))),
        sunrise: fmt(normalizeTime(applyOffset(sunrise, 'sunrise'))),
        dhuha: fmt(normalizeTime(applyOffset(dhuha, 'dhuha'))),
        dhuhr: fmt(normalizeTime(applyOffset(dhuhr, 'dhuhr'))),
        asr: fmt(normalizeTime(applyOffset(asr, 'asr'))),
        maghrib: fmt(normalizeTime(applyOffset(sunset, 'maghrib'))),
        isha: fmt(normalizeTime(applyOffset(isha, 'isha')))
    };
};

const fetchPrayerTimes = () => {
    try {
        const prayerCalculator = new PrayTimes();
        prayerTimesData = prayerCalculator.getTimes(
            new Date(),
            [CONFIG.LOCATION.LATITUDE, CONFIG.LOCATION.LONGITUDE]
        );
    } catch (error) {
        console.error("Error menghitung jadwal shalat lokal:", error);
        prayerTimesData = null;
    }
};

const renderImsakiyah = (viewIndex) => {
    // Tampilan loading jika data belum tersedia
    if (!prayerTimesData) {
        return `
            <div class="icon-text-wrapper">
                <i class="fa-solid fa-clock"></i>
                <div class="icon-text-content">
                    <span class="line-1"><strong>MEMUAT JADWAL</strong></span>
                    <span class="line-2">SHALAT...</span>
                </div>
            </div>
        `;
    }

    const view = CONFIG.IMSAKIYAH_VIEWS[viewIndex];
    // Pisahkan nama lokasi agar tidak terlalu panjang di mobile
    const formattedLocation = CONFIG.LOCATION.NAME.replace('<br>', ' • ');
    
    return `
        <table class="imsak-table">
            <thead>
                <tr>
                    <th class="location-cell">${formattedLocation}</th>
                    <th class="time-cell"><strong>${view.title1}</strong></th>
                    <th class="time-cell"><strong>${view.title2}</strong></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="location-label"><i>* Khusus Zona Lokal</i></td>
                    <td class="time-cell">${prayerTimesData[view.key1]}</td>
                    <td class="time-cell">${prayerTimesData[view.key2]}</td>
                </tr>
            </tbody>
        </table>
    `;
};

const getNextValidStateIndex = () => {
    if (cache.nextValidStateIndex === null) {
        for (let i = 1; i <= CONFIG.DISPLAY_STATES.length; i++) {
            const index = (currentStateIndex + i) % CONFIG.DISPLAY_STATES.length;
            const state = CONFIG.DISPLAY_STATES[index];

            switch (state) {
                case 'HIJRI': 
                    cache.nextValidStateIndex = index;
                    return index;
                case 'PUASA': 
                    if (getTomorrowFastingInfo().length > 0) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
                    break;
                case 'SYARI': 
                    if (getNextSyariMoment()) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
                    break;
                case 'INDO': 
                    if (getNextIndoMoment()) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
                    break;
                case 'SHORT_MOMENT': 
                    if (getNextShortMoment()) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
                    break;
                case 'MOMENT_CUSTOM': 
                    if (getNextCustomMoment()) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
                    break;
                default: 
                    if (state.startsWith('IMSAKIYAH')) {
                        cache.nextValidStateIndex = index;
                        return index;
                    }
            }
        }
       
        cache.nextValidStateIndex = currentStateIndex;
    }
    return cache.nextValidStateIndex;
};

const setupAutoStateSwitch = () => {
    clearTimeout(autoSwitchTimeout);
    const currentState = CONFIG.DISPLAY_STATES[currentStateIndex];
    // Gunakan setTimeout rekursif dengan durasi state saat ini
    autoSwitchTimeout = setTimeout(() => {
        currentStateIndex = getNextValidStateIndex();
        renderDisplayContent();
    }, CONFIG.STATE_SWITCH_INTERVAL[currentState]);
};

const renderDisplayContent = () => {
    // Reset cache di awal setiap render cycle
    cache = {
        nextValidStateIndex: null,
        nextSyariMoment: null,
        nextIndoMoment: null,
        nextShortMoment: null,
        nextCustomMoment: null,
        tomorrowFastingInfo: null,
        hijriFull: null,
        jawaCalendar: null
    };

    const hijriElement = document.getElementById('hijri');
    if (!hijriElement) return;

    const currentState = CONFIG.DISPLAY_STATES[currentStateIndex];
    hijriElement.style.direction = currentState === 'HIJRI' ? 'rtl' : 'ltr';
    hijriElement.style.textAlign = currentState === 'HIJRI' ? 'center' : 'left';
    hijriElement.style.minHeight = '45px';

    const emptyMsg = (title, desc) => `
        <div class="icon-text-wrapper">
            <i class="fa-solid fa-info-circle"></i>
            <div class="icon-text-content">
                <span class="line-1"><strong>${title}</strong></span>
                <span class="line-2">${desc}</span>
            </div>
        </div>
    `;

    switch (currentState) {
// Dan pada case 'HIJRI':
case 'HIJRI':
    // Gabungkan elemen tanpa spasi antar keduanya
    hijriElement.innerHTML = getHijriFull(new Date()) + getJavaneseCalendar(new Date());
    break;
        case 'PUASA':
            const fastingInfo = getTomorrowFastingInfo();
            hijriElement.innerHTML = fastingInfo.map(item => `<div class="icon-text-wrapper">${item}</div>`).join('<div style="height: 2px;"></div>') || emptyMsg('TIDAK ADA PUASA', 'UNTUK BESOK');
            break;
        case 'SYARI':
            hijriElement.innerHTML = getNextSyariMoment() ? `<div class="icon-text-wrapper">${getNextSyariMoment()}</div>` : emptyMsg('TIDAK ADA MOMEN', 'SYAR\'I TERDEKAT');
            break;
        case 'INDO':
            hijriElement.innerHTML = getNextIndoMoment() ? `<div class="icon-text-wrapper">${getNextIndoMoment()}</div>` : emptyMsg('TIDAK ADA MOMEN', 'NASIONAL ISLAM');
            break;
        case 'SHORT_MOMENT':
            hijriElement.innerHTML = getNextShortMoment() ? `<div class="icon-text-wrapper">${getNextShortMoment()}</div>` : emptyMsg('TIDAK ADA PERINGATAN', 'DALAM 3 HARI KEDEPAN');
            break;
        case 'MOMENT_CUSTOM':
            hijriElement.innerHTML = getNextCustomMoment() ? `<div class="icon-text-wrapper">${getNextCustomMoment()}</div>` : emptyMsg('TIDAK ADA PERINGATAN', 'DALAM 3 HARI KEDEPAN');
            break;
        case 'IMSAKIYAH1': 
            hijriElement.innerHTML = renderImsakiyah(0); 
            break;
        case 'IMSAKIYAH2': 
            hijriElement.innerHTML = renderImsakiyah(1); 
            break;
        case 'IMSAKIYAH3': 
            hijriElement.innerHTML = renderImsakiyah(2); 
            break;
        case 'IMSAKIYAH4': 
            hijriElement.innerHTML = renderImsakiyah(3); 
            break;
    }

    setupAutoStateSwitch();
};

const updateDateTimeDisplay = () => {
    const datetimeElement = document.getElementById('datetime');
    if (!datetimeElement) return;

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    }).format(now).replace(',', '');
    const timezoneLabel = TIMEZONE === 7 ? 'WIB' : TIMEZONE === 8 ? 'WITA' : 'WIT';
    const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, '.') + ` ${timezoneLabel}`;

    datetimeElement.innerHTML = `
        <i class="fa-solid fa-calendar"></i> 
        <span class="datetime-date">${formattedDate}</span>
        <i class="fa-solid fa-clock"></i> 
        <span class="datetime-time"><strong>${formattedTime}</strong></span>
    `;
};

const updateCopyrightYear = () => {
    const yearElement = document.getElementById('year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
};

document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    fetchPrayerTimes();
    
    setInterval(fetchPrayerTimes, 86400000);
    setInterval(updateDateTimeDisplay, CONFIG.REFRESH_INTERVAL);
    
    updateDateTimeDisplay();
    renderDisplayContent();
});