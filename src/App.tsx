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
    <ErrorBoundary>
      <TitleBar />
      {(!region || showSettings) && <RegionSelect />}
      {region && timer.active && <TimerScreen />}
      {region && !timer.active && !showSettings && <PrayerTimesScreen prayers={prayers} />}
      {toast && (
        <div className="toast" onClick={dismissToast}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2"
            strokeLinecap="round">
            <path d="M12 2L12 8M12 16L12 22M2 12L8 12M16 12L22 12M4.5 4.5L8.5 8.5M15.5 15.5L19.5 19.5M4.5 19.5L8.5 15.5M15.5 8.5L19.5 4.5"/>
          </svg>
          <div className="toast-text">
            <span>حان وقت صلاة {toast.nameAr}</span>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
