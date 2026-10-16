/**
 * Utility for assigning consistent, high-contrast, accessible color palettes
 * to research paper sources across Q&A, Deep Summary, and Cross-Paper Compare.
 */

export const SOURCE_PALETTES = [
  {
    id: 'indigo',
    name: 'Soft Indigo',
    light: {
      bg: '#eef2ff',
      border: '#c7d2fe',
      text: '#3730a3',
      hoverBg: '#e0e7ff',
      badge: '#4f46e5',
    },
    dark: {
      bg: 'rgba(99, 102, 241, 0.16)',
      border: 'rgba(129, 140, 248, 0.45)',
      text: '#c7d2fe',
      hoverBg: 'rgba(99, 102, 241, 0.28)',
      badge: '#818cf8',
    },
  },
  {
    id: 'purple',
    name: 'Soft Lavender',
    light: {
      bg: '#faf5ff',
      border: '#e9d5ff',
      text: '#6b21a8',
      hoverBg: '#f3e8ff',
      badge: '#9333ea',
    },
    dark: {
      bg: 'rgba(147, 51, 234, 0.16)',
      border: 'rgba(192, 132, 252, 0.45)',
      text: '#e9d5ff',
      hoverBg: 'rgba(147, 51, 234, 0.28)',
      badge: '#c084fc',
    },
  },
  {
    id: 'blue',
    name: 'Soft Blue',
    light: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      hoverBg: '#dbeafe',
      badge: '#2563eb',
    },
    dark: {
      bg: 'rgba(37, 99, 235, 0.16)',
      border: 'rgba(96, 165, 250, 0.45)',
      text: '#bfdbfe',
      hoverBg: 'rgba(37, 99, 235, 0.28)',
      badge: '#60a5fa',
    },
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    light: {
      bg: '#f0f9ff',
      border: '#bae6fd',
      text: '#0369a1',
      hoverBg: '#e0f2fe',
      badge: '#0284c7',
    },
    dark: {
      bg: 'rgba(14, 165, 233, 0.16)',
      border: 'rgba(56, 189, 248, 0.45)',
      text: '#bae6fd',
      hoverBg: 'rgba(14, 165, 233, 0.28)',
      badge: '#38bdf8',
    },
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle',
    light: {
      bg: '#f5f3ff',
      border: '#ddd6fe',
      text: '#5b21b6',
      hoverBg: '#ede9fe',
      badge: '#7c3aed',
    },
    dark: {
      bg: 'rgba(124, 58, 237, 0.16)',
      border: 'rgba(167, 139, 250, 0.45)',
      text: '#ddd6fe',
      hoverBg: 'rgba(124, 58, 237, 0.28)',
      badge: '#a78bfa',
    },
  },
  {
    id: 'slate',
    name: 'Slate Neutral',
    light: {
      bg: '#f8fafc',
      border: '#cbd5e1',
      text: '#334155',
      hoverBg: '#f1f5f9',
      badge: '#475569',
    },
    dark: {
      bg: 'rgba(100, 116, 139, 0.18)',
      border: 'rgba(148, 163, 184, 0.45)',
      text: '#cbd5e1',
      hoverBg: 'rgba(100, 116, 139, 0.28)',
      badge: '#94a3b8',
    },
  },
  {
    id: 'cyan',
    name: 'Soft Cyan',
    light: {
      bg: '#ecfeff',
      border: '#a5f3fc',
      text: '#0e7490',
      hoverBg: '#cffafe',
      badge: '#0891b2',
    },
    dark: {
      bg: 'rgba(6, 182, 212, 0.16)',
      border: 'rgba(34, 211, 238, 0.45)',
      text: '#a5f3fc',
      hoverBg: 'rgba(6, 182, 212, 0.28)',
      badge: '#22d3ee',
    },
  },
  {
    id: 'zinc',
    name: 'Light Neutral',
    light: {
      bg: '#f4f4f5',
      border: '#e4e4e7',
      text: '#3f3f46',
      hoverBg: '#e4e4e7',
      badge: '#52525b',
    },
    dark: {
      bg: 'rgba(113, 113, 122, 0.18)',
      border: 'rgba(161, 161, 170, 0.45)',
      text: '#d4d4d8',
      hoverBg: 'rgba(113, 113, 122, 0.28)',
      badge: '#a1a1aa',
    },
  },
];

/**
 * Deterministically compute a color palette for any given source filename.
 */
export function getSourceColorPalette(sourceName) {
  if (!sourceName) return SOURCE_PALETTES[0];
  const clean = sourceName.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SOURCE_PALETTES.length;
  return SOURCE_PALETTES[index];
}
