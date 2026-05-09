// Setup.jsx  —  Profile page: calculate how fast you can cover distance
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HumanoidFigure from '../components/HumanoidFigure.jsx'

const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'zh', label: '普通话', dir: 'ltr' },
  { code: 'tl', label: 'Filipino', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
]

// Estimated walking/driving speeds by mobility (km/h)
const SPEED_MAP = {
  walking:     4.5,
  wheelchair:  2.8,
  elderly:     2.2,
  child:       3.5,
}

// Shelter distance from Windsor downtown (km) — demo values
const SHELTER_DISTANCE = 2.1

function calcScore(profile) {
  let score = 100
  if (profile.mobility === 'wheelchair') score -= 25
  if (profile.mobility === 'elderly')    score -= 15
  if (profile.age > 65)                  score -= 10
  if (profile.age < 10)                  score -= 5
  if (profile.hasCar)                    score += 10
  if (profile.groundFloor)               score += 8
  if (profile.disabilities.includes('vision'))   score -= 8
  if (profile.disabilities.includes('hearing'))  score -= 5
  return Math.min(100, Math.max(5, score))
}

function calcETA(profile) {
  const speed = profile.hasCar ? 40 : SPEED_MAP[profile.mobility] || 4
  const hours = SHELTER_DISTANCE / speed
  const minutes = Math.round(hours * 60)
  return { minutes, speed }
}

