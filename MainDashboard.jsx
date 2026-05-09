// MainDashboard.jsx — Main page with Windsor map + nav
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Windsor, ON center
const WINDSOR_CENTER = [42.3149, -83.0364]

// Shelters
const SHELTERS = [
  {
    id: 1,
    name: 'Windsor Arena',
    coords: [42.3201, -83.0516],
    address: '445 Ouellette Ave',
    capacity: 850,
    status: 'available', // green
  },
  {
    id: 2,
    name: 'St. Clair College',
    coords: [42.2993, -83.0202],
    address: '2000 Talbot Rd W',
    capacity: 600,
    status: 'full', // red
  },
  {
    id: 3,
    name: 'WFCU Centre',
    coords: [42.2756, -83.0022],
    address: '8787 McHugh St',
    capacity: 1200,
    status: 'full', // red
  },
]

// Simulated tornado path (southwest to northeast)
const TORNADO_PATH = [
  [42.2450, -83.1800],
  [42.2650, -83.1400],
  [42.2900, -83.1000],
  [42.3100, -83.0700],
  [42.3300, -83.0400],
]

// Route from user (Windsor downtown) to Windsor Arena
const ROUTE_TO_SHELTER = [
  [42.3149, -83.0364],
  [42.3160, -83.0420],
  [42.3175, -83.0460],
  [42.3201, -83.0516],
]

// Custom icons
function makeIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};
        border:3px solid ${color === '#43D9A2' ? '#fff' : '#fff'};
        border-radius:50% 50% 50% 0;
        width:32px;height:32px;
        transform:rotate(-45deg);
        box-shadow:0 0 14px ${color}99;
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:13px;">${label}</span>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const greenIcon = makeIcon('#43D9A2', '✓')
const redIcon   = makeIcon('#FF6B6B', '✗')
const userIcon  = makeIcon('#0FADA0', '👤')
const tornadoIcon = makeIcon('#FF6B6B', '🌪')

// Component to zoom map on simulate
function MapController({ simulating }) {
  const map = useMap()
  useEffect(() => {
    if (simulating) {
      map.flyTo([42.3100, -83.0700], 13, { duration: 1.8 })
    } else {
      map.flyTo(WINDSOR_CENTER, 12, { duration: 1.2 })
    }
  }, [simulating, map])
  return null
}

// Language options
const LANGUAGES = [
  { code: 'ar', label: 'العربية', native: 'ALERT: إنذار إعصار نشط', dir: 'rtl' },
  { code: 'fr', label: 'Français', native: 'ALERTE: Tornade active détectée', dir: 'ltr' },
  { code: 'en', label: 'English', native: 'TORNADO WARNING ACTIVE', dir: 'ltr' },
  { code: 'zh', label: '普通话', native: '警告：龙卷风来袭', dir: 'ltr' },
  { code: 'tl', label: 'Filipino', native: 'BABALA: Aktibong Tornado', dir: 'ltr' },
  { code: 'es', label: 'Español', native: 'ALERTA: Tornado activo detectado', dir: 'ltr' },
]

