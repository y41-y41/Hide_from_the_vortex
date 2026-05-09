// AITextStream.jsx
// Plays pre-written AI messages with a typewriter effect.
// No API needed — swap MESSAGES with a real API call when ready.
// Shows a note at the end about connecting your own AI.

import { useState, useEffect, useRef } from 'react'

// Pre-written scenario messages (Windsor, ON coordinates)
const MESSAGES = [
  {
    level: 'MONITORING',
    color: '#43D9A2',
    text: `System initialized. Monitoring atmospheric conditions over Windsor-Essex County. Current conditions: wind speed 12 km/h SW, barometric pressure stable at 1013 hPa. No severe weather signatures detected. Your profile has been loaded — personalized routing is ready.`,
  },
  {
    level: 'ADVISORY',
    color: '#FFB347',
    text: `⚠ Advisory issued. A rotation signature has been detected 34km southwest of your location near Leamington. Based on your profile, you are currently in a low-risk zone. Estimated time before possible impact: 47 minutes. Continue monitoring. Shelter at Windsor Arena (2.1km) is pre-mapped for your profile.`,
  },
  {
    level: 'WARNING',
    color: '#FF8C42',
    text: `🌪 WARNING ACTIVE. Confirmed tornado on the ground near Kingsville. Tracking northeast at 62 km/h. Projected path intersects your area in approximately 18 minutes. Based on your mobility profile, recommended action: EXIT your building NOW via ground-floor south exit. Do NOT use elevators. Nearest shelter: Windsor Arena, Ouellette Ave — 3.2km, drive time 6 minutes.`,
  },
  {
    level: 'CRITICAL — TAKE COVER',
    color: '#FF6B6B',
    text: `🚨 CRITICAL. Tornado 1.4km and closing. You have less than 4 minutes. If you cannot reach shelter: move to the lowest floor, interior room, away from windows. Cover your head. Do NOT go outside. This is not a drill. Emergency services have been notified of your location.`,
  },
  {
    level: 'ALL CLEAR',
    color: '#43D9A2',
    text: `✓ All clear issued by Environment Canada for Windsor-Essex at this time. The tornado has dissipated northeast of the city. You may safely exit your shelter. Community check-in is active — mark yourself safe using the button below. This system is now monitoring for secondary rotation.`,
  },
]

const TYPING_SPEED = 22 // ms per character

export default function AITextStream({ threatLevel = 0, autoPlay = false }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showApiNote, setShowApiNote] = useState(false)
  const intervalRef = useRef(null)
  const charRef = useRef(0)

  const current = MESSAGES[msgIndex]

  function startTyping(text) {
    charRef.current = 0
    setDisplayed('')
    setIsTyping(true)
    setShowApiNote(false)
    clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      charRef.current++
      setDisplayed(text.slice(0, charRef.current))
      if (charRef.current >= text.length) {
        clearInterval(intervalRef.current)
        setIsTyping(false)
        setShowApiNote(true)
      }
    }, TYPING_SPEED)
  }

  // auto-escalate through threat levels when threatLevel prop changes
  useEffect(() => {
    const clampedIndex = Math.min(threatLevel, MESSAGES.length - 1)
    setMsgIndex(clampedIndex)
    startTyping(MESSAGES[clampedIndex].text)
  }, [threatLevel])

  // initial play
  useEffect(() => {
    startTyping(current.text)
    return () => clearInterval(intervalRef.current)
  }, [])

  function handleNextScenario() {
    const next = (msgIndex + 1) % MESSAGES.length
    setMsgIndex(next)
    startTyping(MESSAGES[next].text)
  }

  return (
    <div style={{
      background: '#0D1B2E',
      border: `1px solid ${current.color}33`,
      borderLeft: `3px solid ${current.color}`,
      borderRadius: '10px',
      padding: '1.25rem',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      position: 'relative',
    }}>
      {/* header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* blinking dot */}
          <span style={{
            display: 'inline-block',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: current.color,
            animation: isTyping ? 'blink 0.8s step-end infinite' : 'none',
          }} />
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }`}</style>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: current.color, fontWeight: 700 }}>
            AI VORTEX · {current.level}
          </span>
        </div>
        <button
          onClick={handleNextScenario}
          style={{
            fontSize: '0.65rem',
            color: '#7B9BB5',
            background: 'transparent',
            border: '1px solid #1A3354',
            borderRadius: '4px',
            padding: '3px 8px',
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          NEXT SCENARIO ›
        </button>
      </div>

      {/* message text */}
      <div style={{
        fontSize: '0.88rem',
        lineHeight: 1.75,
        color: '#C8DFF0',
        minHeight: '80px',
      }}>
        {displayed}
        {isTyping && (
          <span style={{
            display: 'inline-block',
            width: '2px', height: '14px',
            background: current.color,
            marginLeft: '2px',
            verticalAlign: 'middle',
            animation: 'blink 0.6s step-end infinite',
          }} />
        )}
      </div>

      {/* API note — shown after message finishes */}
      {showApiNote && (
        <div style={{
          marginTop: '1rem',
          padding: '0.6rem 0.85rem',
          background: 'rgba(15,173,160,0.07)',
          border: '1px dashed rgba(15,173,160,0.3)',
          borderRadius: '6px',
          fontSize: '0.7rem',
          color: '#7B9BB5',
          lineHeight: 1.6,
        }}>
          <span style={{ color: '#0FADA0', fontWeight: 600 }}>⚡ AI Integration: </span>
          Replace these demo messages with any AI API — OpenAI, Claude, Gemini — or run 100% offline with{' '}
          <span style={{ color: '#FFB347' }}>Ollama + LLaMA 3</span> (no internet required during a real tornado).
        </div>
      )}
    </div>
  )
}
