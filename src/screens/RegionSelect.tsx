import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { CALC_METHOD_NAMES } from '../utils/prayerTimes';

const CITIES = [
  { name: 'الجزائر (Algiers)', lat: 36.7538, lng: 3.0588 },
  { name: 'وهران (Oran)', lat: 35.699, lng: -0.633 },
  { name: 'قسنطينة (Constantine)', lat: 36.365, lng: 6.6147 },
  { name: 'عنابة (Annaba)', lat: 36.9, lng: 7.7667 },
  { name: 'تيزي وزو (Tizi Ouzou)', lat: 36.7167, lng: 4.05 },
  { name: 'سطيف (Sétif)', lat: 36.19, lng: 5.41 },
  { name: 'البليدة (Blida)', lat: 36.4722, lng: 2.8283 },
  { name: 'باتنة (Batna)', lat: 35.555, lng: 6.1741 },
  { name: 'الجلفة (Djelfa)', lat: 34.6667, lng: 3.25 },
  { name: 'تلمسان (Tlemcen)', lat: 34.8783, lng: -1.315 },
  { name: 'بجاية (Béjaïa)', lat: 36.75, lng: 5.0667 },
  { name: 'بسكرة (Biskra)', lat: 34.85, lng: 5.7333 },
  { name: 'تبسة (Tébessa)', lat: 35.4, lng: 8.1167 },
  { name: 'الشلف (Chlef)', lat: 36.1647, lng: 1.3317 },
  { name: 'ورقلة (Ouargla)', lat: 31.95, lng: 5.3167 },
  { name: 'مكة (Makkah)', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة (Madinah)', lat: 24.4672, lng: 39.6112 },
  { name: 'القاهرة (Cairo)', lat: 30.0444, lng: 31.2357 },
  { name: 'دبي (Dubai)', lat: 25.2048, lng: 55.2708 },
];

export default function RegionSelect() {
  const setRegion = useStore((s) => s.setRegion);
  const [mode, setMode] = useState<'city' | 'custom'>('city');
  const [selectedIdx, setSelectedIdx] = useState('0');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [method, setMethod] = useState('MWL');

  const handleStart = () => {
    let lat: number, lng: number, name: string;
    if (mode === 'city') {
      const city = CITIES[parseInt(selectedIdx)];
      lat = city.lat;
      lng = city.lng;
      name = city.name;
    } else {
      lat = parseFloat(customLat);
      lng = parseFloat(customLng);
      name = `${lat}, ${lng}`;
    }
    if (isNaN(lat) || isNaN(lng)) return;
    setRegion({ cityName: name, latitude: lat, longitude: lng, calculationMethod: method });
  };

  return (
    <div className="region-container">
      <div className="region-bg" />
      <div className="region-content">
        <h1 className="region-title">مَوْقُوتًا</h1>
        <p className="region-subtitle">الصلاة على وقتها</p>

        <div className="region-form">
          <div className="region-mode-toggle">
            <button
              className={`region-toggle-btn ${mode === 'city' ? 'active' : ''}`}
              onClick={() => setMode('city')}
            >
              مدينة
            </button>
            <button
              className={`region-toggle-btn ${mode === 'custom' ? 'active' : ''}`}
              onClick={() => setMode('custom')}
            >
              إحداثيات
            </button>
          </div>

          {mode === 'city' ? (
            <select className="region-select" value={selectedIdx} onChange={(e) => setSelectedIdx(e.target.value)}>
              {CITIES.map((c, i) => (
                <option key={i} value={i}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="region-coords">
              <input
                className="region-input"
                placeholder="خط العرض (Lat)"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                type="number"
                step="any"
              />
              <input
                className="region-input"
                placeholder="خط الطول (Lng)"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                type="number"
                step="any"
              />
            </div>
          )}

          <select className="region-select" value={method} onChange={(e) => setMethod(e.target.value)}>
            {Object.entries(CALC_METHOD_NAMES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <button className="region-start-btn" onClick={handleStart}>
            ابدأ
          </button>
        </div>

        <p className="region-verse">﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾</p>
      </div>
    </div>
  );
}
