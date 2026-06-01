import { useEffect, useState } from 'react';
import type { PrayerInfo } from '../types';
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
    <div className="h-screen flex flex-col items-center p-8 bg-bg overflow-y-auto animate-[fadeIn_0.5s_ease]">
      <div className="relative text-center mt-4 mb-1">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent border-0 text-text-secondary cursor-pointer p-1 rounded-[4px] transition-colors duration-150 hover:text-accent"
          onClick={() => useStore.getState().setShowSettings(true)}
          title="الإعدادات">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="text-[4rem] font-semibold text-text-primary font-arabic tracking-wide leading-none">{timeStr}</div>
        <div className="text-sm text-text-secondary mt-1">{ampm}</div>
      </div>
      <div className="font-arabic text-sm text-text-secondary" dir="rtl">{dateStr}</div>
      <div className="font-arabic text-xs text-text-muted mb-6" dir="rtl">{hijriStr}</div>
      <div className="flex items-center gap-2 justify-center mb-4 cursor-pointer opacity-50 hover:opacity-90 transition-opacity duration-200" onClick={toggleAutoStart} title="تشغيل عند بدء النظام">
        <span className="text-xs text-text-secondary font-arabic">بدء تلقائي</span>
        <span className={`inline-block w-3.5 h-3.5 rounded-full border border-white/20 bg-white/5 transition-all duration-200 ${autoStart ? 'bg-accent border-accent shadow-[0_0_8px_rgba(212,168,67,0.4)]' : ''}`} />
      </div>

      {/* Next prayer card */}
      <div className="bg-[rgba(212,168,67,0.06)] border border-[rgba(212,168,67,0.15)] rounded-[12px] px-6 py-4 w-full max-w-[320px] text-center mb-6 animate-[fadeUp_0.5s_ease]">
        <div className="text-xs text-text-secondary uppercase tracking-widest mb-2">
          {isNextToday ? 'الصلاة القادمة' : 'الصلاة القادمة — غداً'}
        </div>
        <div className="flex justify-center items-center gap-3">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 48 48" width="48" height="48" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <circle cx="24" cy="24" r="20" fill="none" className="stroke-accent/20" strokeWidth="2"/>
              <circle cx="24" cy="24" r="20" fill="none" className="stroke-accent" strokeWidth="2"
                strokeLinecap="round" strokeDasharray="125.6"
                strokeDashoffset="0" transform="rotate(-90 24 24)"/>
            </svg>
            <span className="font-arabic text-2xl font-semibold text-accent">{nextPrayer.nameAr}</span>
          </div>
          <span className="text-xl text-text-primary">{formatTime12(nextPrayer.time)}</span>
        </div>
        <div className="font-arabic text-sm text-text-secondary mt-1">{minutesUntil(nextPrayer.time)}</div>
      </div>

      {/* Prayer list */}
      <div className="w-full max-w-[320px]">
        {prayers.map((p, i) => {
          const isPast = p.time.getTime() < now - 300000;
          const isCurrent = i === currentIdx;
          let cls = 'flex justify-between items-center px-4 py-[0.9rem] border-b border-[rgba(232,224,208,0.05)] transition-all duration-300';
          if (isPast) cls += ' opacity-40';
          if (isCurrent) cls += ' bg-[rgba(212,168,67,0.08)] rounded border-b-transparent my-[0.2rem]';
          return (
            <div key={p.key} className={cls}>
              <span className="font-arabic text-lg text-text-primary">{p.nameAr}</span>
              <span className={`text-base tracking-wide ${isCurrent ? 'text-accent [text-shadow:0_0_20px_rgba(212,168,67,0.3)]' : 'text-row-time'}`}>
                {formatTime12(p.time)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="font-arabic text-xs text-text-verse text-center mt-auto pt-6 pb-2 leading-relaxed" dir="rtl">
        ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
      </div>
    </div>
  );
}
