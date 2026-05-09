// MainDashboard.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── CUSTOM ICONS ────────────────────────────────────────────────
function makePin(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;
      width:32px;height:40px;
    ">
      <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
          fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="9" fill="rgba(0,0,0,0.2)"/>
      </svg>
      <span style="
        position:absolute;top:6px;left:50%;
        transform:translateX(-50%);
        font-size:13px;line-height:1;
      ">${emoji}</span>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  })
}

// Green pin for open shelters
const openShelterIcon = makePin('#22c55e', '🏠')
// Red pin for full shelters
const fullShelterIcon = makePin('#ef4444', '🏠')
// Default blue Leaflet-style pin for user
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;
    background:#3b82f6;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 3px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
})
// Tornado emoji marker
const tornadoIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🌪️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
})

// ── DATA ────────────────────────────────────────────────────────
const WINDSOR_CENTER = [42.3149, -83.0364]

const SHELTERS = [
  { id: 1, name: 'Windsor Arena',   coords: [42.3201, -83.0516], address: '445 Ouellette Ave', capacity: 850,  status: 'available' },
  { id: 2, name: 'St. Clair College', coords: [42.2993, -83.0202], address: '2000 Talbot Rd W', capacity: 600,  status: 'full' },
  { id: 3, name: 'WFCU Centre',     coords: [42.2756, -83.0022], address: '8787 McHugh St',   capacity: 1200, status: 'full' },
]

const TORNADO_PATH = [
  [42.2450, -83.1800], [42.2650, -83.1400], [42.2900, -83.1000],
  [42.3100, -83.0700], [42.3300, -83.0400],
]

const ROUTE_TO_SHELTER = [
  [42.3149, -83.0364], [42.3160, -83.0420], [42.3175, -83.0460], [42.3201, -83.0516],
]

const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'TORNADO WARNING ACTIVE',          dir: 'ltr' },
  { code: 'fr', label: 'Français', native: 'ALERTE: Tornade active détectée',  dir: 'ltr' },
  { code: 'ar', label: 'العربية',  native: 'ALERT: إنذار إعصار نشط',           dir: 'rtl' },
  { code: 'zh', label: '普通话',   native: '警告：龙卷风来袭',                   dir: 'ltr' },
  { code: 'tl', label: 'Filipino', native: 'BABALA: Aktibong Tornado',          dir: 'ltr' },
  { code: 'es', label: 'Español',  native: 'ALERTA: Tornado activo detectado',  dir: 'ltr' },
]

// ── MAP CONTROLLER ──────────────────────────────────────────────
function MapController({ simulating }) {
  const map = useMap()
  useEffect(() => {
    if (simulating) map.flyTo([42.3100, -83.0700], 13, { duration: 1.8 })
    else            map.flyTo(WINDSOR_CENTER, 12,  { duration: 1.2 })
  }, [simulating, map])
  return null
}

