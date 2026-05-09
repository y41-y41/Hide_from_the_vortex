// SOSPage.jsx — Signal tower + SOS sending animation
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const RECIPIENTS = [
  { id: 1, name: 'Windsor Police — Dispatch', code: '519-255-6700', status: 'sending' },
  { id: 2, name: 'Essex County EMS', code: 'EMS-W-4421', status: 'sending' },
  { id: 3, name: 'Environment Canada', code: 'EC-ALERT-ON', status: 'sending' },
  { id: 4, name: 'Family Contact (saved)', code: '+1 519-***-****', status: 'sending' },
  { id: 5, name: 'Nearest Shelter — Windsor Arena', code: 'SHELTER-001', status: 'sending' },
]

const MESSAGE_LINES = [
  '> INITIALIZING SOS BROADCAST...',
  '> GPS LOCK: 42.3149°N, 83.0364°W',
  '> PROFILE LOADED: SURVIVOR',
  '> ENCODING MESSAGE PACKET...',
  '> BROADCASTING ON 406 MHz EMERGENCY BAND...',
  '> SENDING TO 5 RECIPIENTS...',
  '> RETRY INTERVAL: 50 SEC (COSPAS-SARSAT)',
  '> SIGNAL STRENGTH: ████████░░ 82%',
  '> [WORK IN PROGRESS] — Real radio integration pending',
]

