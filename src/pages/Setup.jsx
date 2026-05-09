// Setup.jsx  —  Page 1: Enter your profile
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HumanoidFigure from '../components/HumanoidFigure.jsx'
import LanguageSlider from '../components/LanguageSlider.jsx'

function calcScore(profile) {
  let score = 100
  // distance handled on dashboard, here we preview mobility-based score
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

export default function Setup() {
  const navigate = useNavigate()
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
    // store profile for dashboard
    localStorage.setItem('vortex_profile', JSON.stringify({ ...profile, score }))
    navigate('/dashboard')
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
        {/* Arabic diversity label */}
        <div style={{ textAlign: 'right' }}>
          <div className="arabic-label">نظام الإنقاذ الذكي</div>
          <div style={{ fontSize: '0.6rem', color: '#3D5A73', letterSpacing: '0.1em', marginTop: '2px' }}>
            AI SURVIVAL SYSTEM
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
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Build your survival profile
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#7B9BB5', lineHeight: 1.6 }}>
              The AI uses your profile to generate <strong style={{color:'#0FADA0'}}>personalized</strong> tornado instructions —
              not the same generic alert everyone gets. A wheelchair user is never told to take stairs.
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

          {/* language slider */}
          <div className="card">
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#7B9BB5', marginBottom: '0.85rem' }}>
              PREFERRED LANGUAGE
            </div>
            <LanguageSlider onChange={lang => set('language', lang.code)} />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!profile.name || !profile.address}
            style={{ opacity: (!profile.name || !profile.address) ? 0.4 : 1 }}
          >
            ACTIVATE MONITORING →
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
                  ⚠ Evacuation route will avoid stairs & slopes
                </div>
              )}
              {profile.mobility === 'elderly' && (
                <div style={{ color: '#FFB347', fontSize: '0.75rem' }}>
                  ⚠ Slower evacuation speed factored in
                </div>
              )}
              {!profile.hasCar && (
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
            The AI adjusts your score in real-time based on <span style={{color:'#0FADA0'}}>your distance</span> from the tornado,{' '}
            <span style={{color:'#0FADA0'}}>your mobility</span>, time to shelter, and{' '}
            <span style={{color:'#0FADA0'}}>road conditions</span>. Higher score = more options. Lower score = AI prioritizes shelter-in-place.
          </div>
        </div>
      </div>
    </div>
  )
}
