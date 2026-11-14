// Демо-данные: одна история «Emma turns 7» на все экраны.
// Когда появится Supabase, эти константы заменятся запросами.

export const PARTY = {
  id: "emma7k2q",
  slug: "emma7k2q",
  child: "Emma",
  age: 7,
  day: "SAT",
  dayLong: "Saturday",
  date: "12/05",
  time: "2:00 PM",
  place: "Riverside Park",
  placeNote: "Pavilion B, by the playground",
  deadline: "12/03",
  deadlineFull: "12/03/2026",
  invited: 25,
  goal: 300,
  raised: 270,
  gift: "A 20-inch bike",
  giftShort: "bike",
  isPro: true,
} as const;

export const DREAM = {
  slug: "emma",
  title: "a telescope to see Saturn's rings",
  goal: 300,
  balance: 120,
} as const;

export const CLASS = {
  id: "carter-2",
  name: "Mrs. Carter's 2nd grade",
  year: "2026–27",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  newParty: "/party/new",
  guest: `/p/${PARTY.slug}`,
  thanks: `/p/${PARTY.slug}/thanks`,
  dashboard: `/party/${PARTY.id}`,
  payout: `/party/${PARTY.id}/payout`,
  qr: `/party/${PARTY.id}/qr`,
  classWallet: `/class/${CLASS.id}`,
  dream: `/dream/${DREAM.slug}`,
} as const;

export const KIDS = [
  "Liam", "Ava", "Olivia", "Mason", "Sophia", "Lucas", "Mia", "Noah", "Isabella",
  "Ethan", "Amelia", "James", "Harper", "Ben", "Evelyn", "Henry", "Abigail",
  "Jack", "Ella", "Leo", "Grace", "Owen", "Chloe", "Wyatt", "Zoe",
];

// Лёгкий наклон плиток — «стикеры» из макета
export const TILT = [-1.5, 1, -0.5, 1.5, 0, -1, 0.5];

export const usd = (n: number) => `$${n.toFixed(2)}`;
export const usd0 = (n: number) => `$${Math.round(n)}`;