export default function SOSPage() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [statuses, setStatuses] = useState(RECIPIENTS.map(r => ({ ...r, status: 'pending' })))
  const [logLines, setLogLines] = useState([])

  const profile = (() => { try { return JSON.parse(localStorage.getItem('vortex_profile') || '{}') } catch { return {} } })()

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 600)
    return () => clearInterval(t)
  }, [])

  // Simulate sending one by one
  useEffect(() => {
    if (sentCount >= RECIPIENTS.length) return
    const t = setTimeout(() => {
      setStatuses(prev => prev.map((r, i) =>
        i === sentCount ? { ...r, status: 'sent' } : r
      ))
      setLogLines(prev => [...prev, MESSAGE_LINES[Math.min(sentCount + 3, MESSAGE_LINES.length - 1)]])
      setSentCount(n => n + 1)
    }, 900 + sentCount * 700)
    return () => clearTimeout(t)
  }, [sentCount])

  // Add initial log lines
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      if (i < 3) {
        setLogLines(prev => [...prev, MESSAGE_LINES[i]])
        i++
      } else clearInterval(t)
    }, 500)
    return () => clearInterval(t)
  }, [])

  const allSent = statuses.every(s => s.status === 'sent')
  const rings = [0, 1, 2, 3]

  return (
    <div style={{ minHeight: '100vh', background: '#0B1E33', display: 'flex', flexDirection: 'column' }}>

      {/* header */}
      <header style={{
        padding: '0.85rem 1.5rem',
        borderBottom: '1px solid rgba(255,107,107,0.2)',
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
            ← BACK
          </button>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.12em', color: '#0FADA0' }}>VORTEX</div>
        </div>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: '#FF6B6B',
          fontWeight: 700,
          animation: 'sos-blink 1s step-end infinite',
        }}>
          <style>{`@keyframes sos-blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
          ● SOS ACTIVE
        </div>
      </header>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        alignItems: 'start',
      }}>

        {/* LEFT — tower animation */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: '#FF6B6B',
            fontWeight: 700,
            marginBottom: '-0.5rem',
          }}>
            EMERGENCY BROADCAST STATION
          </div>

          {/* Signal tower SVG */}
          <div style={{ position: 'relative', width: '240px', height: '280px' }}>
            <style>{`
              @keyframes ring-out {
                0%   { r: 10; opacity: 0.9; }
                100% { r: 90; opacity: 0; }
              }
              .signal-ring {
                animation: ring-out 2.2s ease-out infinite;
                fill: none;
                stroke: #FF6B6B;
                stroke-width: 2;
              }
            `}</style>

            <svg viewBox="0 0 240 280" width="240" height="280">
              {/* base platform */}
              <rect x="80" y="250" width="80" height="8" rx="4" fill="#1A3354" />
              <rect x="100" y="235" width="40" height="16" rx="3" fill="#1A3354" />

              {/* tower legs */}
              <line x1="120" y1="230" x2="90" y2="258" stroke="#0FADA0" strokeWidth="3" strokeLinecap="round" />
              <line x1="120" y1="230" x2="150" y2="258" stroke="#0FADA0" strokeWidth="3" strokeLinecap="round" />

              {/* tower body */}
              <line x1="120" y1="60" x2="120" y2="230" stroke="#0FADA0" strokeWidth="4" strokeLinecap="round" />

              {/* cross beams */}
              {[100, 140, 180, 210].map((y, i) => {
                const w = 10 + i * 8
                return (
                  <g key={y}>
                    <line x1={120 - w} y1={y} x2={120 + w} y2={y} stroke="#0A7A70" strokeWidth="2" />
                    <line x1={120 - w} y1={y} x2="120" y2={y - 30} stroke="#0A7A70" strokeWidth="1.5" opacity="0.5" />
                    <line x1={120 + w} y1={y} x2="120" y2={y - 30} stroke="#0A7A70" strokeWidth="1.5" opacity="0.5" />
                  </g>
                )
              })}

              {/* antenna spike */}
              <line x1="120" y1="20" x2="120" y2="65" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
              <circle cx="120" cy="18" r="5" fill="#FF6B6B" />
              {/* blinking tip */}
              <circle cx="120" cy="18" r="5" fill="#FF6B6B" opacity={tick % 2 === 0 ? 1 : 0.2} />

              {/* signal rings */}
              {rings.map((i) => (
                <circle
                  key={i}
                  className="signal-ring"
                  cx="120"
                  cy="18"
                  r="10"
                  style={{ animationDelay: `${i * 0.55}s` }}
                />
              ))}

              {/* SOS text pulsing */}
              <text
                x="120" y="200"
                textAnchor="middle"
                fill="#FF6B6B"
                fontSize="11"
                fontWeight="900"
                fontFamily="monospace"
                letterSpacing="6"
                opacity={tick % 3 === 0 ? 0.3 : 1}
              >
                · · · — — — · · ·
              </text>
            </svg>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#7B9BB5',
            lineHeight: 1.7,
          }}>
            Broadcasting distress signal on{' '}
            <span style={{ color: '#FF6B6B', fontWeight: 700 }}>406 MHz</span><br />
            GPS coordinates transmitted every 50 sec<br />
            {profile.name && (
              <span style={{ color: '#0FADA0' }}>Registered to: {profile.name}</span>
            )}
          </div>

          {/* WIP badge */}
          <div style={{
            padding: '10px 20px',
            background: 'rgba(244,201,93,0.07)',
            border: '1px dashed rgba(244,201,93,0.3)',
            borderRadius: '8px',
            fontSize: '0.72rem',
            color: '#F4C95D',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '280px',
          }}>
            ⚡ <strong>WORK IN PROGRESS</strong><br />
            Real satellite + SMS integration coming.<br />
            Currently simulating COSPAS-SARSAT protocol.
          </div>
        </div>

        {/* RIGHT — recipients + log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Recipients */}
          <div style={{
            background: '#112240',
            border: '1px solid rgba(255,107,107,0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#FF6B6B', marginBottom: '1rem', fontWeight: 700 }}>
              SENDING SOS TO {RECIPIENTS.length} RECIPIENTS
            </div>
            {statuses.map(r => (
              <div key={r.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#E8F1F8', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#3D5A73', fontFamily: 'monospace' }}>{r.code}</div>
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: r.status === 'sent' ? '#43D9A2' : '#FFB347',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  {r.status === 'sent' ? (
                    <><span style={{ fontSize: '1rem' }}>✓</span> SENT</>
                  ) : (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: '#FFB347',
                        animation: 'pulse 0.8s ease-in-out infinite',
                      }} />
                      SENDING...
                    </>
                  )}
                </div>
              </div>
            ))}

            {allSent && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: 'rgba(67,217,162,0.1)',
                border: '1px solid rgba(67,217,162,0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#43D9A2',
                textAlign: 'center',
                fontWeight: 700,
              }}>
                ✓ ALL SOS MESSAGES TRANSMITTED
              </div>
            )}
          </div>

          {/* Terminal log */}
          <div style={{
            background: '#060F1A',
            border: '1px solid rgba(15,173,160,0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: '0.72rem',
            color: '#43D9A2',
            minHeight: '200px',
          }}>
            <div style={{ color: '#3D5A73', marginBottom: '8px', letterSpacing: '0.1em' }}>
              SYSTEM LOG — VORTEX SOS v0.1
            </div>
            {MESSAGE_LINES.slice(0, 3).map((line, i) => (
              <div key={i} style={{ marginBottom: '4px', opacity: 0.7 }}>{line}</div>
            ))}
            {logLines.map((line, i) => (
              <div key={i + 3} style={{ marginBottom: '4px', color: '#43D9A2' }}>{line}</div>
            ))}
            <div style={{ color: '#0FADA0', marginTop: '6px' }}>
              {'> '}<span style={{ opacity: tick % 2 === 0 ? 1 : 0 }}>_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
