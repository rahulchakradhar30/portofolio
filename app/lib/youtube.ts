const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|m\.youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#/]+)/i,
  /[?&]v=([^&\n?#/]+)/i,
];

export function getYouTubeId(url: string) {
  const value = url.trim();
  if (!value) return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function normalizeYouTubeUrl(url: string) {
  const id = getYouTubeId(url);
  if (!id) return url.trim();
  return `https://www.youtube.com/watch?v=${id}`;
}

export function getYouTubeEmbedUrl(url: string) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const base = `https://www.youtube-nocookie.com/embed/${id}`;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });

  return `${base}?${params.toString()}`;
}

export function normalizeYouTubeUrlList(urls: string[]) {
  return urls.map((url) => normalizeYouTubeUrl(url)).filter(Boolean);
}