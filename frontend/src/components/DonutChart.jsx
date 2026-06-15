const PALETTE = [
  '#2F6B4F', '#C9A23F', '#4A7FA5', '#8B5CF6', '#E07B30',
  '#B0573C', '#1B879E', '#6B746E', '#9B4F8B', '#3D7A5E',
]

export default function DonutChart({ data, size = 200 }) {
  if (!data || data.length === 0) return null

  const cx = size / 2
  const cy = size / 2
  const R = size * 0.38
  const r = size * 0.22
  const gap = 0.02  // radians gap between slices

  let cumAngle = -Math.PI / 2

  const slices = data.map((d, i) => {
    const angle = d.pct * 2 * Math.PI * (1 - gap * data.length / (2 * Math.PI))
    const startAngle = cumAngle + (i > 0 ? gap / 2 : 0)
    const endAngle = startAngle + angle
    cumAngle = endAngle + gap / 2

    const x1 = cx + R * Math.cos(startAngle)
    const y1 = cy + R * Math.sin(startAngle)
    const x2 = cx + R * Math.cos(endAngle)
    const y2 = cy + R * Math.sin(endAngle)
    const ix1 = cx + r * Math.cos(endAngle)
    const iy1 = cy + r * Math.sin(endAngle)
    const ix2 = cx + r * Math.cos(startAngle)
    const iy2 = cy + r * Math.sin(startAngle)
    const largeArc = angle > Math.PI ? 1 : 0

    const path = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return { path, color: PALETTE[i % PALETTE.length], ...d }
  })

  return (
    <div style={{ direction: 'ltr' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, display: 'block', margin: '0 auto' }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.9} />
        ))}
        {/* center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.07} fill="#6B746E" fontFamily="Assistant">
          הוצאות
        </text>
        <text x={cx} y={cy + size * 0.07} textAnchor="middle" fontSize={size * 0.065} fill="#1B2A27" fontFamily="Heebo" fontWeight="700">
          {slices.length} קטגוריות
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 12, direction: 'rtl' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#1B2A27', fontFamily: 'Assistant', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.category_icon} {s.category_name}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#6B746E', marginRight: 'auto', whiteSpace: 'nowrap' }}>
              {Math.round(s.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
