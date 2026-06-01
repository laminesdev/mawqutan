import { useStore } from '../stores/useStore';

export default function TitleBar() {
  const timer = useStore((s) => s.timer);
  if (timer.active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex h-[32px] items-center px-3 bg-bg/80 backdrop-blur-sm" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button className="w-3 h-3 rounded-full border-0 cursor-pointer bg-[#febc2e] hover:opacity-80 transition-opacity" title="تصغير" onClick={() => window.electronAPI?.minimize()} />
        <button className="w-3 h-3 rounded-full border-0 cursor-pointer bg-[#ff5f57] hover:opacity-80 transition-opacity" title="إغلاق" onClick={() => window.electronAPI?.close()} />
      </div>
    </div>
  );
}
