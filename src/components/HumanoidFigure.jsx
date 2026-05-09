// HumanoidFigure.jsx
// Props:
//   mobility   : "walking" | "wheelchair" | "elderly" | "child"
//   score      : 0-100 (survivability %)
//   animate    : bool (pulse when danger)

export default function HumanoidFigure({ mobility = 'walking', score = 80, animate = false }) {
  // color shifts green → yellow → orange → red as score drops
  const color =
    score > 75 ? '#43D9A2' :
    score > 50 ? '#FFB347' :
    score > 25 ? '#FF8C42' : '#FF6B6B'

  const pulse = animate && score < 50
    ? { animation: 'pulse 1.2s ease-in-out infinite' }
    : {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { filter: drop-shadow(0 0 4px ${color}); }
          50%       { filter: drop-shadow(0 0 16px ${color}); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
      `}</style>

      <svg
        viewBox="0 0 80 160"
        width="80"
        height="160"
        style={{ filter: `drop-shadow(0 0 8px ${color}55)`, ...pulse }}
      >
        {/* ── HEAD ── */}
        <circle cx="40" cy="22" r="14" fill={color} opacity="0.9" />

        {/* ── NECK ── */}
        <rect x="36" y="34" width="8" height="8" rx="2" fill={color} opacity="0.8" />

        {mobility === 'wheelchair' ? (
          <WheelchairBody color={color} />
        ) : mobility === 'elderly' ? (
          <ElderlyBody color={color} />
        ) : mobility === 'child' ? (
          <ChildBody color={color} />
        ) : (
          <StandingBody color={color} />
        )}
      </svg>

      {/* score ring */}
      <svg viewBox="0 0 80 80" width="70" height="70">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#1A3354" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="34"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 34}`}
          strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
        <text x="40" y="38" textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="monospace">{score}%</text>
        <text x="40" y="54" textAnchor="middle" fill="#7B9BB5" fontSize="9" fontFamily="monospace">GET THERE</text>
      </svg>
    </div>
  )
}

function StandingBody({ color }) {
  return (
    <>
      {/* torso */}
      <path d="M26 42 Q40 38 54 42 L58 90 Q40 94 22 90 Z" fill={color} opacity="0.85" />
      {/* left arm */}
      <path d="M26 44 L14 72" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* right arm */}
      <path d="M54 44 L66 72" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* left leg */}
      <path d="M32 90 L28 140" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* right leg */}
      <path d="M48 90 L52 140" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* shoes */}
      <ellipse cx="26" cy="141" rx="10" ry="5" fill={color} opacity="0.7" />
      <ellipse cx="54" cy="141" rx="10" ry="5" fill={color} opacity="0.7" />
    </>
  )
}

function WheelchairBody({ color }) {
  return (
    <>
      {/* torso (seated) */}
      <path d="M26 42 Q40 38 54 42 L56 82 Q40 86 24 82 Z" fill={color} opacity="0.85" />
      {/* arms */}
      <path d="M26 46 L14 68" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M54 46 L66 68" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* legs horizontal */}
      <path d="M24 82 L18 100" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M56 82 L62 100" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* wheelchair seat */}
      <path d="M14 88 L66 88" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* wheels */}
      <circle cx="20" cy="112" r="16" fill="none" stroke={color} strokeWidth="4" opacity="0.8" />
      <circle cx="60" cy="112" r="16" fill="none" stroke={color} strokeWidth="4" opacity="0.8" />
      <circle cx="20" cy="112" r="3" fill={color} opacity="0.9" />
      <circle cx="60" cy="112" r="3" fill={color} opacity="0.9" />
      {/* spokes */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1={20} y1={112}
          x2={20 + 12 * Math.cos(a * Math.PI / 180)}
          y2={112 + 12 * Math.sin(a * Math.PI / 180)}
          stroke={color} strokeWidth="1.5" opacity="0.5"
        />
      ))}
      {[0,60,120,180,240,300].map(a => (
        <line key={'r'+a}
          x1={60} y1={112}
          x2={60 + 12 * Math.cos(a * Math.PI / 180)}
          y2={112 + 12 * Math.sin(a * Math.PI / 180)}
          stroke={color} strokeWidth="1.5" opacity="0.5"
        />
      ))}
    </>
  )
}

function ElderlyBody({ color }) {
  return (
    <>
      {/* torso (slightly hunched) */}
      <path d="M28 44 Q40 40 52 44 L54 86 Q40 90 26 86 Z" fill={color} opacity="0.85" />
      {/* arms */}
      <path d="M28 46 L18 74" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M52 46 L58 70" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* cane */}
      <path d="M60 70 L66 130" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M60 70 L70 68" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* legs */}
      <path d="M33 86 L30 138" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M47 86 L50 138" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* shoes */}
      <ellipse cx="28" cy="139" rx="9" ry="5" fill={color} opacity="0.7" />
      <ellipse cx="52" cy="139" rx="9" ry="5" fill={color} opacity="0.7" />
    </>
  )
}

function ChildBody({ color }) {
  return (
    <>
      {/* torso (smaller) */}
      <path d="M30 42 Q40 39 50 42 L52 78 Q40 82 28 78 Z" fill={color} opacity="0.85" />
      {/* arms */}
      <path d="M30 44 L20 66" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M50 44 L60 66" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* legs */}
      <path d="M34 78 L31 128" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M46 78 L49 128" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* shoes */}
      <ellipse cx="29" cy="129" rx="9" ry="5" fill={color} opacity="0.7" />
      <ellipse cx="51" cy="129" rx="9" ry="5" fill={color} opacity="0.7" />
    </>
  )
}
