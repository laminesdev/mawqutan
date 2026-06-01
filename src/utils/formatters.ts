/** Arabic Eastern digits conversion */
export function toEasternArabic(n: number): string {
  const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((c) => d[parseInt(c)])
    .join('');
}

/** Format Date → Arabic 12h time string (e.g. "٥:٣٠ م") */
export function formatTime12(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  return `${toEasternArabic(h12)}:${toEasternArabic(m)} ${ampm}`;
}

/** Human-readable "بعد X س و Y د" from now */
export function minutesUntil(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return '';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `بعد ${toEasternArabic(h)} س و ${toEasternArabic(m)} د`;
  return `بعد ${toEasternArabic(m)} د`;
}

export const DOW = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
