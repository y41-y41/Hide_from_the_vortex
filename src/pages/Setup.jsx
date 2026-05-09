// Setup.jsx — Profile page: Calculate evacuation time
import { useState } from 'react'
import HumanoidFigure from '../components/HumanoidFigure.jsx'

const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Japanese']

function calcScore(profile) {
  let score = 92
  if (profile.mobility === 'wheelchair') score -= 28
  if (profile.mobility === 'elderly')    score -= 18
  if (profile.mobility === 'child')      score -= 10
  if (profile.age > 65)                  score -= 10
  if (profile.age < 12)                  score -= 6
  if (profile.travelMode === 'car')      score += 14
  if (profile.travelMode === 'foot')     score -= 8
  if (profile.weight > 105)              score -= 4
  if (profile.height < 155)              score -= 3
  if (profile.groundFloor)               score += 7
  if (profile.disabilities.includes('vision'))   score -= 8
  if (profile.disabilities.includes('hearing'))  score -= 5
  if (profile.disabilities.includes('cognitive')) score -= 6
  if (profile.disabilities.includes('infant'))   score -= 5
  if (profile.disabilities.includes('pet'))      score -= 2
  return Math.min(99, Math.max(12, score))
}

function calculateEvacuation(profile) {
  const distance = 6.2 // km to local shelter estimate
  let speed = profile.travelMode === 'car' ? 45 : 5 // km/h
  if (profile.mobility === 'wheelchair') speed = 3.2
  if (profile.mobility === 'elderly')    speed = Math.min(speed, 4.5)
  if (profile.age > 65)                  speed = Math.max(2.8, speed - 1.2)
  if (profile.age < 12)                  speed = Math.max(3.5, speed - 0.8)
  if (profile.travelMode === 'foot' && profile.weight > 90) speed = Math.max(3.5, speed - 0.6)
  const time = distance / speed * 60
  return { distance, speed: Math.round(speed * 10) / 10, time: Math.round(time) }
}

export default function Setup() {
  const [profile, setProfile] = useState({
    name: '',
    height: 172,
    weight: 72,
    age: 25,
    mobility: 'walking',
    travelMode: 'car',
    groundFloor: false,
    disabilities: [],
    language: 'en',
  })
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [results, setResults] = useState(null)

  const score = calcScore(profile)

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
    if (!profile.name || !profile.height || !profile.weight) return
    const calc = calculateEvacuation(profile)
    setResults(calc)
    localStorage.setItem('vortex_profile', JSON.stringify({ ...profile, score }))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(15,173,160,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: '#7B9BB5', marginBottom: '2px' }}>
            MASSEYHACKS XII · OCEAN COMMUNITY TRACK
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', color: '#0FADA0' }}>
            VORTEX
          </div>
        </div>
        <div className="language-selector">
          <button onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
            SELECT LANGUAGE ({selectedLanguage})
          </button>
          {showLanguageMenu && (
            <ul className="language-menu">
              {languages.map(lang => (
                <li key={lang} onClick={() => { setSelectedLanguage(lang); setShowLanguageMenu(false) }}>
                  {lang}
                </li>
              ))}
            </ul>
          )}
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
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Calculate evacuation time
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#7B9BB5', lineHeight: 1.6 }}>
              Enter your profile to see estimated time to nearest shelter, speed, and distance.
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="field">
                <label>Height (cm)</label>
                <input
                  type="number" min="90" max="240"
                  value={profile.height}
                  onChange={e => set('height', Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input
                  type="number" min="30" max="220"
                  value={profile.weight}
                  onChange={e => set('weight', Number(e.target.value))}
                />
              </div>
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
                <label>Current travel mode</label>
                <select value={profile.travelMode} onChange={e => set('travelMode', e.target.value)}>
                  <option value="car">I am in a car</option>
                  <option value="foot">I am on foot</option>
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

            {/* disabilities checkboxes */}
            <div className="field">
              <label>Additional considerations (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {[
                  ['vision',   'Low vision'],
                  ['hearing',  'Hard of hearing'],
                  ['cognitive','Cognitive disability'],
                  ['infant',   'Travelling with infant'],
                  ['pet',      'Have a pet'],
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

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!profile.name || !profile.height || !profile.weight}
            style={{ opacity: (!profile.name || !profile.height || !profile.weight) ? 0.4 : 1 }}
          >
            CALCULATE →
          </button>

          {results && (
            <div className="card">
              <h2>Evacuation Estimate</h2>
              <p>Distance to nearest shelter: {results.distance} km</p>
              <p>Estimated speed: {results.speed} km/h</p>
              <p>Time to shelter: {results.time} minutes</p>
            </div>
          )}
        </div>

        {/* RIGHT — humanoid figure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem' }}>
          <div className="card" style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#7B9BB5', marginBottom: '1rem' }}>
              SHELTER ACCESS PREVIEW
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
              {profile.height && profile.weight && (
                <div style={{ color: '#7B9BB5', fontSize: '0.78rem' }}>
                  {profile.height} cm · {profile.weight} kg
                </div>
              )}
              {profile.mobility === 'wheelchair' && (
                <div style={{ color: '#FF6B6B', fontSize: '0.75rem' }}>
                  ⚠ Evacuation route will avoid stairs & slopes
                </div>
              )}
              {profile.mobility === 'elderly' && (
                <div style={{ color: '#FFB347', fontSize: '0.75rem' }}>
                  ⚠ Slower evacuation speed factored in
                </div>
              )}
              {profile.travelMode === 'foot' && (
                <div style={{ color: '#FFB347', fontSize: '0.75rem' }}>
                  ⚠ Walking routes + transit shelters prioritized
                </div>
              )}
              {profile.groundFloor && (
                <div style={{ color: '#43D9A2', fontSize: '0.75rem' }}>
                  ✓ Ground floor — strong shelter-in-place option
                </div>
              )}
            </div>
          </div>

          {/* score explanation */}
          <div className="card" style={{ width: '100%', fontSize: '0.78rem', color: '#7B9BB5', lineHeight: 1.8 }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
              HOW THE SCORE WORKS
            </div>
            The AI estimates how likely you are to reach a safe shelter based on <span style={{color:'#0FADA0'}}>your profile</span>,{' '}
            <span style={{color:'#0FADA0'}}>travel mode</span>, <span style={{color:'#0FADA0'}}>time to shelter</span>, and{' '}
            <span style={{color:'#0FADA0'}}>evacuation difficulty</span>. Higher score = faster access. Lower score = the system recommends sheltering in place.
          </div>
        </div>
      </div>
    </div>
  )
}
