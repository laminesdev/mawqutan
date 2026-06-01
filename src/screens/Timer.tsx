import { useEffect, useState } from 'react';
import { useStore } from '../stores/useStore';

function toEasternArabic(n: number): string {
  const d = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((c) => d[parseInt(c)])
    .join('');
}

const PRAYER_COLORS: Record<string, string[]> = {
  Fajr: ['#1a1a3e', '#0a0e27', '#2d1b69'],
  Dhuhr: ['#2a1b00', '#1a0e00', '#5c3a00'],
  Asr: ['#1e0e00', '#0a0500', '#3a1a00'],
  Maghrib: ['#2a0000', '#1a0000', '#5c0000'],
  Isha: ['#0a0e27', '#05081a', '#1a0a2e'],
};

export default function Timer() {
  const timer = useStore((s) => s.timer);
  const deactivateTimer = useStore((s) => s.deactivateTimer);
  const [now, setNow] = useState(Date.now());
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, timer.endAt - now);
  const totalMs = 300000;
  const progress = 1 - remaining / totalMs;

  useEffect(() => {
    if (remaining <= 0 && !exiting) {
      setExiting(true);
      setTimeout(deactivateTimer, 600);
    }
  }, [remaining, exiting, deactivateTimer]);

  if (remaining <= 0 && !visible) return null;

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const timeStr = `${toEasternArabic(minutes)}:${toEasternArabic(seconds)}`;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * progress;

  const colors = PRAYER_COLORS[timer.prayerName] || PRAYER_COLORS['Fajr'];
  const bgGrad = `radial-gradient(ellipse at 30% 40%, ${colors[0]} 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 60%, ${colors[2]} 0%, transparent 60%),
                  linear-gradient(135deg, ${colors[1]}, ${colors[0]})`;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-bg overflow-hidden transition-opacity duration-[0.8s] z-[200] ${
        visible && !exiting ? 'opacity-100' : 'opacity-0'
      }`}
      style={exiting ? { transition: 'opacity 0.5s ease' } : undefined}
    >
      <div
        className="absolute inset-[-100%] pointer-events-none animate-timer-bg"
        style={{ background: bgGrad }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 23 + 7) % 100}%`,
            width: `${(i % 3) + 2}px`,
            height: `${(i % 3) + 2}px`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + (i % 3)}s`,
            background: i % 2 === 0 ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}

      <div
        className={`relative z-[1] text-center transition-all duration-[0.8s] delay-[0.4s] ${
          visible && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'
        }`}
      >
        <h1 className="font-arabic text-[2.5rem] font-semibold text-text-primary m-0 [text-shadow:0_0_30px_rgba(212,168,67,0.2)]">
          {timer.prayerNameAr}
        </h1>
        <div className="text-accent text-[0.9rem] my-2 mb-6 opacity-50 animate-ornament-pulse">
          ✦
        </div>

        <div className="relative w-[280px] h-[280px] mx-auto">
          <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="#f0d080" />
              </linearGradient>
            </defs>
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="rgba(232,224,208,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 140 140)"
              className="drop-shadow-[0_0_8px_rgba(212,168,67,0.4)]"
              style={{ transition: 'stroke-dashoffset 0.3s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-arabic text-7xl font-semibold text-text-primary tracking-[0.08em] [text-shadow:0_0_40px_rgba(212,168,67,0.2)]">
            {timeStr}
          </div>
        </div>

        <p className="font-arabic text-[1.1rem] text-text-secondary mt-4">دقائق للتأمل</p>
        <p className="font-arabic text-[0.8rem] text-text-verse mt-3 leading-[1.6] max-w-[300px] mx-auto [direction:rtl]">
          ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
        </p>

        <button
          onClick={deactivateTimer}
          className="mt-6 text-xs font-arabic text-text-muted hover:text-text-secondary transition-colors duration-200 cursor-pointer bg-transparent border-none"
        >
          تخطي ←
        </button>
      </div>
    </div>
  );
}
