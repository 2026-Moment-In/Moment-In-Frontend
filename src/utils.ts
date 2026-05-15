export function formatWeddingDate(value?: string) {
  if (!value) return '2026.06.20';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll('. ', '.')
    .replace(/\.$/, '');
}

export function getWeddingTitle(displayName?: string) {
  return displayName ? `${displayName} 님의 순간` : '김다영 ♥ 오시온';
}