// ── COMPONENT ───────────────────────────────────────────────────
export default function MainDashboard() {
  const navigate = useNavigate()
  const [simulating, setSimulating]     = useState(false)
  const [tornadoPos, setTornadoPos]     = useState(0)
  const [timeElapsed, setTimeElapsed]   = useState(0)
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [showLangMenu, setShowLangMenu] = useState(false)
  const intervalRef = useRef(null)

  const profile = (() => { try { return JSON.parse(localStorage.getItem('vortex_profile') || '{}') } catch { return {} } })()
  const nearestShelter = SHELTERS.find(s => s.status === 'available')

  function handleSimulate() {
    if (simulating) {
      setSimulating(false); setTornadoPos(0); setTimeElapsed(0)
      clearInterval(intervalRef.current); return
    }
    setSimulating(true); setTimeElapsed(0)
    intervalRef.current = setInterval(() => {
      setTornadoPos(p => Math.min(p + 1, TORNADO_PATH.length - 1))
      setTimeElapsed(t => t + 1)
    }, 2000)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const threatLevel = simulating
    ? timeElapsed < 4 ? 'ADVISORY' : timeElapsed < 7 ? 'WARNING' : 'CRITICAL'
    : 'MONITORING'

  const threatColor = { MONITORING:'#22c55e', ADVISORY:'#f59e0b', WARNING:'#f97316', CRITICAL:'#ef4444' }[threatLevel]
  const etaMinutes  = simulating ? Math.max(0, 18 - timeElapsed * 2) : null

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0B1E33', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        padding:'0.75rem 1.25rem',
        background:'#0D2035',
        borderBottom:'1px solid rgba(15,173,160,0.2)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        zIndex:1000, position:'relative',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          {/* Logo */}
          <div>
            <div style={{ fontSize:'0.5rem', letterSpacing:'0.25em', color:'#3D5A73' }}>MASSEYHACKS XII</div>
            <div style={{ fontSize:'1.35rem', fontWeight:900, letterSpacing:'0.12em', color:'#0FADA0', lineHeight:1 }}>VORTEX</div>
          </div>

          {/* Threat pill */}
          <div style={{
            display:'flex', alignItems:'center', gap:'7px',
            background:`${threatColor}18`, border:`1px solid ${threatColor}44`,
            borderRadius:'20px', padding:'5px 13px',
          }}>
            <span style={{
              width:'8px', height:'8px', borderRadius:'50%', background:threatColor,
              display:'inline-block',
              animation: simulating ? 'vx-pulse 1s ease-in-out infinite' : 'none',
            }}/>
            <style>{`@keyframes vx-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}`}</style>
            <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.12em', color:threatColor }}>{threatLevel}</span>
          </div>

          {/* Scrolling alert when simulating */}
          {simulating && (
            <div style={{ overflow:'hidden', maxWidth:'320px' }}>
              <div style={{
                display:'flex', gap:'24px', whiteSpace:'nowrap',
                animation:'vx-scroll 12s linear infinite',
                fontSize:'0.62rem', color:'#ef4444', fontWeight:700,
              }}>
                {[...LANGUAGES, ...LANGUAGES].map((l, i) => (
                  <span key={i} style={{ direction:l.dir, opacity: l.code === selectedLang.code ? 1 : 0.4 }}>
                    {l.native}
                  </span>
                ))}
              </div>
              <style>{`@keyframes vx-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
            </div>
          )}
        </div>

        {/* Right nav */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* Language picker */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowLangMenu(v => !v)} style={navBtn()}>
              🌐 {selectedLang.label}
            </button>
            {showLangMenu && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', right:0,
                background:'#112240', border:'1px solid rgba(15,173,160,0.25)',
                borderRadius:'10px', overflow:'hidden', zIndex:9999,
                minWidth:'160px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    onClick={() => { setSelectedLang(l); setShowLangMenu(false) }}
                    style={{
                      display:'block', width:'100%', padding:'10px 16px',
                      textAlign: l.dir === 'rtl' ? 'right' : 'left', direction:l.dir,
                      background: selectedLang.code === l.code ? 'rgba(15,173,160,0.15)' : 'transparent',
                      border:'none', borderBottom:'1px solid rgba(255,255,255,0.05)',
                      color: selectedLang.code === l.code ? '#0FADA0' : '#7B9BB5',
                      fontSize:'0.88rem', cursor:'pointer',
                    }}>{l.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Profile button */}
          <button onClick={() => navigate('/profile')} style={navBtn('#0FADA0')}>
            👤 MY PROFILE
          </button>

          {/* SOS button */}
          <button onClick={() => navigate('/sos')} style={{
            ...navBtn('#ef4444'),
            background: simulating ? 'rgba(239,68,68,0.15)' : 'transparent',
            fontWeight: simulating ? 700 : 400,
            border:`1px solid ${simulating ? '#ef4444' : 'rgba(239,68,68,0.35)'}`,
          }}>
            📡 SOS
          </button>
        </div>
      </header>

      {/* ── BODY: sidebar left, map right ── */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'320px 1fr', minHeight:0 }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          background:'#0D2035',
          borderRight:'1px solid rgba(15,173,160,0.15)',
          display:'flex', flexDirection:'column',
          padding:'1rem', gap:'0.85rem',
          overflowY:'auto',
        }}>

          {/* Status card */}
          <div style={card(threatColor)}>
            <div style={{ fontSize:'0.58rem', letterSpacing:'0.14em', color:threatColor, marginBottom:'5px', fontWeight:700 }}>
              CURRENT STATUS · WINDSOR-ESSEX
            </div>
            <div style={{ fontSize:'1.05rem', fontWeight:800, color:threatColor, marginBottom:'4px' }}>
              {simulating ? '🌪️ TORNADO ACTIVE' : '✓ ALL CLEAR'}
            </div>
            <div style={{ fontSize:'0.77rem', color:'#7B9BB5', lineHeight:1.6 }}>
              {simulating
                ? 'Confirmed tornado near Kingsville tracking NE at 62 km/h.'
                : 'No severe weather detected. Pressure stable at 1013 hPa.'}
            </div>
            {simulating && etaMinutes !== null && (
              <div style={{ marginTop:'10px', fontSize:'1.5rem', fontWeight:900, color:threatColor, fontFamily:'monospace' }}>
                ETA: {etaMinutes} MIN
              </div>
            )}
          </div>

          {/* Nearest open shelter */}
          <div style={card()}>
            <div style={{ fontSize:'0.58rem', letterSpacing:'0.14em', color:'#7B9BB5', marginBottom:'7px' }}>
              NEAREST OPEN SHELTER
            </div>
            <div style={{ fontSize:'0.95rem', fontWeight:700, color:'#22c55e', marginBottom:'3px' }}>
              {nearestShelter?.name}
            </div>
            <div style={{ fontSize:'0.77rem', color:'#7B9BB5' }}>{nearestShelter?.address}</div>
            <div style={{ display:'flex', gap:'14px', marginTop:'9px', fontSize:'0.76rem' }}>
              <div style={{ color:'#E8F1F8' }}>🚗 <span style={{ color:'#0FADA0', fontWeight:700 }}>6 min</span> drive</div>
              <div style={{ color:'#E8F1F8' }}>🚶 <span style={{ color:'#f59e0b', fontWeight:700 }}>22 min</span> walk</div>
            </div>
            {simulating && (
              <div style={{ marginTop:'9px', padding:'7px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'6px', fontSize:'0.72rem', color:'#22c55e' }}>
                ✓ Route calculated — see map
              </div>
            )}
          </div>

          {/* All shelters */}
          <div style={card()}>
            <div style={{ fontSize:'0.58rem', letterSpacing:'0.14em', color:'#7B9BB5', marginBottom:'9px' }}>
              ALL SHELTERS
            </div>
            {SHELTERS.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize:'0.8rem', color:'#E8F1F8', fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:'0.67rem', color:'#3D5A73' }}>{s.address}</div>
                </div>
                <div style={statusBadge(s.status === 'available')}>
                  {s.status === 'available' ? 'OPEN' : 'FULL'}
                </div>
              </div>
            ))}
          </div>

          {/* Map legend */}
          <div style={card()}>
            <div style={{ fontSize:'0.58rem', letterSpacing:'0.14em', color:'#7B9BB5', marginBottom:'9px' }}>MAP LEGEND</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', fontSize:'0.77rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#E8F1F8' }}>
                <span style={{ fontSize:'16px' }}>🏠</span>
                <span style={{ color:'#22c55e', fontWeight:600 }}>Green pin</span> — Shelter OPEN
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#E8F1F8' }}>
                <span style={{ fontSize:'16px' }}>🏠</span>
                <span style={{ color:'#ef4444', fontWeight:600 }}>Red pin</span> — Shelter FULL
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#E8F1F8' }}>
                <span style={{ width:'16px', height:'16px', background:'#3b82f6', borderRadius:'50%', border:'2px solid #fff', display:'inline-block', flexShrink:0 }}/>
                <span style={{ color:'#3b82f6', fontWeight:600 }}>Blue dot</span> — Your location
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#E8F1F8' }}>
                <span style={{ fontSize:'16px' }}>🌪️</span>
                <span style={{ color:'#ef4444', fontWeight:600 }}>Tornado</span> — Live position
              </div>
              {simulating && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#E8F1F8' }}>
                  <span style={{ width:'16px', height:'3px', background:'#22c55e', display:'inline-block' }}/>
                  <span style={{ color:'#22c55e', fontWeight:600 }}>Green line</span> — Evacuation route
                </div>
              )}
            </div>
          </div>

          {/* Profile preview */}
          {profile.name && (
            <div style={card()}>
              <div style={{ fontSize:'0.58rem', letterSpacing:'0.14em', color:'#7B9BB5', marginBottom:'7px' }}>YOUR PROFILE</div>
              <div style={{ color:'#E8F1F8', fontWeight:600, fontSize:'0.85rem' }}>{profile.name}</div>
              <div style={{ fontSize:'0.75rem', color:'#7B9BB5' }}>Mobility: {profile.mobility}</div>
              <div style={{ fontSize:'0.75rem', color:'#7B9BB5' }}>Transport: {profile.hasCar ? '🚗 Has vehicle' : '🚶 On foot'}</div>
              {profile.score && (
                <div style={{ marginTop:'6px', color:'#0FADA0', fontWeight:700, fontSize:'0.8rem' }}>
                  Survival Score: {profile.score}%
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'auto' }}>
            <button onClick={() => navigate('/profile')} style={{
              background:'rgba(15,173,160,0.1)', border:'1px solid rgba(15,173,160,0.4)',
              borderRadius:'8px', color:'#0FADA0', fontSize:'0.78rem', padding:'10px',
              cursor:'pointer', letterSpacing:'0.08em', fontWeight:600, fontFamily:'inherit',
            }}>
              👤 CALCULATE SURVIVAL SPEED
            </button>
            <button onClick={() => navigate('/sos')} style={{
              background: simulating ? 'rgba(239,68,68,0.15)' : 'transparent',
              border:'1px solid rgba(239,68,68,0.4)',
              borderRadius:'8px', color:'#ef4444', fontSize:'0.78rem', padding:'10px',
              cursor:'pointer', letterSpacing:'0.08em', fontWeight: simulating ? 700 : 400, fontFamily:'inherit',
            }}>
              📡 SEND SOS SIGNAL
            </button>
          </div>

          <div style={{
            padding:'8px 10px', background:'rgba(244,201,93,0.05)',
            border:'1px dashed rgba(244,201,93,0.2)', borderRadius:'6px',
            fontSize:'0.62rem', color:'#3D5A73', letterSpacing:'0.04em',
          }}>
            ⚡ DEMO — Real-time NWS API + AI routing coming soon.
          </div>
        </aside>

        {/* ── MAP (right, fills remaining space) ── */}
        <div style={{ position:'relative' }}>
          <MapContainer
            center={WINDSOR_CENTER} zoom={12}
            style={{ width:'100%', height:'100%', minHeight:'500px' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <MapController simulating={simulating} />

            {/* User */}
            <Marker position={WINDSOR_CENTER} icon={userIcon}>
              <Popup>
                <div style={{ fontFamily:'monospace', fontSize:'12px' }}>
                  <strong>{profile.name || 'Your location'}</strong><br/>Windsor, ON
                </div>
              </Popup>
            </Marker>

            {/* Shelters */}
            {SHELTERS.map(s => (
              <Marker key={s.id} position={s.coords} icon={s.status === 'available' ? openShelterIcon : fullShelterIcon}>
                <Popup>
                  <div style={{ fontFamily:'monospace', fontSize:'12px', minWidth:'160px' }}>
                    <strong style={{ color: s.status === 'available' ? '#22c55e' : '#ef4444' }}>
                      {s.status === 'available' ? '✓ OPEN' : '✗ FULL'}
                    </strong><br/>
                    <strong>{s.name}</strong><br/>
                    {s.address}<br/>
                    <span style={{ color:'#888' }}>Capacity: {s.capacity}</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Tornado simulation */}
            {simulating && (
              <>
                <Polyline positions={TORNADO_PATH} pathOptions={{ color:'#ef4444', weight:3, dashArray:'8 6', opacity:0.7 }} />
                <Marker position={TORNADO_PATH[tornadoPos]} icon={tornadoIcon}>
                  <Popup>
                    <div style={{ fontFamily:'monospace', fontSize:'12px' }}>
                      <strong style={{ color:'#ef4444' }}>🌪️ CONFIRMED TORNADO</strong><br/>
                      Speed: 62 km/h NE<br/>ETA: ~{etaMinutes} min
                    </div>
                  </Popup>
                </Marker>
                <Polyline positions={ROUTE_TO_SHELTER} pathOptions={{ color:'#22c55e', weight:5, opacity:0.9 }} />
              </>
            )}
          </MapContainer>

          {/* Simulate button */}
          <div style={{ position:'absolute', bottom:'24px', left:'50%', transform:'translateX(-50%)', zIndex:1000 }}>
            <button onClick={handleSimulate} style={{
              background: simulating ? 'rgba(239,68,68,0.92)' : 'rgba(15,173,160,0.92)',
              border:'none', borderRadius:'30px', color:'#fff',
              fontWeight:800, fontSize:'0.88rem', padding:'12px 30px',
              cursor:'pointer', letterSpacing:'0.12em',
              boxShadow: simulating ? '0 0 28px rgba(239,68,68,0.6)' : '0 0 20px rgba(15,173,160,0.5)',
              transition:'all 0.3s', display:'flex', alignItems:'center', gap:'10px',
              fontFamily:'inherit',
            }}>
              {simulating ? '⏹ STOP SIMULATION' : '🌪️ SIMULATE TORNADO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── STYLE HELPERS ────────────────────────────────────────────────
function navBtn(accentColor) {
  return {
    background: accentColor ? `rgba(${hexToRgb(accentColor)},0.1)` : 'transparent',
    border: `1px solid ${accentColor ? `rgba(${hexToRgb(accentColor)},0.35)` : 'rgba(15,173,160,0.3)'}`,
    borderRadius:'8px',
    color: accentColor || '#7B9BB5',
    fontSize:'0.72rem', padding:'6px 12px',
    cursor:'pointer', letterSpacing:'0.07em',
    display:'flex', alignItems:'center', gap:'5px',
    fontFamily:'inherit', fontWeight:600,
  }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

function card(accentColor) {
  return {
    background: accentColor ? `${accentColor}0d` : '#112240',
    border: `1px solid ${accentColor ? `${accentColor}30` : 'rgba(15,173,160,0.15)'}`,
    borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
    borderRadius:'10px', padding:'1rem',
  }
}

function statusBadge(open) {
  return {
    fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.07em',
    color: open ? '#22c55e' : '#ef4444',
    background: open ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
    padding:'3px 8px', borderRadius:'12px',
    border: `1px solid ${open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
    whiteSpace:'nowrap',
  }
}