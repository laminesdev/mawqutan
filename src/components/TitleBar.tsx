import { useStore } from '../stores/useStore';

export default function TitleBar() {
  const timer = useStore((s) => s.timer);
  if (timer.active) return null;
  return (
    <div className="title-bar">
      <div className="title-bar-buttons">
        <button className="title-btn minimize" title="تصغير" onClick={() => window.electronAPI?.minimize()} />
        <button className="title-btn close" title="إغلاق" onClick={() => window.electronAPI?.close()} />
      </div>
    </div>
  );
}
