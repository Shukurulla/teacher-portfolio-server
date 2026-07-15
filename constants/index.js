export const achievements = [
  {
    title: "Жисмоний тарбия ва спорт соҳасидаги маълумоти:",
    ratings: [
      {
        title: "олий",
        rating: 10,
      },
      {
        title: "қайта тайёрлаш",
        rating: 5,
      },
    ],
  },
];

// 4 ta filial. key — teacher.region.region da saqlanadigan qiymat bilan bir xil.
export const FILIALS = [
  { key: "Nukus", name: "JTSBMQTMOI Nukus Filiali" },
  { key: "Fargʻona", name: "JTSBMQTMOI Fargʻona Filiali" },
  { key: "Samarqand", name: "JTSBMQTMOI Samarqand Filiali" },
  { key: "Toshkent", name: "JTSBMQTMO Instituti" },
];

export const FILIAL_KEYS = FILIALS.map((f) => f.key);

// Har bir viloyat qaysi filialga tegishli. region — filial kaliti.
export const provinces = [
  {
    title: "Toshkent shahri",
    region: "Toshkent",
  },
  {
    title: "Toshkent viloyati",
    region: "Toshkent",
  },
  {
    title: "Jizzax viloyati",
    region: "Toshkent",
  },
  {
    title: "Sirdaryo viloyati",
    region: "Toshkent",
  },
  {
    title: "Qoraqalpog’iston Respublikasi",
    region: "Nukus",
  },
  {
    title: "Xorazm viloyati",
    region: "Nukus",
  },
  {
    title: "Buxoro viloyati",
    region: "Nukus",
  },
  {
    title: "Samarqand viloyati",
    region: "Samarqand",
  },
  {
    title: "Qashqadaryo viloyati",
    region: "Samarqand",
  },
  {
    title: "Navoiy viloyati",
    region: "Samarqand",
  },
  {
    title: "Surxondaryo viloyati",
    region: "Samarqand",
  },
  {
    title: "Fargʻona viloyati",
    region: "Fargʻona",
  },
  {
    title: "Andijon viloyati",
    region: "Fargʻona",
  },
  {
    title: "Namangan viloyati",
    region: "Fargʻona",
  },
];

// region — province obyekti ({title, region}) yoki filial kaliti (string) bo'lishi mumkin.
export const getFilialKey = (region) => {
  if (!region) return null;
  return typeof region === "string" ? region : region.region || null;
};

export const getFilialByKey = (key) =>
  FILIALS.find((f) => f.key === key) || null;

// VM 2022-07-04/355-son qarori 3-ilova NIZOM 19-band — maxsus yutuqlar (18 ta).
// Ulardan biriga (tasdiqlangan) ega bo'lgan tinglovchi muqobil malaka oshirishga o'tadi.
export const SPECIAL_ITEMS = [
  "“O‘zbekiston Respublikasida xizmat ko‘rsatgan sport ustozi” faxriy unvoni",
  "“O‘zbekiston Respublikasida xizmat ko‘rsatgan yoshlar murabbiysi” faxriy unvoni",
  "“O‘zbekiston Respublikasi xalq o‘qituvchisi” faxriy unvoni",
  "“O‘zbekiston iftixori” faxriy unvoni",
  "“O‘zbekiston Respublikasida xizmat ko‘rsatgan sportchi” faxriy unvoni",
  "So‘nggi 4 yilda Olimpiya va Paralimpiya o‘yinlarida g‘olib va sovrindor bo‘lgan sportchilar va ularni tayyorlagan trenerlar",
  "O‘zbekiston Fanlar akademiyasi akademigi ilmiy unvoni",
  "So‘nggi 4 yilda falsafa doktori (PhD) yoki fan doktori (DSc) darajasi uchun dissertatsiya himoya qilish",
  "So‘nggi 4 yilda DSc dissertatsiyasiga ilmiy maslahatchi yoki 2 ta PhD dissertatsiyasiga ilmiy rahbarlik qilish",
  "So‘nggi 2 yilda dotsent yoki professor ilmiy unvoni olganligi",
  "So‘nggi 4 yilda xorijda malaka oshirish/stajirovka o‘tashi (malaka oshirish ≥1 oy, stajirovka ≥3 oy)",
  "So‘nggi 2 yilda yakka mualliflikda jismoniy tarbiya va sport bo‘yicha darslik yoki o‘quv qo‘llanma nashr etish",
  "Xalqaro shaxmat federatsiyasi (FIDE) reytingida 1 800 va undan yuqori ball",
  "“Qoraqalpog‘iston Respublikasida xizmat ko‘rsatgan sport ustozi” faxriy unvoni",
  "“Qoraqalpog‘iston Respublikasida xizmat ko‘rsatgan yoshlar murabbiysi” faxriy unvoni",
  "“Qoraqalpog‘iston Respublikasi xalq ta’limi o‘qituvchisi” faxriy unvoni",
  "“Qoraqalpog‘iston Respublikasida xizmat ko‘rsatgan sportchi” faxriy unvoni",
  "Tuman(shahar)larning “Eng yaxshi maktab sport klubi” reytingida 1–5-o‘rinni egallagan maktab jismoniy tarbiya o‘qituvchilari",
];
