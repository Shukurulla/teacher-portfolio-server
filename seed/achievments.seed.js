import mongoose from "mongoose";
import dotenv from "dotenv";
import AchievmentsModel from "../models/achievments.model.js";

dotenv.config();

const SECTION_1 = "Sport ta'lim muassasalari rahbar va o'rinbosarlari";
const SECTION_2 = "Sport ta'lim muassasalari yo'riqchi-uslubchilari";
const SECTION_3 =
  "Sport turlarini rivojlantirish respublika markazlari, Olimpiya va paralimpiya sport turlariga tayyorlash markazlari, ixtisoslashtirilgan sport maktablari, ixtisoslashtirilgan olimpiya zaxiralari maktablari trenerlari";
const SECTION_4 = "Sport maktablari trenerlari";
const SECTION_5 = "Sport psixologlari";
const SECTION_6 =
  "Oliy ta'lim muassasalarining jismoniy tarbiya va sport yo'nalishlari bo'yicha rahbar va pedagog kadrlari";
const SECTION_7 =
  "Kasbiy ta'lim tashkilotlari jismoniy tarbiya fani o'qituvchilari (jismoniy tarbiya va sportga ixtisoslashtirilganlar bundan mustasno)";
const SECTION_8 =
  "Umumiy o'rta va o'rta maxsus ta'lim tashkilotlari jismoniy tarbiya fani o'qituvchilari";
const SECTION_9 =
  "Maktabgacha ta'lim tashkilotlari jismoniy tarbiya yo'riqchilari";

