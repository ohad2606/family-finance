import { useState, useEffect, useRef } from 'react'

const isoToDisplay = iso => {
  if (!iso || iso.length < 10) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const digitsToIso = digits => {
  if (digits.length < 8) return null
  const d = digits.slice(0, 2), m = digits.slice(2, 4), y = digits.slice(4, 8)
  const dd = parseInt(d, 10), mm = parseInt(m, 10)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  return `${y}-${m}-${d}`
}

export default function DateInput({ value, onChange, style, required, placeholder = 'dd/mm/yyyy' }) {
  const [display, setDisplay] = useState(() => isoToDisplay(value))
  const pickerRef = useRef(null)

  useEffect(() => {
    setDisplay(isoToDisplay(value))
  }, [value])

  const handleChange = e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = digits.slice(0, 2)
    if (digits.length > 2) formatted += '/' + digits.slice(2, 4)
    if (digits.length > 4) formatted += '/' + digits.slice(4, 8)
    setDisplay(formatted)

    if (digits.length === 8) {
      const iso = digitsToIso(digits)
      if (iso) onChange({ target: { value: iso } })
    } else if (digits.length === 0) {
      onChange({ target: { value: '' } })
    }
  }

  const handlePicker = e => {
    const iso = e.target.value
    if (iso) {
      setDisplay(isoToDisplay(iso))
      onChange({ target: { value: iso } })
    }
  }

  // style goes on the wrapper div (handles flex, width, etc.)
  // input inside is transparent/borderless so the div "is" the input visually
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...style, direction: 'ltr' }}>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        required={required}
        maxLength={10}
        dir="ltr"
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', textAlign: 'left',
          padding: 0, paddingRight: '1.5rem',
        }}
      />
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        onChange={handlePicker}
        tabIndex={-1}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2rem', opacity: 0, cursor: 'pointer' }}
      />
      <span style={{ position: 'absolute', right: '0.35rem', fontSize: '0.9rem', pointerEvents: 'none', lineHeight: 1 }}>📅</span>
    </div>
  )
}
