// Темы приглашения (макет «Party Invite»): цвета и узоры — в src/app/invite.css, картинки — public/invite.
// Названия и подписи — в словаре: tm.<id> и tm.note.<note>.

export const THEMES = [
  { id: "classic", note: "any", pro: false },
  { id: "dino", note: "kids38", pro: false },
  { id: "space", note: "kids612", pro: false },
  { id: "unicorn", note: "kids38", pro: true },
  { id: "game", note: "kids612", pro: true },
  { id: "sea", note: "kids38", pro: true },
  { id: "art", note: "kids612", pro: true },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "classic";

export const isThemeId = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

export const themeOf = (id: ThemeId) => THEMES.find((t) => t.id === id) ?? THEMES[0];

export const themeName = (id: ThemeId) => `tm.${id}` as const;

export const coverSrc = (id: ThemeId) => `/invite/cover/${id}.svg`;