const achievments = [
  // ========== I. SECTION 1 ==========
  {
    section: SECTION_1,
    title: "Jismoniy tarbiya va sport sohasidagi ma'lumoti",
    ratings: [
      { about: "Oliy", rating: 10 },
      { about: "Qayta tayyorlash", rating: 5 },
    ],
  },
  {
    section: SECTION_1,
    title:
      "Rahbarlik davridagi sport-ta'lim muassasasining faoliyat samaradorligi reytingi",
    ratings: [
      { about: "Reytingning birinchi yigirmataligida (1 — 20-o'rinlar)", rating: 50 },
      { about: "Reytingning ikkinchi yigirmataligida (21 — 40-o'rinlar)", rating: 30 },
      { about: "Reytingning uchinchi yigirmataligida (41 — 60-o'rinlar)", rating: 20 },
    ],
  },
  {
    section: SECTION_1,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 10 },
      { about: "Sport ustasi", rating: 5 },
      { about: "Sport ustaligiga nomzod", rating: 3 },
    ],
  },
  {
    section: SECTION_1,
    title: "Sport turi bo'yicha hakamlik toifasi uchun",
    ratings: [
      { about: "Xalqaro toifa", rating: 5 },
      { about: "Milliy toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_1,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Respublikada tatbiq etilgan har bir yakka mualliflikdagi namunaviy o'quv dastur",
        rating: 20,
      },
      {
        about: "Metodik qo'llanma, o'quv-uslubiy tavsiya, ishlanmalar uchun",
        rating: 10,
      },
    ],
  },
  {
    section: SECTION_1,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 5 },
      { about: "II o'rin", rating: 3 },
      { about: "III o'rin", rating: 2 },
    ],
  },

  // ========== II. SECTION 2 ==========
  {
    section: SECTION_2,
    title: "Jismoniy tarbiya va sport sohasidagi ma'lumoti",
    ratings: [
      { about: "Oliy", rating: 10 },
      { about: "Qayta tayyorlash", rating: 7 },
      { about: "O'rta-maxsus", rating: 5 },
    ],
  },
  {
    section: SECTION_2,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 10 },
      { about: "Sport ustasi", rating: 5 },
      { about: "Sport ustaligiga nomzod", rating: 3 },
    ],
  },
  {
    section: SECTION_2,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 15 },
      { about: "Birinchi toifa", rating: 10 },
      { about: "Ikkinchi toifa", rating: 5 },
    ],
  },
  {
    section: SECTION_2,
    title: "Sport turi bo'yicha hakamlik toifasi uchun",
    ratings: [
      { about: "Xalqaro toifa", rating: 10 },
      { about: "Milliy toifa", rating: 5 },
    ],
  },
  {
    section: SECTION_2,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Respublikada tatbiq etilgan har bir yakka mualliflikdagi namunaviy o'quv dastur",
        rating: 40,
      },
      {
        about: "Metodik qo'llanma, o'quv-uslubiy tavsiya, ishlanmalar uchun",
        rating: 15,
      },
    ],
  },
  {
    section: SECTION_2,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 10 },
      { about: "II o'rin", rating: 8 },
      { about: "III o'rin", rating: 5 },
    ],
  },
  {
    section: SECTION_2,
    title: "Katta yo'riqchi-uslubchi",
    ratings: [{ about: "Katta yo'riqchi-uslubchi", rating: 5 }],
  },

  // ========== III. SECTION 3 ==========
  {
    section: SECTION_3,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 5 },
      { about: "Sport ustasi", rating: 3 },
      { about: "Sport ustaligiga nomzod", rating: 2 },
    ],
  },
  {
    section: SECTION_3,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 5 },
      { about: "Birinchi toifa", rating: 5 },
      { about: "Ikkinchi toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_3,
    title: "Sport turi bo'yicha hakamlik toifasi uchun",
    ratings: [
      { about: "Xalqaro toifa", rating: 5 },
      { about: "Milliy toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_3,
    title:
      "Osiyo va Paraosiyo o'yinlari, Jahon va Osiyo chempionatlari hamda kuboklarining sovrindorini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "1-o'rin", rating: 20 },
      { about: "2-o'rin", rating: 15 },
      { about: "3-o'rin", rating: 10 },
    ],
  },
  {
    section: SECTION_3,
    title:
      "O'zbekiston chempionati va kubogi sovrindorini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "1-o'rin", rating: 15 },
      { about: "2-o'rin", rating: 10 },
      { about: "3-o'rin", rating: 5 },
    ],
  },
  {
    section: SECTION_3,
    title:
      "Sport musobaqalari (turnir, liga, olimpiya cho'qqilari) g'olib hamda sovrindorini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 15 },
      { about: "Viloyat", rating: 10 },
      { about: "Tuman", rating: 5 },
    ],
  },
  {
    section: SECTION_3,
    title:
      "O'zbekiston milliy terma jamoa a'zosini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "Asosiy tarkib", rating: 15 },
      { about: "Zaxira tarkib", rating: 10 },
    ],
  },
  {
    section: SECTION_3,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 5 },
      { about: "II o'rin", rating: 4 },
      { about: "III o'rin", rating: 3 },
    ],
  },
  {
    section: SECTION_3,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Umumiy o'rta ta'lim tashkilotida", rating: 5 },
      { about: "Maktabgacha ta'lim tashkilotida", rating: 4 },
      { about: "Kasbiy ta'lim tashkilotida", rating: 3 },
    ],
  },
  {
    section: SECTION_3,
    title: "O'quv adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Viloyat yoki respublikada tatbiq etilgan (har bir yakka mualliflikdagi o'quv qo'llanma, metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 10,
      },
      {
        about:
          "Tuman (shahar)da tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 8,
      },
      {
        about:
          "Muassasa uchun tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 5,
      },
    ],
  },

  // ========== IV. SECTION 4 ==========
  {
    section: SECTION_4,
    title: "Jismoniy tarbiya va sport sohasidagi ma'lumoti",
    ratings: [
      { about: "Oliy", rating: 10 },
      { about: "Qayta tayyorlash", rating: 7 },
      { about: "O'rta maxsus", rating: 5 },
    ],
  },
  {
    section: SECTION_4,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 5 },
      { about: "Sport ustasi", rating: 3 },
      { about: "Sport ustaligiga nomzod", rating: 2 },
    ],
  },
  {
    section: SECTION_4,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 5 },
      { about: "Birinchi toifa", rating: 5 },
      { about: "Ikkinchi toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_4,
    title: "Sport turi bo'yicha hakamlik toifasi uchun",
    ratings: [
      { about: "Xalqaro toifa", rating: 5 },
      { about: "Milliy toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_4,
    title:
      "Osiyo va Paraosiyo o'yinlari, Jahon va Osiyo chempionatlari hamda kuboklarining sovrindorini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "1-o'rin", rating: 20 },
      { about: "2-o'rin", rating: 15 },
      { about: "3-o'rin", rating: 10 },
    ],
  },
  {
    section: SECTION_4,
    title:
      "O'zbekiston chempionati va kubogi sovrindorini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "1-o'rin", rating: 15 },
      { about: "2-o'rin", rating: 10 },
      { about: "3-o'rin", rating: 5 },
    ],
  },
  {
    section: SECTION_4,
    title:
      "Sport musobaqa(turnir, liga)lari g'olib hamda sovrindorini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 15 },
      { about: "Viloyat", rating: 10 },
      { about: "Tuman", rating: 5 },
    ],
  },
  {
    section: SECTION_4,
    title:
      "O'zbekiston milliy terma jamoa a'zosini tayyorlagani uchun (har bir sportchi uchun)",
    ratings: [
      { about: "Asosiy tarkib", rating: 15 },
      { about: "Zaxira tarkib", rating: 10 },
    ],
  },
  {
    section: SECTION_4,
    title: "Sport sinovi natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 5 },
      { about: "II o'rin", rating: 4 },
      { about: "III o'rin", rating: 3 },
    ],
  },
  {
    section: SECTION_4,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Umumiy o'rta ta'lim tashkilotida", rating: 5 },
      { about: "Maktabgacha ta'lim tashkilotida", rating: 4 },
      { about: "Kasbiy ta'lim tashkilotida", rating: 3 },
    ],
  },

  // ========== V. SECTION 5 ==========
  {
    section: SECTION_5,
    title: "Psixologiya (sport) sohasidagi ma'lumoti",
    ratings: [
      { about: "Oliy", rating: 10 },
      { about: "Qayta tayyorlash", rating: 5 },
    ],
  },
  {
    section: SECTION_5,
    title: "Sport turi bo'yicha kattalar sporti razryadi",
    ratings: [
      { about: "Birinchi va undan yuqori", rating: 10 },
      { about: "Ikkinchi razryad", rating: 8 },
      { about: "Uchinchi razryad", rating: 5 },
    ],
  },
  {
    section: SECTION_5,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      { about: "Hammualliflikdagi o'quv qo'llanmalar uchun", rating: 15 },
      {
        about:
          "Yakka mualliflikdagi uslubiy qo'llanma yoki uslubiy ko'rsatma uchun",
        rating: 10,
      },
      {
        about:
          "Hammualliflikdagi uslubiy ko'rsatma yoki uslubiy tavsiyalar uchun",
        rating: 8,
      },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Ilmiy konferensiyalarda yakka mualliflikdagi maqola va tezislar chop etish hamda ma'ruzalar bilan qatnashish",
    ratings: [
      { about: "Xalqaro miqyosda", rating: 15 },
      { about: "Respublika miqyosida", rating: 10 },
      { about: "Viloyat miqyosida", rating: 8 },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Sport ta'lim muassasalarida sportchilarni psixologik tayyorlashga asoslangan seminar-trening mashg'ulotlarini o'tkazgani (bayonnomasi)",
    ratings: [
      {
        about:
          "Sport akademiyalari, Olimpiya va paralimpiya sport turlariga tayyorlash markazlari",
        rating: 10,
      },
      {
        about: "Sport turlarini rivojlantirish respublika markazlari",
        rating: 8,
      },
      { about: "Ixtisoslashgan sport maktabi, sport maktablari", rating: 5 },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Kasbiy faoliyati bo'yicha seminar-trening kurslarida ishtirok etgani (sertifikat)",
    ratings: [
      { about: "Xalqaro miqyosda (onlayn)", rating: 10 },
      { about: "Respublika miqyosida", rating: 8 },
      { about: "Viloyat miqyosida", rating: 5 },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Sport ta'lim muassasasida psixologik xizmat ishlarini tashkil etgani",
    ratings: [
      {
        about:
          "Psixologik ma'rifat va tashviqot, psixologik-pedagogik tashxis, psixologik profilaktika, psixologik korreksiya, psixologik maslahat, sport faoliyatiga yo'naltirish",
        rating: 15,
      },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Sportchining qobiliyatlarini rivojlantirish uchun individual dasturlarni tuzgani",
    ratings: [
      {
        about: "Aqliy va jismoniy qobiliyatlarni rivojlantirish dasturi",
        rating: 5,
      },
    ],
  },
  {
    section: SECTION_5,
    title:
      "Ochiq o'quv mashg'ulotlari hamda mahorat darslarini tashkil etgani va o'tkazgani",
    ratings: [
      {
        about: "Sport turlarini rivojlantirish respublika markazlari",
        rating: 10,
      },
      {
        about:
          "Olimpiya va paralimpiya sport turlariga tayyorlash markazlari",
        rating: 8,
      },
      {
        about:
          "Sport turlari bo'yicha ixtisoslashtirilgan davlat maktab-internatlari",
        rating: 5,
      },
    ],
  },

  // ========== VI. SECTION 6 ==========
  {
    section: SECTION_6,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Maktabgacha ta'lim tashkilotida", rating: 5 },
      { about: "Umumiy o'rta ta'lim tashkilotida", rating: 5 },
      { about: "Kasbiy ta'lim tashkilotida", rating: 5 },
      { about: "Sport ta'lim muassasasida", rating: 5 },
    ],
  },
  {
    section: SECTION_6,
    title:
      "Xalqaro va respublika miqyosidagi fan olimpiadalari, sport musobaqalari sovrindorlarini tayyorlagani uchun",
    ratings: [
      { about: "Xalqaro miqyosda", rating: 5 },
      { about: "Respublika miqyosida", rating: 3 },
    ],
  },
  {
    section: SECTION_6,
    title: "Ilmiy konferensiyalarda ma'ruza bilan qatnashish",
    ratings: [
      { about: "Xalqaro miqyosda", rating: 5 },
      { about: "Respublika miqyosida", rating: 3 },
    ],
  },
  {
    section: SECTION_6,
    title: "Ilmiy jurnallarda maqolalar chop etish",
    ratings: [
      {
        about:
          "Xalqaro ma'lumotlar bazasiga kiritilgan yuqori reytingli ilmiy jurnallar yoki «impakt-faktor»ga ega bo'lgan ilmiy jurnallarda",
        rating: 10,
      },
      { about: "Respublika miqyosidagi jurnallarda", rating: 5 },
    ],
  },
  {
    section: SECTION_6,
    title:
      "Ixtiro (patent), ratsionalizatorlik takliflari, innovatsion ishlanmalarga mualliflik qilish",
    ratings: [
      { about: "Ixtiro (patent)", rating: 10 },
      { about: "Ratsionalizatorlik taklifi", rating: 6 },
      { about: "Innovatsion ishlanmalarga mualliflik", rating: 4 },
    ],
  },
  {
    section: SECTION_6,
    title:
      "O'quv adabiyotlari (darslik, o'quv qo'llanma, metodik qo'llanma) tayyorlash va nashrdan chiqarish",
    ratings: [
      { about: "Darslik hammualliflikda", rating: 15 },
      { about: "O'quv qo'llanma hammualliflikda", rating: 10 },
    ],
  },
  {
    section: SECTION_6,
    title: "Ilmiy daraja va unvoni uchun",
    ratings: [{ about: "Ilmiy daraja va unvoni uchun", rating: 15 }],
  },
  {
    section: SECTION_6,
    title:
      "«Universiada» sport musobaqasi g'olib hamda sovrindorini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 20 },
      { about: "Viloyat (shahar)", rating: 10 },
    ],
  },
  {
    section: SECTION_6,
    title:
      "Trenerlik yoki trener-yo'riqchilik faoliyat(lari)i bilan shug'ullanayotganligi uchun (malaka oshirish davriga muvofiq)",
    ratings: [
      {
        about:
          "Trenerlik yoki trener-yo'riqchilik faoliyati bilan shug'ullanayotganligi uchun",
        rating: 5,
      },
    ],
  },
  {
    section: SECTION_6,
    title: "Darsdan tashqari sport turlari bo'yicha to'garaklar soni",
    ratings: [
      { about: "Sport turi — 2 ta", rating: 10 },
      { about: "Sport turi — 1 ta", rating: 8 },
    ],
  },

  // ========== VII. SECTION 7 ==========
  {
    section: SECTION_7,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 10 },
      { about: "Birinchi toifa", rating: 8 },
      { about: "Ikkinchi toifa", rating: 5 },
    ],
  },
  {
    section: SECTION_7,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 10 },
      { about: "Sport ustasi", rating: 8 },
      { about: "Sport ustaligiga nomzod", rating: 5 },
      { about: "Birinchi toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_7,
    title:
      "Jismoniy tarbiya va sport bo'yicha turli ko'rik-tanlov va musobaqalar g'oliblarini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 10 },
      { about: "Viloyat", rating: 8 },
      { about: "Tuman (shahar) (ko'pi bilan 2 ta natija)", rating: 5 },
    ],
  },
  {
    section: SECTION_7,
    title:
      "«Barkamol avlod» sport musobaqasi g'olib hamda sovrindorini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 30 },
      { about: "Viloyat", rating: 20 },
      { about: "Tuman", rating: 10 },
    ],
  },
  {
    section: SECTION_7,
    title:
      "Trenerlik yoki trener-yo'riqchilik faoliyat(lari)i bilan shug'ullanayotgani uchun (malaka oshirish davriga muvofiq)",
    ratings: [
      {
        about:
          "Trenerlik yoki trener-yo'riqchilik faoliyati bilan shug'ullanayotgani uchun",
        rating: 5,
      },
    ],
  },
  {
    section: SECTION_7,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Umumiy o'rta ta'lim tashkilotida", rating: 5 },
      { about: "Maktabgacha ta'lim tashkilotida", rating: 4 },
      { about: "Professional ta'lim muassasasida", rating: 3 },
    ],
  },
  {
    section: SECTION_7,
    title: "Darsdan tashqari sport turlari bo'yicha to'garaklar soni",
    ratings: [
      { about: "Sport turi — 2 ta", rating: 5 },
      { about: "Sport turi — 1 ta", rating: 3 },
    ],
  },
  {
    section: SECTION_7,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 10 },
      { about: "II o'rin", rating: 5 },
      { about: "III o'rin", rating: 3 },
    ],
  },
  {
    section: SECTION_7,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Viloyat yoki respublikada tatbiq etilgan (har bir yakka mualliflikdagi o'quv qo'llanma, metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 15,
      },
      {
        about:
          "Tuman (shahar)da tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 10,
      },
      {
        about:
          "Muassasa uchun tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 5,
      },
    ],
  },

  // ========== VIII. SECTION 8 ==========
  {
    section: SECTION_8,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 10 },
      { about: "Birinchi toifa", rating: 8 },
      { about: "Ikkinchi toifa", rating: 5 },
    ],
  },
  {
    section: SECTION_8,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 10 },
      { about: "Sport ustasi", rating: 8 },
      { about: "Sport ustaligiga nomzod", rating: 5 },
      { about: "Birinchi toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_8,
    title:
      "Jismoniy tarbiya va sport bo'yicha turli ko'rik-tanlov va musobaqalar g'oliblarini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 10 },
      { about: "Viloyat", rating: 8 },
      { about: "Tuman (shahar) (ko'pi bilan 2 ta natija)", rating: 5 },
    ],
  },
  {
    section: SECTION_8,
    title:
      "«Umid niholilari» sport musobaqasi g'olib hamda sovrindorini tayyorlagani uchun",
    ratings: [
      { about: "Viloyat", rating: 15 },
      { about: "Tuman", rating: 10 },
    ],
  },
  {
    section: SECTION_8,
    title:
      "Jismoniy tarbiya fan olimpiadasining g'olib va sovrindorlarini tayyorlagani uchun",
    ratings: [
      { about: "Respublika", rating: 20 },
      { about: "Viloyat", rating: 15 },
      { about: "Tuman", rating: 10 },
    ],
  },
  {
    section: SECTION_8,
    title:
      "Trenerlik yoki trener-yo'riqchilik faoliyat(lari)i bilan shug'ullanayotgani uchun (malaka oshirish davriga muvofiq)",
    ratings: [
      {
        about:
          "Trenerlik yoki trener-yo'riqchilik faoliyati bilan shug'ullanayotgani uchun",
        rating: 5,
      },
    ],
  },
  {
    section: SECTION_8,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Maktabgacha ta'lim tashkilotida", rating: 5 },
      { about: "Sport ta'lim muassasasida", rating: 4 },
      { about: "Umumiy o'rta ta'lim tashkilotida", rating: 3 },
    ],
  },
  {
    section: SECTION_8,
    title: "Darsdan tashqari sport turlari bo'yicha to'garaklar soni",
    ratings: [
      { about: "Sport turi — 2 ta", rating: 5 },
      { about: "Sport turi — 1 ta", rating: 3 },
    ],
  },
  {
    section: SECTION_8,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 10 },
      { about: "II o'rin", rating: 5 },
      { about: "III o'rin", rating: 3 },
    ],
  },
  {
    section: SECTION_8,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Viloyat yoki respublikada tatbiq etilgan (har bir yakka mualliflikdagi o'quv qo'llanma, metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 10,
      },
      {
        about:
          "Tuman (shahar)da tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 8,
      },
      {
        about:
          "Muassasa uchun tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 5,
      },
    ],
  },

  // ========== IX. SECTION 9 ==========
  {
    section: SECTION_9,
    title: "Jismoniy tarbiya va sport sohasidagi ma'lumoti",
    ratings: [
      { about: "Oliy", rating: 10 },
      { about: "Qayta tayyorlash", rating: 5 },
    ],
  },
  {
    section: SECTION_9,
    title: "Malaka toifasi uchun",
    ratings: [
      { about: "Oliy toifa", rating: 10 },
      { about: "Birinchi toifa", rating: 8 },
      { about: "Ikkinchi toifa", rating: 5 },
    ],
  },
  {
    section: SECTION_9,
    title: "Sport toifasi uchun",
    ratings: [
      { about: "Xalqaro toifadagi sport ustasi", rating: 10 },
      { about: "Sport ustasi", rating: 8 },
      { about: "Sport ustaligiga nomzod", rating: 5 },
      { about: "Birinchi toifa", rating: 3 },
    ],
  },
  {
    section: SECTION_9,
    title:
      "Jismoniy tarbiya va sport bo'yicha turli ko'rik-tanlov va musobaqalarda erishgan yutuqlari uchun",
    ratings: [
      { about: "Respublika", rating: 20 },
      { about: "Viloyat", rating: 15 },
      { about: "Tuman", rating: 10 },
    ],
  },
  {
    section: SECTION_9,
    title:
      "Trenerlik yoki trener-yo'riqchilik faoliyat(lari)i bilan shug'ullanayotgani uchun (malaka oshirish davriga muvofiq)",
    ratings: [
      {
        about:
          "Trenerlik yoki trener-yo'riqchilik faoliyati bilan shug'ullanayotgani uchun",
        rating: 10,
      },
    ],
  },
  {
    section: SECTION_9,
    title: "Ochiq o'quv mashg'ulotlari va mahorat darslarini tashkil etish",
    ratings: [
      { about: "Sport ta'lim muassasasida", rating: 10 },
      { about: "Maktabgacha ta'lim tashkilotida", rating: 5 },
    ],
  },
  {
    section: SECTION_9,
    title: "Sport turlari bo'yicha to'garaklar tashkil etganligi",
    ratings: [
      { about: "Sport turi — 2 ta", rating: 10 },
      { about: "Sport turi — 1 ta", rating: 5 },
    ],
  },
  {
    section: SECTION_9,
    title: "Sport sinovlari natijasiga ko'ra jismoniy tayyorgarlik darajasi",
    ratings: [
      { about: "I o'rin", rating: 10 },
      { about: "II o'rin", rating: 5 },
      { about: "III o'rin", rating: 3 },
    ],
  },
  {
    section: SECTION_9,
    title: "O'quv-uslubiy adabiyotlar tayyorlagani",
    ratings: [
      {
        about:
          "Viloyat yoki respublikada tatbiq etilgan (har bir yakka mualliflikdagi o'quv qo'llanma, metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 10,
      },
      {
        about:
          "Tuman (shahar)da tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 8,
      },
      {
        about:
          "Muassasa uchun tatbiq etilgan (har bir yakka mualliflikdagi metodik qo'llanma, o'quv-uslubiy tavsiyalar uchun)",
        rating: 5,
      },
    ],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Database connected");

    let added = 0;
    let skipped = 0;

    for (const item of achievments) {
      const exists = await AchievmentsModel.findOne({
        section: item.section,
        title: item.title,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await AchievmentsModel.create(item);
      added++;
    }

    console.log(`\n✓ Done. Added: ${added}, Skipped: ${skipped}`);
    console.log(`Total in seed: ${achievments.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("✗ Seed error:", error.message);
    process.exit(1);
  }
};

seed();