export default function MainDashboard() {
  const navigate = useNavigate()
  const [simulating, setSimulating] = useState(false)
  const [tornadoPos, setTornadoPos] = useState(0)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[2])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const intervalRef = useRef(null)

  const nearestShelter = SHELTERS.find(s => s.status === 'available')
  const profile = (() => { try { return JSON.parse(localStorage.getItem('vortex_profile') || '{}') } catch { return {} } })()

  function handleSimulate() {
    if (simulating) {
      setSimulating(false)
      setTornadoPos(0)
      setTimeElapsed(0)
      clearInterval(intervalRef.current)
      return
    }
    setSimulating(true)
    setTimeElapsed(0)
    intervalRef.current = setInterval(() => {
      setTornadoPos(p => Math.min(p + 1, TORNADO_PATH.length - 1))
      setTimeElapsed(t => t + 1)
    }, 2000)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const threatLevel = simulating
    ? timeElapsed < 4 ? 'ADVISORY' : timeElapsed < 7 ? 'WARNING' : 'CRITICAL'
    : 'MONITORING'

  const threatColor = {
    MONITORING: '#43D9A2',
    ADVISORY:   '#FFB347',
    WARNING:    '#FF8C42',
    CRITICAL:   '#FF6B6B',
  }[threatLevel]

  const etaMinutes = simulating ? Math.max(0, 18 - timeElapsed * 2) : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1E33' }}>

      {/* ── HEADER ── */}
      <header style={{
        padding: '0.85rem 1.5rem',
        borderBottom: '1px solid rgba(15,173,160,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0D2035',
        zIndex: 1000,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: '#3D5A73', marginBottom: '1px' }}>MASSEYHACKS XII</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.12em', color: '#0FADA0', lineHeight: 1 }}>VORTEX</div>
          </div>

          {/* status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: `${threatColor}18`,
            border: `1px solid ${threatColor}44`,
            borderRadius: '20px',
            padding: '5px 14px',
          }}>
            <span style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: threatColor,
              display: 'inline-block',
              animation: simulating ? 'pulse 1s ease-in-out infinite' : 'none',
            }} />
            <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}`}</style>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: threatColor }}>
              {threatLevel}
            </span>
          </div>
        </div>

        {/* right side nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* multilang alert — shows all languages when simulating */}
          {simulating && (
            <div style={{
              display: 'flex',
              gap: '10px',
              fontSize: '0.7rem',
              color: '#FF6B6B',
              fontWeight: 700,
              animation: 'slidein 0.4s ease',
              maxWidth: '420px',
              overflow: 'hidden',
            }}>
              <style>{`@keyframes slidein{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
              {LANGUAGES.map(l => (
                <span key={l.code} style={{ direction: l.dir, whiteSpace: 'nowrap', fontSize: '0.62rem', opacity: l.code === selectedLang.code ? 1 : 0.45 }}>
                  {l.native}
                </span>
              ))}
            </div>
          )}

          {/* language button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(15,173,160,0.3)',
                borderRadius: '8px',
                color: '#7B9BB5',
                fontSize: '0.75rem',
                padding: '6px 12px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🌐 {selectedLang.label}
            </button>
            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#112240',
                border: '1px solid rgba(15,173,160,0.25)',
                borderRadius: '10px',
                overflow: 'hidden',
                zIndex: 9999,
                minWidth: '160px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setSelectedLang(l); setShowLangMenu(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: l.dir === 'rtl' ? 'right' : 'left',
                      direction: l.dir,
                      background: selectedLang.code === l.code ? 'rgba(15,173,160,0.15)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      color: selectedLang.code === l.code ? '#0FADA0' : '#7B9BB5',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'rgba(15,173,160,0.1)',
              border: '1px solid rgba(15,173,160,0.3)',
              borderRadius: '8px',
              color: '#0FADA0',
              fontSize: '0.75rem',
              padding: '6px 12px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            MY PROFILE
          </button>

          <button
            onClick={() => navigate('/sos')}
            style={{
              background: simulating ? 'rgba(255,107,107,0.15)' : 'transparent',
              border: `1px solid ${simulating ? '#FF6B6B' : 'rgba(255,107,107,0.3)'}`,
              borderRadius: '8px',
              color: '#FF6B6B',
              fontSize: '0.75rem',
              padding: '6px 12px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              fontWeight: simulating ? 700 : 400,
            }}
          >
            SOS
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0 }}>

        {/* MAP */}
        <div style={{ position: 'relative' }}>
          <MapContainer
            center={WINDSOR_CENTER}
            zoom={12}
            style={{ width: '100%', height: '100%', minHeight: '500px' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <MapController simulating={simulating} />

            {/* User location marker */}
            <Marker position={WINDSOR_CENTER} icon={userIcon}>
              <Popup>
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  <strong>{profile.name || 'Your location'}</strong><br />
                  Windsor, ON
                </div>
              </Popup>
            </Marker>

            {/* Shelters */}
            {SHELTERS.map(s => (
              <Marker
                key={s.id}
                position={s.coords}
                icon={s.status === 'available' ? greenIcon : redIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', minWidth: '160px' }}>
                    <strong style={{ color: s.status === 'available' ? '#43D9A2' : '#FF6B6B' }}>
                      {s.status === 'available' ? '✓ OPEN' : '✗ REPORTED FULL'}
                    </strong><br />
                    <strong>{s.name}</strong><br />
                    {s.address}<br />
                    <span style={{ color: '#888' }}>Capacity: {s.capacity}</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Tornado path when simulating */}
            {simulating && (
              <>
                <Polyline
                  positions={TORNADO_PATH}
                  pathOptions={{ color: '#FF6B6B', weight: 4, dashArray: '8 6', opacity: 0.7 }}
                />
                <Marker position={TORNADO_PATH[tornadoPos]} icon={tornadoIcon}>
                  <Popup>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      <strong style={{ color: '#FF6B6B' }}>🌪 CONFIRMED TORNADO</strong><br />
                      Speed: 62 km/h NE<br />
                      ETA: ~{etaMinutes} min
                    </div>
                  </Popup>
                </Marker>

                {/* Route to safe shelter */}
                <Polyline
                  positions={ROUTE_TO_SHELTER}
                  pathOptions={{ color: '#43D9A2', weight: 5, opacity: 0.9 }}
                />
              </>
            )}
          </MapContainer>

          {/* Simulate button overlay on map */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}>
            <button
              onClick={handleSimulate}
              style={{
                background: simulating
                  ? 'rgba(255,107,107,0.9)'
                  : 'rgba(15,173,160,0.92)',
                border: 'none',
                borderRadius: '30px',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                padding: '12px 32px',
                cursor: 'pointer',
                letterSpacing: '0.12em',
                boxShadow: simulating
                  ? '0 0 30px rgba(255,107,107,0.6)'
                  : '0 0 20px rgba(15,173,160,0.5)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {simulating ? '⏹ STOP SIMULATION' : '🌪 SIMULATE TORNADO'}
            </button>
          </div>

          {/* Map legend */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'rgba(11,30,51,0.88)',
            border: '1px solid rgba(15,173,160,0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.7rem',
            color: '#7B9BB5',
            lineHeight: 2,
          }}>
            <div><span style={{ color: '#43D9A2' }}>●</span> Shelter OPEN</div>
            <div><span style={{ color: '#FF6B6B' }}>●</span> Reported FULL</div>
            <div><span style={{ color: '#0FADA0' }}>●</span> Your location</div>
            {simulating && <div><span style={{ color: '#43D9A2' }}>—</span> Evacuation route</div>}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{
          background: '#0D2035',
          borderLeft: '1px solid rgba(15,173,160,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          padding: '1.25rem',
          gap: '1rem',
        }}>
          {/* Status card */}
          <div style={{
            background: `${threatColor}12`,
            border: `1px solid ${threatColor}33`,
            borderLeft: `3px solid ${threatColor}`,
            borderRadius: '10px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: threatColor, marginBottom: '6px', fontWeight: 700 }}>
              CURRENT STATUS · WINDSOR-ESSEX
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: threatColor, marginBottom: '4px' }}>
              {simulating ? '🌪 TORNADO ACTIVE' : '✓ ALL CLEAR'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7B9BB5', lineHeight: 1.6 }}>
              {simulating
                ? `Confirmed tornado on the ground near Kingsville tracking NE at 62 km/h.`
                : `No severe weather signatures detected. Atmospheric pressure stable at 1013 hPa.`}
            </div>
            {simulating && etaMinutes !== null && (
              <div style={{
                marginTop: '10px',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: threatColor,
                fontFamily: 'monospace',
              }}>
                ETA: {etaMinutes} MIN
              </div>
            )}
          </div>

          {/* Nearest shelter */}
          <div style={{
            background: '#112240',
            border: '1px solid rgba(15,173,160,0.2)',
            borderRadius: '10px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#7B9BB5', marginBottom: '8px' }}>
              NEAREST OPEN SHELTER
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#43D9A2', marginBottom: '4px' }}>
              {nearestShelter?.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7B9BB5' }}>{nearestShelter?.address}</div>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '10px',
              fontSize: '0.78rem',
            }}>
              <div style={{ color: '#E8F1F8' }}>
                🚗 <span style={{ color: '#0FADA0', fontWeight: 700 }}>6 min</span> drive
              </div>
              <div style={{ color: '#E8F1F8' }}>
                🚶 <span style={{ color: '#FFB347', fontWeight: 700 }}>22 min</span> walk
              </div>
            </div>
            {simulating && (
              <div style={{
                marginTop: '10px',
                padding: '8px',
                background: 'rgba(67,217,162,0.1)',
                border: '1px solid rgba(67,217,162,0.3)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#43D9A2',
              }}>
                ✓ Route calculated — see map
              </div>
            )}
          </div>

          {/* Shelter list */}
          <div style={{
            background: '#112240',
            border: '1px solid rgba(15,173,160,0.15)',
            borderRadius: '10px',
            padding: '1rem',
          }}>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#7B9BB5', marginBottom: '10px' }}>
              ALL SHELTERS
            </div>
            {SHELTERS.map(s => (
              <div key={s.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#E8F1F8', fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#3D5A73' }}>{s.address}</div>
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: s.status === 'available' ? '#43D9A2' : '#FF6B6B',
                  background: s.status === 'available' ? 'rgba(67,217,162,0.1)' : 'rgba(255,107,107,0.1)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${s.status === 'available' ? 'rgba(67,217,162,0.3)' : 'rgba(255,107,107,0.3)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {s.status === 'available' ? 'OPEN' : 'FULL'}
                </div>
              </div>
            ))}
          </div>

          {/* Profile preview if set */}
          {profile.name && (
            <div style={{
              background: '#112240',
              border: '1px solid rgba(15,173,160,0.15)',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.8rem',
              color: '#7B9BB5',
            }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '8px' }}>YOUR PROFILE</div>
              <div style={{ color: '#E8F1F8', fontWeight: 600 }}>{profile.name}</div>
              <div>Mobility: {profile.mobility}</div>
              <div>Transport: {profile.hasCar ? '🚗 Has vehicle' : '🚶 On foot'}</div>
              {profile.score && (
                <div style={{ marginTop: '6px', color: '#0FADA0', fontWeight: 700 }}>
                  Survival Score: {profile.score}%
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'rgba(15,173,160,0.1)',
                border: '1px solid rgba(15,173,160,0.4)',
                borderRadius: '8px',
                color: '#0FADA0',
                fontSize: '0.8rem',
                padding: '10px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              📋 CALCULATE SURVIVAL SPEED
            </button>
            <button
              onClick={() => navigate('/sos')}
              style={{
                background: simulating ? 'rgba(255,107,107,0.15)' : 'transparent',
                border: '1px solid rgba(255,107,107,0.4)',
                borderRadius: '8px',
                color: '#FF6B6B',
                fontSize: '0.8rem',
                padding: '10px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                fontWeight: simulating ? 700 : 400,
              }}
            >
              📡 SEND SOS SIGNAL
            </button>
          </div>

          {/* Work in progress note */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(244,201,93,0.05)',
            border: '1px dashed rgba(244,201,93,0.2)',
            borderRadius: '6px',
            fontSize: '0.65rem',
            color: '#3D5A73',
            letterSpacing: '0.05em',
          }}>
            ⚡ WORK IN PROGRESS — Real-time NWS API + AI routing coming. Demo uses simulated data.
          </div>
        </div>
      </div>
    </div>
  )
}
