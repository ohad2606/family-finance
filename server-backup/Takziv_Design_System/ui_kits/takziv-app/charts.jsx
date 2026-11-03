// Takziv UI kit — hand-built SVG charts (forest/brass palette, dir=ltr internally)
const fmtILS = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)
const CAT = ['#2F6B4F', '#C9A23F', '#4A7FA5', '#8B5CF6', '#E07B30', '#B0573C', '#1B879E', '#6B746E', '#9B4F8B', '#3D7A5E']

// ---- 0–100 financial-health score ring ----
function ScoreRing({ score }) {
  const R = 38, cx = 44, cy = 44, circ = 2 * Math.PI * R
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#2F6B4F' : score >= 50 ? '#C9A23F' : '#B0573C'
  return (
    <div dir="ltr" style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: '#fff', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)' }}>מתוך 100</span>
      </div>
    </div>
  )
}

// ---- 12-month net-worth sparkline ----
function NetWorthSparkline({ data, height = 56 }) {
  const W = 280, H = height, pad = 4
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = pad + (1 - (v - min) / span) * (H - pad * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`
  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="nwfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#nwfill)" />
        <path d={line} fill="none" stroke="#6EE7B7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ---- grouped income/expense bars ----
function CashflowChart({ data }) {
  const W = 340, H = 180, PAD = { top: 16, bottom: 36, left: 8, right: 8 }
  const chartW = W - PAD.left - PAD.right, chartH = H - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1)
  const n = data.length, groupW = chartW / n
  const barW = Math.min(groupW * 0.35, 18), gap = barW * 0.4
  const yLines = 4, yStep = maxVal / yLines
  const monthShort = s => new Date(s + '-01T12:00:00').toLocaleDateString('he-IL', { month: 'short' })
  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {Array.from({ length: yLines + 1 }, (_, i) => {
          const y = PAD.top + chartH - (i / yLines) * chartH
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#D5D8CF" strokeWidth={0.5} strokeDasharray={i === 0 ? '' : '3 3'} />
              {i > 0 && <text x={PAD.left + 2} y={y - 3} fontSize={7} fill="#6B746E" textAnchor="start">{fmtILS(i * yStep)}</text>}
            </g>
          )
        })}
        {data.map((d, i) => {
          const cx = PAD.left + i * groupW + groupW / 2
          const incH = (d.income / maxVal) * chartH, expH = (d.expense / maxVal) * chartH
          const baseY = PAD.top + chartH
          return (
            <g key={d.month}>
              <rect x={cx - gap / 2 - barW} y={baseY - incH} width={barW} height={incH} fill="#2F6B4F" rx={2} opacity={0.85} />
              <rect x={cx + gap / 2} y={baseY - expH} width={barW} height={expH} fill="#B0573C" rx={2} opacity={0.85} />
              <text x={cx} y={baseY + 12} fontSize={8} fill="#6B746E" textAnchor="middle">{monthShort(d.month)}</text>
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        {[['הכנסות', '#2F6B4F'], ['הוצאות', '#B0573C']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: '0.75rem', color: '#6B746E', fontFamily: 'var(--font-sans)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- spending donut with center label + legend ----
function DonutChart({ data, size = 160 }) {
  const cx = size / 2, cy = size / 2, R = size * 0.38, r = size * 0.22, gap = 0.02
  let cum = -Math.PI / 2
  const slices = data.map((d, i) => {
    const angle = d.pct * 2 * Math.PI * (1 - gap * data.length / (2 * Math.PI))
    const start = cum + (i > 0 ? gap / 2 : 0), end = start + angle
    cum = end + gap / 2
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start)
    const x2 = cx + R * Math.cos(end), y2 = cy + R * Math.sin(end)
    const ix1 = cx + r * Math.cos(end), iy1 = cy + r * Math.sin(end)
    const ix2 = cx + r * Math.cos(start), iy2 = cy + r * Math.sin(start)
    const large = angle > Math.PI ? 1 : 0
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`
    return { path, color: CAT[i % CAT.length], ...d }
  })
  return (
    <div style={{ direction: 'ltr' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, display: 'block', margin: '0 auto' }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.9} />)}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.07} fill="#6B746E" fontFamily="var(--font-sans)">הוצאות</text>
        <text x={cx} y={cy + size * 0.07} textAnchor="middle" fontSize={size * 0.065} fill="#1B2A27" fontFamily="var(--font-display)" fontWeight="700">{slices.length} קטגוריות</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 12, direction: 'rtl' }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#1B2A27', fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.category_icon} {s.category_name}</span>
            <span style={{ fontSize: '0.72rem', color: '#6B746E', marginRight: 'auto', whiteSpace: 'nowrap' }}>{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

Object.assign(window, { ScoreRing, NetWorthSparkline, CashflowChart, DonutChart, fmtILS })
