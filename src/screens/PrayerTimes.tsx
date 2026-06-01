import { useEffect, useState } from 'react';
import { PrayerInfo } from '../utils/prayerTimes';
import { getHijriDate } from '../utils/hijri';
import { useStore } from '../stores/useStore';

function toEasternArabic(n: number): string {
  const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((c) => d[parseInt(c)])
    .join('');
}

function formatTime12(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  return `${toEasternArabic(h12)}:${toEasternArabic(m)} ${ampm}`;
}

function minutesUntil(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return '';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `بعد ${toEasternArabic(h)} س و ${toEasternArabic(m)} د`;
  return `بعد ${toEasternArabic(m)} د`;
}

const DOW = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

interface Props {
  prayers: PrayerInfo[];
}

export default function PrayerTimes({ prayers }: Props) {
  const [now, setNow] = useState(Date.now());
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    window.electronAPI?.getAutoStart().then(setAutoStart);
  }, []);

  const dt = new Date(now);
  const h = dt.getHours();
  const m = dt.getMinutes();
  const ampm = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  const timeStr = `${toEasternArabic(h12)}:${toEasternArabic(m)}`;
  const dateStr = `${DOW[dt.getDay()]}، ${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
  const hijri = getHijriDate();
  const hijriStr = `${toEasternArabic(hijri.day)} ${hijri.month} ${toEasternArabic(hijri.year)}ﻫ`;

  const toggleAutoStart = () => {
    const next = !autoStart;
    setAutoStart(next);
    window.electronAPI?.setAutoStart(next);
  };

  // determine current & next
  let currentIdx = -1;
  for (let i = 0; i < prayers.length; i++) {
    if (prayers[i].time.getTime() <= now) currentIdx = i;
  }
  const nextIdx = currentIdx + 1 < prayers.length ? currentIdx + 1 : 0;
  // next prayer is today IF no prayer has passed yet OR we haven't wrapped to next day's Fajr
  const isNextToday = currentIdx === -1 || nextIdx !== 0;
  const nextPrayer = prayers[nextIdx];

  return (
    <div className="prayer-container">
      <div className="prayer-header">
        <button className="prayer-settings" onClick={() => useStore.getState().setShowSettings(true)}
          title="الإعدادات">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="prayer-current-time">{timeStr}</div>
        <div className="prayer-ampm">{ampm}</div>
        <div className="prayer-autostart" onClick={toggleAutoStart} title="تشغيل عند بدء النظام">
          <span className={`autostart-toggle ${autoStart ? 'on' : ''}`} />
        </div>
      </div>
      <div className="prayer-date">{dateStr}</div>
      <div className="prayer-hijri">{hijriStr}</div>

      {/* Next prayer card */}
      <div className="prayer-next-card">
        <div className="prayer-next-label">
          {isNextToday ? 'الصلاة القادمة' : 'الصلاة القادمة — غداً'}
        </div>
        <div className="prayer-next-content">
          <span className="prayer-next-name">{nextPrayer.nameAr}</span>
          <span className="prayer-next-time">{formatTime12(nextPrayer.time)}</span>
        </div>
        <div className="prayer-next-remaining">{minutesUntil(nextPrayer.time)}</div>
      </div>

      {/* Prayer list */}
      <div className="prayer-list">
        {prayers.map((p, i) => {
          const isPast = p.time.getTime() < now - 300000;
          const isCurrent = i === currentIdx;
          let cls = 'prayer-row';
          if (isPast) cls += ' past';
          if (isCurrent) cls += ' active';
          return (
            <div key={p.key} className={cls}>
              <span className="prayer-row-name">{p.nameAr}</span>
              <span className={`prayer-row-time${isCurrent ? ' glow' : ''}`}>
                {formatTime12(p.time)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="prayer-footer">
        ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
      </div>
    </div>
  );
}
