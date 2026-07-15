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
