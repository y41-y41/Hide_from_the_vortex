import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const windsorCenter = [42.3149, -83.0364]
const userLocation = [42.315, -83.037]
const shelters = [
  { id: 1, lat: 42.32, lng: -83.04, status: 'OPEN', color: 'green' },
  { id: 2, lat: 42.31, lng: -83.03, status: 'FULL', color: 'red' },
  { id: 3, lat: 42.33, lng: -83.05, status: 'FULL', color: 'red' }
]
const tornadoPath = [
  [42.315, -83.037],
  [42.32, -83.032],
  [42.325, -83.027],
  [42.33, -83.022]
]
const routeToArena = [userLocation, [42.32, -83.04]]

const languages = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Japanese']

export default function MainDashboard() {
  const [tornadoSimulating, setTornadoSimulating] = useState(false)
  const [tornadoIndex, setTornadoIndex] = useState(0)
  const [eta, setEta] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [flashingTranslations, setFlashingTranslations] = useState<string[]>([])

  const simulateTornado = () => {
    setTornadoSimulating(true)
    setTornadoIndex(0)
    setEta(300) // 5 minutes

    // Animate tornado
    const interval = setInterval(() => {
      setTornadoIndex(prev => {
        if (prev >= tornadoPath.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1000)

    // ETA countdown
    const etaInterval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          clearInterval(etaInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Flash translations
    setFlashingTranslations(languages)
    setTimeout(() => setFlashingTranslations([]), 3000)
  }

  return (
    <div className="main-dashboard">
      <header>
        <h1>VORTEX — AI Tornado Survival System</h1>
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
        {flashingTranslations.length > 0 && (
          <div className="flashing-translations">
            {flashingTranslations.map(lang => <span key={lang}>{lang} </span>)}
          </div>
        )}
      </header>

      <div className="content">
        <div className="map-container">
          <MapContainer center={windsorCenter} zoom={13} style={{ height: '500px', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <Marker position={userLocation}>
              <Popup>Your Location</Popup>
            </Marker>
            {shelters.map(shelter => (
              <Marker key={shelter.id} position={[shelter.lat, shelter.lng]}>
                <Popup>Shelter {shelter.id} - {shelter.status}</Popup>
              </Marker>
            ))}
            {tornadoSimulating && tornadoIndex < tornadoPath.length && (
              <Marker position={tornadoPath[tornadoIndex]}>
                <Popup>🌪 Tornado</Popup>
              </Marker>
            )}
            {tornadoSimulating && (
              <Polyline positions={routeToArena} color="green" />
            )}
          </MapContainer>
        </div>

        <div className="sidebar">
          <h2>Status</h2>
          <p>{tornadoSimulating ? 'TORNADO APPROACHING' : 'CLEAR'}</p>
          {tornadoSimulating && (
            <p>ETA to Shelter: {Math.floor(eta / 60)}:{(eta % 60).toString().padStart(2, '0')}</p>
          )}
          <button onClick={simulateTornado} disabled={tornadoSimulating}>
            SIMULATE TORNADO
          </button>
        </div>
      </div>
    </div>
  )
}