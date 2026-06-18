import { useState, useEffect } from 'react'

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

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      style={style}
      required={required}
      maxLength={10}
      dir="ltr"
    />
  )
}
