import type { Locale, Msg } from "@/lib/i18n/core";
import { en, type MessageKey } from "@/lib/i18n/dict/en";
import { kk } from "@/lib/i18n/dict/kk";
import { ru } from "@/lib/i18n/dict/ru";

export type { MessageKey };
export const DICT: Record<Locale, Record<MessageKey, Msg>> = { en, ru, kk };

// Строки демо-данных (хранятся в базе по-английски) → перевод для показа. Неизвестные строки показываем как есть.
const LIT_EN = [
  "Riverside Park",
  "Pavilion B, by the playground",
  "A 20-inch bike",
  "A first telescope",
  "Art set and easel",
  "Confetti over the picnic table",
  "Cake with seven candles",
  "Balloons in five colors",
  "The new bike on the grass",
  "Three party hats",
  "Riverside Park on a sunny afternoon",
  "A tray of cupcakes",
  "Paper bunting across the pavilion",
  "A wrapped gift",
  "Soap bubbles in the sun",
  "A paper-cut number seven",
  "Paper stars",
] as const;

const LIT_RU = [
  "Парк «Риверсайд»",
  "Павильон B, у детской площадки",
  "Велосипед на 20 дюймов",
  "Первый телескоп",
  "Набор для рисования с мольбертом",
  "Конфетти над столом для пикника",
  "Торт с семью свечами",
  "Воздушные шары пяти цветов",
  "Новый велосипед на траве",
  "Три праздничных колпака",
  "Парк «Риверсайд» солнечным днём",
  "Поднос с капкейками",
  "Бумажные гирлянды в павильоне",
  "Завёрнутый подарок",
  "Мыльные пузыри на солнце",
  "Вырезанная из бумаги цифра семь",
  "Бумажные звёзды",
];

const LIT_KK = [
  "«Риверсайд» саябағы",
  "B павильоны, ойын алаңының жанында",
  "20 дюймдік велосипед",
  "Алғашқы телескоп",
  "Мольберті бар сурет салу жиыны",
  "Пикник үстеліндегі конфетти",
  "Жеті шамы бар торт",
  "Бес түсті әуе шарлары",
  "Көгалдағы жаңа велосипед",
  "Үш мерекелік қалпақ",
  "Күн шуақты түстен кейінгі «Риверсайд» саябағы",
  "Капкейктер салынған науа",
  "Павильондағы қағаз жалаулар",
  "Оралған сыйлық",
  "Күндегі сабын көпіршіктері",
  "Қағаздан кесілген жеті саны",
  "Қағаз жұлдыздар",
];

const zip = (to: readonly string[]) => Object.fromEntries(LIT_EN.map((k, i) => [k, to[i]]));
export const LIT: Record<Locale, Record<string, string>> = { en: {}, ru: zip(LIT_RU), kk: zip(LIT_KK) };
