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
      className={`timer-container ${visible && !exiting ? 'visible' : ''}`}
      style={exiting ? { opacity: 0, transition: 'opacity 0.5s ease' } : undefined}
    >
      <div className="timer-bg" style={{ background: bgGrad }} />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="timer-particle"
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

      <div className="timer-content">
        <h1 className="timer-prayer-name">{timer.prayerNameAr}</h1>
        <div className="timer-ornament">✦</div>

        <div className="timer-circle">
          <svg viewBox="0 0 280 280" className="timer-svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4a843" />
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
              className="timer-circle-progress"
            />
          </svg>
          <div className="timer-digits">{timeStr}</div>
        </div>

        <p className="timer-subtitle">دقائق للتأمل</p>
        <p className="timer-verse">﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾</p>
      </div>
    </div>
  );
}
