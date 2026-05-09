import { useState, useEffect } from 'react'

const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Japanese']

const recipients = [
  'Emergency Services',
  'Local Police',
  'Fire Department',
  'Family Contact',
  'Neighbor Watch'
]

export default function SOSPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [sentStatuses, setSentStatuses] = useState(new Array(recipients.length).fill(false))
  const [sendingIndex, setSendingIndex] = useState(0)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    if (sendingIndex < recipients.length) {
      const timer = setTimeout(() => {
        setSentStatuses(prev => {
          const newStatuses = [...prev]
          newStatuses[sendingIndex] = true
          return newStatuses
        })
        setLogs(prev => [...prev, `SOS sent to ${recipients[sendingIndex]}`])
        setSendingIndex(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [sendingIndex])

  return (
    <div className="sos-page">
      <header>
        <h1>SOS Broadcast</h1>
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

      <div className="content">
        <div className="signal-tower">
          <svg width="200" height="300" viewBox="0 0 200 300">
            <rect x="80" y="200" width="40" height="100" fill="#666" />
            <polygon points="60,200 140,200 100,150" fill="#666" />
            <circle cx="100" cy="120" r="20" fill="#333" />
            <circle cx="100" cy="120" r="15" fill="#666" />
            <circle cx="100" cy="120" r="10" fill="#999" />
            <text x="100" y="125" textAnchor="middle" fill="white" fontSize="12">SOS</text>
          </svg>
          <div className="radio-rings">
            <div className="ring ring1"></div>
            <div className="ring ring2"></div>
            <div className="ring ring3"></div>
          </div>
        </div>

        <div className="morse-code">
          <p>SOS: ··· --- ···</p>
        </div>

        <div className="recipients">
          <h2>Recipients</h2>
          <ul>
            {recipients.map((recipient, index) => (
              <li key={index}>
                {recipient}: {sentStatuses[index] ? '✓ SENT' : 'SENDING...'}
              </li>
            ))}
          </ul>
        </div>

        <div className="terminal-log">
          <h2>Transmission Log</h2>
          <div className="log">
            {logs.map((log, index) => <p key={index}>{log}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}