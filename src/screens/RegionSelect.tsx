import { useEffect, useMemo, useState, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { CALC_METHOD_NAMES } from '../utils/prayerTimes';

const CITIES = [
  { name: 'أدرار (Adrar)', lat: 27.874, lng: -0.294 },
  { name: 'الشلف (Chlef)', lat: 36.165, lng: 1.332 },
  { name: 'الأغواط (Laghouat)', lat: 33.8, lng: 2.883 },
  { name: 'أم البواقي (Oum El Bouaghi)', lat: 35.878, lng: 7.114 },
  { name: 'باتنة (Batna)', lat: 35.555, lng: 6.174 },
  { name: 'بجاية (Béjaïa)', lat: 36.75, lng: 5.067 },
  { name: 'بسكرة (Biskra)', lat: 34.85, lng: 5.733 },
  { name: 'بشار (Béchar)', lat: 31.617, lng: -2.217 },
  { name: 'البليدة (Blida)', lat: 36.472, lng: 2.828 },
  { name: 'البويرة (Bouira)', lat: 36.378, lng: 3.893 },
  { name: 'تمنراست (Tamanrasset)', lat: 22.785, lng: 5.523 },
  { name: 'تبسة (Tébessa)', lat: 35.4, lng: 8.117 },
  { name: 'تلمسان (Tlemcen)', lat: 34.878, lng: -1.315 },
  { name: 'تيارت (Tiaret)', lat: 35.369, lng: 1.321 },
  { name: 'تيزي وزو (Tizi Ouzou)', lat: 36.717, lng: 4.05 },
  { name: 'الجزائر (Algiers)', lat: 36.754, lng: 3.059 },
  { name: 'الجلفة (Djelfa)', lat: 34.667, lng: 3.25 },
  { name: 'جيجل (Jijel)', lat: 36.821, lng: 5.767 },
  { name: 'سطيف (Sétif)', lat: 36.19, lng: 5.41 },
  { name: 'سعيدة (Saïda)', lat: 34.833, lng: 0.15 },
  { name: 'سكيكدة (Skikda)', lat: 36.867, lng: 6.9 },
  { name: 'سيدي بلعباس (Sidi Bel Abbès)', lat: 35.195, lng: -0.637 },
  { name: 'عنابة (Annaba)', lat: 36.9, lng: 7.767 },
  { name: 'قالمة (Guelma)', lat: 36.462, lng: 7.426 },
  { name: 'قسنطينة (Constantine)', lat: 36.365, lng: 6.615 },
  { name: 'المدية (Médéa)', lat: 36.264, lng: 2.75 },
  { name: 'مستغانم (Mostaganem)', lat: 35.933, lng: 0.083 },
  { name: "المسيلة (M'Sila)", lat: 35.706, lng: 4.545 },
  { name: 'معسكر (Mascara)', lat: 35.397, lng: 0.14 },
  { name: 'ورقلة (Ouargla)', lat: 31.95, lng: 5.317 },
  { name: 'وهران (Oran)', lat: 35.699, lng: -0.633 },
  { name: 'البيض (El Bayadh)', lat: 33.683, lng: 1.017 },
  { name: 'إليزي (Illizi)', lat: 26.5, lng: 8.467 },
  { name: 'برج بوعريريج (Bordj Bou Arréridj)', lat: 36.067, lng: 4.767 },
  { name: 'بومرداس (Boumerdès)', lat: 36.767, lng: 3.483 },
  { name: 'الطارف (El Taref)', lat: 36.767, lng: 8.317 },
  { name: 'تندوف (Tindouf)', lat: 27.667, lng: -8.133 },
  { name: 'تسمسيلت (Tissemsilt)', lat: 35.607, lng: 1.811 },
  { name: 'الوادي (El Oued)', lat: 33.367, lng: 6.867 },
  { name: 'خنشلة (Khenchela)', lat: 35.417, lng: 7.133 },
  { name: 'سوق أهراس (Souk Ahras)', lat: 36.283, lng: 7.95 },
  { name: 'تيبازة (Tipaza)', lat: 36.583, lng: 2.45 },
  { name: 'ميلة (Mila)', lat: 36.45, lng: 6.267 },
  { name: 'عين الدفلى (Aïn Defla)', lat: 36.25, lng: 1.967 },
  { name: 'النعامة (Naâma)', lat: 33.267, lng: -0.317 },
  { name: 'عين تموشنت (Aïn Témouchent)', lat: 35.3, lng: -1.133 },
  { name: 'غرداية (Ghardaïa)', lat: 32.483, lng: 3.667 },
  { name: 'غليزان (Relizane)', lat: 35.733, lng: 0.55 },
  { name: 'تيميمون (Timimoun)', lat: 29.25, lng: 0.233 },
  { name: 'برج باجي مختار (Bordj Badji Mokhtar)', lat: 21.328, lng: 0.951 },
  { name: 'أولاد جلال (Ouled Djellal)', lat: 34.433, lng: 5.067 },
  { name: 'بني عباس (Béni Abbès)', lat: 30.133, lng: -2.167 },
  { name: 'عين صالح (In Salah)', lat: 27.217, lng: 2.467 },
  { name: 'عين قزام (In Guezzam)', lat: 19.567, lng: 5.767 },
  { name: 'تقرت (Touggourt)', lat: 33.1, lng: 6.067 },
  { name: 'جانت (Djanet)', lat: 24.55, lng: 9.483 },
  { name: "المغير (El M'Ghair)", lat: 33.95, lng: 5.917 },
  { name: 'المنيعة (El Meniaa)', lat: 30.583, lng: 2.867 },
  // International
  { name: 'مكة (Makkah)', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة (Madinah)', lat: 24.4672, lng: 39.6112 },
  { name: 'القاهرة (Cairo)', lat: 30.0444, lng: 31.2357 },
  { name: 'دبي (Dubai)', lat: 25.2048, lng: 55.2708 },
  { name: 'عمّان (Amman)', lat: 31.9454, lng: 35.9284 },
  { name: 'الرياض (Riyadh)', lat: 24.7136, lng: 46.6753 },
  { name: 'الدار البيضاء (Casablanca)', lat: 33.5731, lng: -7.5898 },
  { name: 'تونس (Tunis)', lat: 36.8065, lng: 10.1815 },
  { name: 'طرابلس (Tripoli)', lat: 32.8872, lng: 13.1913 },
  { name: 'دمشق (Damascus)', lat: 33.5131, lng: 36.3093 },
  { name: 'بغداد (Baghdad)', lat: 33.3152, lng: 44.3661 },
  { name: 'القدس (Jerusalem)', lat: 31.7683, lng: 35.2137 },
  { name: 'أسطنبول (Istanbul)', lat: 41.0082, lng: 28.9784 },
  { name: 'الكويت (Kuwait City)', lat: 29.3759, lng: 47.9774 },
  { name: 'مسقط (Muscat)', lat: 23.588, lng: 58.3829 },
  { name: 'الدوحة (Doha)', lat: 25.2854, lng: 51.531 },
  { name: 'المنامة (Manama)', lat: 26.2235, lng: 50.5876 },
  { name: 'صنعاء (Sanaa)', lat: 15.3694, lng: 44.191 },
  { name: 'الخرطوم (Khartoum)', lat: 15.5007, lng: 32.5599 },
  { name: 'نواكشوط (Nouakchott)', lat: 18.0735, lng: -15.9582 },
];

export default function RegionSelect() {
  const setRegion = useStore((s) => s.setRegion);
  const setShowSettings = useStore((s) => s.setShowSettings);
  const [mode, setMode] = useState<'city' | 'custom'>('city');
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState('15'); // default: Algiers
  const [starting, setStarting] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [method, setMethod] = useState('MWL');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return CITIES;
    const q = search.toLowerCase();
    return CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (filtered.length === 1 && search.trim()) {
      const idx = CITIES.indexOf(filtered[0]);
      if (idx !== -1) setSelectedIdx(String(idx));
    }
  }, [filtered, search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCity = CITIES[parseInt(selectedIdx)];

  const handleStart = () => {
    if (starting) return;
    let lat: number, lng: number, name: string;
    if (mode === 'city') {
      const city = CITIES[parseInt(selectedIdx)];
      if (!city) return;
      lat = city.lat;
      lng = city.lng;
      name = city.name;
    } else {
      lat = parseFloat(customLat);
      lng = parseFloat(customLng);
      name = `${lat}, ${lng}`;
    }
    if (isNaN(lat) || isNaN(lng)) return;
    setStarting(true);
    setTimeout(() => {
      setRegion({ cityName: name, latitude: lat, longitude: lng, calculationMethod: method });
      setShowSettings(false);
    }, 200);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-bg relative overflow-hidden" role="main" aria-label="اختيار المنطقة">
      <div className="absolute inset-[-50%] pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,168,67,0.04)_0%,transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(26,10,46,0.3)_0%,transparent_50%)] animate-[bgShift_12s_ease-in-out_infinite_alternate]" aria-hidden="true" />
      <div className="relative z-10 text-center p-8 max-[480px]:p-4 max-w-[360px] w-full animate-[fadeUp_0.8s_ease_forwards]">
        <h1 className="font-arabic text-5xl max-[360px]:text-[2.5rem] font-bold text-text-primary m-0 [text-shadow:0_0_40px_rgba(212,168,67,0.15)]" dir="rtl">مَوْقُوتًا</h1>
        <p className="font-arabic text-base text-text-secondary mt-1 mb-8 mx-0" dir="rtl">الصلاة على وقتها</p>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2 justify-center" role="tablist" aria-label="طريقة الاختيار">
            <button
              className={`bg-surface border border-border text-text-secondary px-4 py-[0.4rem] rounded cursor-pointer text-sm transition-all duration-200 font-arabic flex-1 ${
                mode === 'city' ? 'bg-accent/12 border-accent/30 text-accent' : ''
              }`}
              onClick={() => setMode('city')}
              role="tab"
              aria-selected={mode === 'city'}
              dir="rtl"
            >
              مدينة
            </button>
            <button
              className={`bg-surface border border-border text-text-secondary px-4 py-[0.4rem] rounded cursor-pointer text-sm transition-all duration-200 font-arabic flex-1 ${
                mode === 'custom' ? 'bg-accent/12 border-accent/30 text-accent' : ''
              }`}
              onClick={() => setMode('custom')}
              role="tab"
              aria-selected={mode === 'custom'}
              dir="rtl"
            >
              إحداثيات
            </button>
          </div>

          {mode === 'city' ? (
            <>
              <input
                className="bg-surface border border-border text-text-primary px-4 py-[0.7rem] rounded text-sm w-full font-arabic text-right transition-[border-color] duration-150 box-border placeholder:text-placeholder focus:outline-none focus:border-accent/40"
                placeholder="ابحث عن مدينة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                dir="rtl"
                aria-label="ابحث عن مدينة"
                aria-autocomplete="list"
                role="combobox"
                aria-expanded={dropdownOpen}
                aria-controls="city-dropdown"
              />

              {/* Custom dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="bg-surface border border-border text-text-primary w-full py-3 px-4 rounded text-sm font-arabic text-right cursor-pointer flex items-center justify-between focus:outline-none focus:border-accent/40 transition-colors duration-150"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  aria-label="اختر مدينة"
                  dir="rtl"
                >
                  <span>{selectedCity?.name || 'اختر مدينة'}</span>
                  <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    id="city-dropdown"
                    className="absolute z-50 w-full mt-1 bg-surface-raised border border-border rounded shadow-lg max-h-[240px] overflow-y-auto"
                    role="listbox"
                    aria-label="قائمة المدن"
                  >
                    {filtered.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-muted font-arabic text-right" dir="rtl">لا توجد نتائج</div>
                    ) : (
                      filtered.map((c) => {
                        const realIdx = CITIES.indexOf(c);
                        const isSelected = selectedIdx === String(realIdx);
                        return (
                          <div
                            key={realIdx}
                            className={`px-4 py-2.5 text-sm font-arabic text-right cursor-pointer transition-colors duration-100 ${
                              isSelected
                                ? 'bg-accent/12 text-accent'
                                : 'text-text-primary hover:bg-surface'
                            }`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedIdx(String(realIdx));
                              setDropdownOpen(false);
                              setSearch('');
                            }}
                            dir="rtl"
                          >
                            {c.name}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {search.trim() && !dropdownOpen && (
                <div className="text-xs text-text-verse text-right -mt-[0.3rem] pr-[0.3rem]" dir="rtl">
                  {filtered.length === 0 ? 'لا توجد نتائج' :
                    `${filtered.length} ${filtered.length === 1 ? 'مدينة' : 'مدن'}`}
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface border border-border text-text-primary px-4 py-3 rounded text-sm font-inter w-full text-left placeholder:text-placeholder focus:outline-none focus:border-accent/40"
                placeholder="خط العرض (Lat)"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                type="number"
                step="any"
                dir="ltr"
                aria-label="خط العرض"
              />
              <input
                className="flex-1 bg-surface border border-border text-text-primary px-4 py-3 rounded text-sm font-inter w-full text-left placeholder:text-placeholder focus:outline-none focus:border-accent/40"
                placeholder="خط الطول (Lng)"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                type="number"
                step="any"
                dir="ltr"
                aria-label="خط الطول"
              />
            </div>
          )}

          {/* Method selector — small enough to keep native for now, styled consistently */}
          <div className="relative">
            <select
              className="bg-surface border border-border text-text-primary w-full py-3 px-4 rounded text-sm font-arabic text-right cursor-pointer appearance-none focus:outline-none focus:border-accent/40 transition-colors duration-150"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              dir="rtl"
              aria-label="طريقة الحساب"
            >
              {Object.entries(CALC_METHOD_NAMES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <button
            className="bg-gradient-to-br from-accent to-accent-hover text-bg border-none px-8 py-3 rounded text-lg font-semibold cursor-pointer transition-all duration-200 mt-2 font-arabic disabled:opacity-60 disabled:cursor-wait hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(212,168,67,0.3)]"
            onClick={handleStart}
            disabled={starting}
            dir="rtl"
            aria-label={starting ? 'جاري التحميل' : 'ابدأ'}
          >
            {starting ? 'جاري…' : 'ابدأ'}
          </button>
        </div>

        <p className="font-arabic text-xs text-text-verse mt-8" dir="rtl">﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾</p>
      </div>
    </div>
  );
}
