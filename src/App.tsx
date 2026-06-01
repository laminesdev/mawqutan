import RegionSelect from './screens/RegionSelect';
import PrayerTimesScreen from './screens/PrayerTimes';
import TimerScreen from './screens/Timer';
import ErrorBoundary from './components/ErrorBoundary';
import TitleBar from './components/TitleBar';
import { useStore } from './stores/useStore';
import { usePrayerMonitor } from './hooks/usePrayerMonitor';

export default function App() {
  const region = useStore((s) => s.region);
  const showSettings = useStore((s) => s.showSettings);
  const timer = useStore((s) => s.timer);
  const toast = useStore((s) => s.toast);
  const dismissToast = useStore((s) => s.dismissToast);

  const prayers = usePrayerMonitor();

  return (
    <>
      <TitleBar />
      <ErrorBoundary>
        {(!region || showSettings) && <RegionSelect />}
      </ErrorBoundary>
      <ErrorBoundary>
        {region && timer.active && <TimerScreen />}
      </ErrorBoundary>
      <ErrorBoundary>
        {region && !timer.active && !showSettings && <PrayerTimesScreen prayers={prayers} />}
      </ErrorBoundary>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col bg-toast-bg border border-border rounded cursor-pointer z-[999] max-w-[300px] animate-[toastIn_0.4s_ease]" onClick={dismissToast}>
          <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2"
              strokeLinecap="round">
              <path d="M12 2L12 8M12 16L12 22M2 12L8 12M16 12L22 12M4.5 4.5L8.5 8.5M15.5 15.5L19.5 19.5M4.5 19.5L8.5 15.5M15.5 8.5L19.5 4.5"/>
            </svg>
            <div className="font-arabic text-sm text-text-primary">
              <span>حان وقت صلاة {toast.nameAr}</span>
            </div>
          </div>
          <div className="h-[2px] bg-white/5 rounded-full mx-4 mb-1.5 overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-[shrink_6s_linear_forwards] origin-left" style={{ animation: 'shrink 6s linear forwards' }} />
          </div>
        </div>
      )}
    </>
  );
}
