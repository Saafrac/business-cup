// Темы приглашения (макет «Party Invite»): цвета и узоры — в src/app/invite.css, картинки — public/invite.

export const THEMES = [
  { id: "classic", name: "Classic", note: "Any event", pro: false },
  { id: "dino", name: "Dino Party", note: "Kids, ages 3 to 8", pro: false },
  { id: "space", name: "Space Mission", note: "Kids, ages 6 to 12", pro: false },
  { id: "unicorn", name: "Unicorn Dreams", note: "Kids, ages 3 to 8", pro: true },
  { id: "game", name: "Game Day", note: "Kids, ages 6 to 12", pro: true },
  { id: "sea", name: "Under the Sea", note: "Kids, ages 3 to 8", pro: true },
  { id: "art", name: "Art Party", note: "Kids, ages 6 to 12", pro: true },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "classic";

export const isThemeId = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

export const themeOf = (id: ThemeId) => THEMES.find((t) => t.id === id) ?? THEMES[0];

export const coverSrc = (id: ThemeId) => `/invite/cover/${id}.svg`;
