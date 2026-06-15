const C = {
  ink: '#1B2A27', muted: '#6B746E', line: '#D5D8CF',
  income: '#2F6B4F', expense: '#B0573C', brass: '#C9A23F',
}

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n ?? 0)

const MONTH_SHORT = ['ינו׳','פבר׳','מרץ','אפר׳','מאי','יוני','יולי','אוג׳','ספט׳','אוק׳','נוב׳','דצמ׳']

export default function NetWorthChart({ data }) {
  if (!data || data.length < 2) return null

  const values = data.map(d => d.net_worth)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const W = 300, H = 100, PAD = 4
  const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2))
  const ys = values.map(v => H - PAD - ((v - min) / range) * (H - PAD * 2))

  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ')

  // Area fill path
  const area = [
    `M${xs[0]},${H}`,
    ...xs.map((x, i) => `L${x},${ys[i]}`),
    `L${xs[xs.length - 1]},${H}`,
    'Z',
  ].join(' ')

  const isPositive = values[values.length - 1] >= values[0]
  const lineColor = isPositive ? C.income : C.expense
  const fillColor = isPositive ? C.income : C.expense

  // Show every 3rd label to avoid crowding
  const step = data.length > 8 ? 3 : 2

  return (
    <div dir="ltr">
      <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Zero line if net worth crosses zero */}
        {min < 0 && max > 0 && (() => {
          const zeroY = H - PAD - ((0 - min) / range) * (H - PAD * 2)
          return <line x1={PAD} x2={W - PAD} y1={zeroY} y2={zeroY} stroke={C.line} strokeWidth={1} strokeDasharray="3,3" />
        })()}

        {/* Area fill */}
        <path d={area} fill="url(#nwGrad)" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots at each data point */}
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r={2.5} fill={lineColor} opacity={0.7} />
        ))}

        {/* Last point — highlight */}
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={4} fill={lineColor} />

        {/* Month labels */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return null
          const mo = parseInt(d.month.split('-')[1]) - 1
          return (
            <text key={i} x={xs[i]} y={H + 14} textAnchor="middle" fill={C.muted} fontSize={7}>
              {MONTH_SHORT[mo]}
            </text>
          )
        })}
      </svg>

      {/* Min / Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: '0.68rem', color: C.muted }}>{fmt(min)}</span>
        <span style={{ fontSize: '0.68rem', color: C.muted }}>{fmt(max)}</span>
      </div>
    </div>
  )
}
