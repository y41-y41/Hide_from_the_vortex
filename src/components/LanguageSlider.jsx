// LanguageSlider.jsx
// A visual slider that highlights the selected language in gold.
// Languages are display-only — swap in real i18n if you have time.

import { useState } from 'react'

const LANGUAGES = [
  { code: 'ar', label: 'العربية',  dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English',  dir: 'ltr' },
  { code: 'zh', label: '普通话',    dir: 'ltr' },
  { code: 'tl', label: 'Filipino', dir: 'ltr' },
  { code: 'es', label: 'Español',  dir: 'ltr' },
]

export default function LanguageSlider({ onChange }) {
  const [index, setIndex] = useState(2) // default: English

  function handleChange(e) {
    const i = Number(e.target.value)
    setIndex(i)
    onChange?.(LANGUAGES[i])
  }

  return (
    <div style={{ width: '100%' }}>
      {/* language labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${LANGUAGES.length}, 1fr)`,
        marginBottom: '0.4rem',
        gap: '2px',
      }}>
        {LANGUAGES.map((lang, i) => (
          <div
            key={lang.code}
            onClick={() => { setIndex(i); onChange?.(lang) }}
            style={{
              textAlign: 'center',
              fontSize: i === index ? '1rem' : '0.8rem',
              fontWeight: i === index ? '700' : '400',
              color: i === index ? '#F4C95D' : '#3D5A73',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: '4px 2px',
              direction: lang.dir,
              userSelect: 'none',
              lineHeight: 1.2,
            }}
          >
            {lang.label}
          </div>
        ))}
      </div>

      {/* slider track */}
      <div style={{ position: 'relative', padding: '0 4px' }}>
        <input
          type="range"
          min={0}
          max={LANGUAGES.length - 1}
          step={1}
          value={index}
          onChange={handleChange}
          style={{
            width: '100%',
            appearance: 'none',
            height: '4px',
            borderRadius: '2px',
            background: `linear-gradient(to right, #F4C95D ${(index / (LANGUAGES.length - 1)) * 100}%, #1A3354 ${(index / (LANGUAGES.length - 1)) * 100}%)`,
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 18px; height: 18px;
            border-radius: 50%;
            background: #F4C95D;
            border: 2px solid #0B1E33;
            box-shadow: 0 0 8px rgba(244,201,93,0.6);
            cursor: pointer;
            transition: box-shadow 0.2s;
          }
          input[type=range]::-webkit-slider-thumb:hover {
            box-shadow: 0 0 14px rgba(244,201,93,0.9);
          }
          input[type=range]::-moz-range-thumb {
            width: 18px; height: 18px;
            border-radius: 50%;
            background: #F4C95D;
            border: 2px solid #0B1E33;
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* selected language display */}
      <div style={{
        marginTop: '0.75rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#7B9BB5',
        letterSpacing: '0.1em',
      }}>
        PREFERRED LANGUAGE ·{' '}
        <span style={{ color: '#F4C95D', fontWeight: 600 }}>
          {LANGUAGES[index].label}
        </span>
        <span style={{ marginLeft: '6px', opacity: 0.5, fontSize: '0.65rem' }}>
          (demo only — plug in i18n or AI translation)
        </span>
      </div>
    </div>
  )
}
