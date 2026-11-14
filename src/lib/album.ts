// Фотоальбом события: общие типы и демо-фото (иллюстрации из макета), общий для сервера и браузера.

export type AlbumPhoto = {
  id: string;
  guest: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  createdAt: string;
  seed?: boolean;
};

export type AlbumState = {
  albumUrl: string | null;
  photos: AlbumPhoto[];
  count: number;
  guests: number;
};

// Демо-альбом, чтобы на питче лента не была пустой. Лежит в public/album-seed, в базу не пишется.
const SEED: Array<[string, string, string]> = [
  ["confetti", "Sarah", "Confetti over the picnic table"],
  ["cake", "Rachel", "Cake with seven candles"],
  ["balloons", "Daniel", "Balloons in five colors"],
  ["bike", "Sarah", "The new bike on the grass"],
  ["hats", "Priya", "Three party hats"],
  ["park", "Jen", "Riverside Park on a sunny afternoon"],
  ["cupcakes", "Mark", "A tray of cupcakes"],
  ["bunting", "Kate", "Paper bunting across the pavilion"],
  ["gift", "Rachel", "A wrapped gift"],
  ["bubbles", "Tom", "Soap bubbles in the sun"],
  ["seven", "Sarah", "A paper-cut number seven"],
  ["stars", "Chris", "Paper stars"],
];

export const SEED_ALT: Record<string, string> = Object.fromEntries(SEED.map(([k, , alt]) => [`seed-${k}`, alt]));

export function seedPhotos(): AlbumPhoto[] {
  const base = Date.UTC(2026, 11, 5, 21, 0, 0);
  return SEED.map(([key, guest], i) => ({
    id: `seed-${key}`,
    guest,
    src: `/album-seed/${key}.svg`,
    thumb: `/album-seed/${key}.svg`,
    width: 1200,
    height: 900,
    createdAt: new Date(base - i * 7 * 60_000).toISOString(),
    seed: true,
  }));
}

export const ALBUM_COVER = "/album-seed/seven.svg";

// Куда можно сослаться как на «альбом фотографа»: только известные фотохостинги и облака
export const ALBUM_HOSTS = [
  "drive.google.com",
  "photos.google.com",
  "photos.app.goo.gl",
  "dropbox.com",
  "www.dropbox.com",
  "icloud.com",
  "www.icloud.com",
  "share.icloud.com",
  "onedrive.live.com",
  "1drv.ms",
  "flickr.com",
  "www.flickr.com",
  "flic.kr",
  "pixieset.com",
  "smugmug.com",
  "www.smugmug.com",
  "disk.yandex.ru",
  "disk.yandex.com",
  "yadi.sk",
];

export function albumHostAllowed(host: string) {
  const h = host.toLowerCase();
  return ALBUM_HOSTS.some((a) => h === a || h.endsWith(`.${a}`));
}

export function albumHostLabel(url: string) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    if (h.includes("google")) return "Google Photos";
    if (h.includes("goo.gl")) return "Google Photos";
    if (h.includes("dropbox")) return "Dropbox";
    if (h.includes("icloud")) return "iCloud";
    if (h.includes("1drv") || h.includes("onedrive")) return "OneDrive";
    if (h.includes("flic")) return "Flickr";
    if (h.includes("yandex") || h.includes("yadi")) return "Yandex Disk";
    return h;
  } catch {
    return "the album";
  }
}

export const albumUrlFor = (slug: string) => `/p/${slug}/album`;
export const albumPhotosUrlFor = (slug: string) => `/p/${slug}/album/photos`;