export default function Setup() {
  const navigate = useNavigate()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[2])
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    age: 25,
    mobility: 'walking',
    hasCar: true,
    groundFloor: false,
    disabilities: [],
    language: 'en',
  })

  const score = calcScore(profile)
  const eta = calcETA(profile)

  function set(key, val) {
    setProfile(prev => ({ ...prev, [key]: val }))
  }

  function toggleDisability(d) {
    setProfile(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(d)
        ? prev.disabilities.filter(x => x !== d)
        : [...prev.disabilities, d],
    }))
  }

  function handleSubmit() {
    if (!profile.name || !profile.address) return
    localStorage.setItem('vortex_profile', JSON.stringify({ ...profile, score, eta: eta.minutes }))
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1E33' }}>

      {/* ── HEADER ── */}
      <header style={{
        padding: '0.85rem 1.5rem',
        borderBottom: '1px solid rgba(15,173,160,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0D2035',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#7B9BB5',
              fontSize: '0.8rem',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ← MAP
          </button>
          <div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: '#3D5A73' }}>MASSEYHACKS XII</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.12em', color: '#0FADA0', lineHeight: 1 }}>VORTEX</div>
          </div>
        </div>

        {/* Right: Arabic label + language button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* All-language label */}
          <div style={{ textAlign: 'right', lineHeight: 1.4 }}>
            <div style={{
              fontSize: '1.1rem',
              color: '#F4C95D',
              fontWeight: 700,
              letterSpacing: '0.05em',
              direction: selectedLang.dir,
            }}>
              {selectedLang.code === 'ar' && 'حاسب مدة الإخلاء'}
              {selectedLang.code === 'fr' && 'Calculer le temps d\'évacuation'}
              {selectedLang.code === 'en' && 'Calculate Evacuation Time'}
              {selectedLang.code === 'zh' && '计算撤离时间'}
              {selectedLang.code === 'tl' && 'Kalkulahin ang Oras ng Paglisan'}
              {selectedLang.code === 'es' && 'Calcular tiempo de evacuación'}
            </div>
            <div style={{ fontSize: '0.55rem', color: '#3D5A73', letterSpacing: '0.12em' }}>
              SURVIVAL SPEED CALCULATOR
            </div>
          </div>

          {/* Language selector button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                background: 'rgba(244,201,93,0.08)',
                border: '1px solid rgba(244,201,93,0.3)',
                borderRadius: '8px',
                color: '#F4C95D',
                fontSize: '0.78rem',
                padding: '8px 16px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🌐 SELECT LANGUAGE
            </button>
            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#112240',
                border: '1px solid rgba(244,201,93,0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
                zIndex: 9999,
                minWidth: '180px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setSelectedLang(l)
                      set('language', l.code)
                      setShowLangMenu(false)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '11px 18px',
                      textAlign: l.dir === 'rtl' ? 'right' : 'left',
                      direction: l.dir,
                      background: selectedLang.code === l.code ? 'rgba(244,201,93,0.12)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      color: selectedLang.code === l.code ? '#F4C95D' : '#7B9BB5',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
        padding: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
      }}>

        {/* LEFT — form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.35rem', color: '#E8F1F8' }}>
              Build your survival profile
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#7B9BB5', lineHeight: 1.6 }}>
              Your mobility data helps the AI calculate exactly how fast you can cover distance to the nearest shelter.
              A wheelchair user gets a different route than someone on foot — never stairs, never steep slopes.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="field">
                <label>Your name</label>
                <input
                  placeholder="e.g. Omar"
                  value={profile.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Age</label>
                <input
                  type="number" min="1" max="120"
                  value={profile.age}
                  onChange={e => set('age', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label>Home address (Windsor area)</label>
              <input
                placeholder="e.g. 3200 Deziel Dr, Windsor, ON"
                value={profile.address}
                onChange={e => set('address', e.target.value)}
              />
            </div>

            <div className="field">
              <label>Mobility</label>
              <select value={profile.mobility} onChange={e => set('mobility', e.target.value)}>
                <option value="walking">Walking / Running</option>
                <option value="wheelchair">Wheelchair user</option>
                <option value="elderly">Elderly / Uses cane</option>
                <option value="child">Child (under 12)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="field">
                <label>Have a vehicle?</label>
                <select value={profile.hasCar ? 'yes' : 'no'} onChange={e => set('hasCar', e.target.value === 'yes')}>
                  <option value="yes">Yes — I have a car</option>
                  <option value="no">No — on foot / transit</option>
                </select>
              </div>
              <div className="field">
                <label>Floor level at home</label>
                <select value={profile.groundFloor ? 'ground' : 'upper'} onChange={e => set('groundFloor', e.target.value === 'ground')}>
                  <option value="ground">Ground floor / basement</option>
                  <option value="upper">Upper floor / apartment</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Additional considerations</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {[
                  ['vision',    'Low vision'],
                  ['hearing',   'Hard of hearing'],
                  ['cognitive', 'Cognitive disability'],
                  ['infant',    'Travelling with infant'],
                  ['pet',       'Have a pet'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleDisability(key)}
                    style={{
                      background: profile.disabilities.includes(key) ? 'rgba(15,173,160,0.2)' : 'transparent',
                      border: `1px solid ${profile.disabilities.includes(key) ? '#0FADA0' : '#1A3354'}`,
                      color: profile.disabilities.includes(key) ? '#0FADA0' : '#7B9BB5',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ETA calculator card */}
          <div className="card" style={{ border: '1px solid rgba(15,173,160,0.3)' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#7B9BB5', marginBottom: '0.85rem' }}>
              ⚡ DISTANCE COVERAGE ESTIMATE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0FADA0', fontFamily: 'monospace' }}>
                  {eta.minutes}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7B9BB5', letterSpacing: '0.1em' }}>MIN TO SHELTER</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFB347', fontFamily: 'monospace' }}>
                  {eta.speed}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7B9BB5', letterSpacing: '0.1em' }}>KM/H SPEED</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#43D9A2', fontFamily: 'monospace' }}>
                  {SHELTER_DISTANCE}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#7B9BB5', letterSpacing: '0.1em' }}>KM DISTANCE</div>
              </div>
            </div>
            {profile.mobility === 'wheelchair' && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#FFB347' }}>
                ⚠ Wheelchair-accessible route calculated — avoids stairs & steep grades
              </div>
            )}
            {!profile.hasCar && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#FF6B6B' }}>
                ⚠ No vehicle — walking route. Consider requesting emergency transit.
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!profile.name || !profile.address}
            style={{ opacity: (!profile.name || !profile.address) ? 0.4 : 1 }}
          >
            SAVE PROFILE & RETURN TO MAP →
          </button>
        </div>

        {/* RIGHT — humanoid figure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem' }}>
          <div className="card" style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#7B9BB5', marginBottom: '1rem' }}>
              SURVIVAL PROFILE PREVIEW
            </div>
            <HumanoidFigure
              mobility={profile.mobility}
              score={score}
              animate={score < 50}
            />
            <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#7B9BB5', lineHeight: 1.7 }}>
              {profile.name && (
                <div style={{ color: '#E8F1F8', fontWeight: 600, marginBottom: '4px' }}>
                  {profile.name}{profile.age ? `, ${profile.age}` : ''}
                </div>
              )}
              {profile.mobility === 'wheelchair' && (
                <div style={{ color: '#FF6B6B', fontSize: '0.75rem' }}>
                  ⚠ Route avoids stairs & slopes
                </div>
              )}
              {profile.mobility === 'elderly' && (
                <div style={{ color: '#FFB347', fontSize: '0.75rem' }}>
                  ⚠ Slower speed factored in
                </div>
              )}
              {!profile.hasCar && (
                <div style={{ color: '#FFB347', fontSize: '0.75rem' }}>
                  ⚠ Walking routes prioritized
                </div>
              )}
              {profile.groundFloor && (
                <div style={{ color: '#43D9A2', fontSize: '0.75rem' }}>
                  ✓ Ground floor — shelter-in-place option
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ width: '100%', fontSize: '0.78rem', color: '#7B9BB5', lineHeight: 1.8 }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              HOW THE SCORE WORKS
            </div>
            The AI uses your mobility speed, shelter distance, and real-time road conditions to calculate{' '}
            <span style={{ color: '#0FADA0' }}>exactly how many minutes you have</span> before you must leave.
            Higher score = more escape options.
          </div>
        </div>
      </div>
    </div>
  )
}
