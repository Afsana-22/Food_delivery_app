const keywordThemes = [
  { keywords: ['biryani', 'rice'], palette: ['#7c2d12', '#ea580c'], badge: 'BIRYANI' },
  { keywords: ['dosa', 'dosai', 'idli', 'vada', 'pongal'], palette: ['#92400e', '#f59e0b'], badge: 'TIFIN' },
  { keywords: ['parotta', 'paratha', 'naan'], palette: ['#78350f', '#f97316'], badge: 'BREAD' },
  { keywords: ['chicken', 'mutton', 'kozhi', 'fish', 'curry', 'chukka', 'gravy'], palette: ['#7f1d1d', '#ef4444'], badge: 'NON VEG' },
  { keywords: ['sweet', 'halwa', 'ladoo', 'mysore', 'payasam', 'basundi', 'kulfi'], palette: ['#831843', '#ec4899'], badge: 'SWEET' },
  { keywords: ['jigarthanda', 'rose milk', 'juice', 'drink', 'tea', 'coffee'], palette: ['#1d4ed8', '#38bdf8'], badge: 'DRINK' },
  { keywords: ['veg', 'keerai', 'paneer', 'gobi', 'millet', 'upma'], palette: ['#166534', '#22c55e'], badge: 'VEG' },
  { keywords: ['snack', 'mixture', 'murukku', 'bejo', 'atho'], palette: ['#4c1d95', '#8b5cf6'], badge: 'SNACK' },
  { keywords: ['hotel', 'mess', 'kitchen', 'kadai'], palette: ['#0f172a', '#475569'], badge: 'RESTAURANT' }
];

function escapeText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pickTheme(name = '') {
  const lower = name.toLowerCase();
  return keywordThemes.find((theme) => theme.keywords.some((keyword) => lower.includes(keyword))) || {
    palette: ['#111827', '#f97316'],
    badge: 'ZAPTASTE'
  };
}

function shortLabel(name = '') {
  const words = name.split(' ').filter(Boolean).slice(0, 2);
  if (words.length === 0) return 'ZT';
  return words.map((word) => word[0]).join('').toUpperCase();
}

export function createFoodArtwork(name, subtitle = '') {
  const theme = pickTheme(name);
  const title = escapeText(name.length > 24 ? `${name.slice(0, 24)}...` : name);
  const note = escapeText(subtitle.length > 30 ? `${subtitle.slice(0, 30)}...` : subtitle || theme.badge);
  const initials = shortLabel(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.palette[0]}" />
          <stop offset="100%" stop-color="${theme.palette[1]}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="40" fill="url(#g)" />
      <circle cx="540" cy="90" r="92" fill="rgba(255,255,255,0.10)" />
      <circle cx="120" cy="400" r="110" fill="rgba(255,255,255,0.08)" />
      <rect x="38" y="38" width="180" height="42" rx="21" fill="rgba(255,255,255,0.16)" />
      <text x="128" y="65" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#fff">${theme.badge}</text>
      <text x="52" y="220" font-family="Arial, sans-serif" font-size="120" font-weight="800" fill="rgba(255,255,255,0.18)">${initials}</text>
      <text x="52" y="320" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#fff">${title}</text>
      <text x="52" y="366" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.84)">${note}</text>
      <rect x="52" y="392" width="220" height="12" rx="6" fill="rgba(255,255,255,0.24)" />
    </svg>
  `.trim();

  let encoded;
  try {
    encoded = btoa(unescape(encodeURIComponent(svg)));
  } catch(e) {
    encoded = btoa(svg);
  }
  return `data:image/svg+xml;base64,${encoded}`;
}

export function resolveFoodImage(name, subtitle = '', original = '') {
  if (original && typeof original === 'string') {
    if (original.startsWith('http') || original.startsWith('/') || original.startsWith('data:image/')) {
      return original;
    }
  }
  return '/demo_food.png';
}
