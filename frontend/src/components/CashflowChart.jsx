const C = { income: '#2F6B4F', expense: '#B0573C', line: '#D5D8CF', muted: '#6B746E', ink: '#1B2A27' }

const fmt = n => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n)

function monthShort(str) {
  // str = "YYYY-MM"
  const d = new Date(str + '-01T12:00:00')
  return d.toLocaleDateString('he-IL', { month: 'short' })
}

export default function CashflowChart({ data }) {
  if (!data || data.length === 0) return null

  const W = 340
  const H = 180
  const PAD = { top: 16, bottom: 36, left: 8, right: 8 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1)
  const n = data.length
  const groupW = chartW / n
  const barW = Math.min(groupW * 0.35, 18)
  const gap = barW * 0.4

  const yLines = 4
  const yStep = maxVal / yLines

  return (
    // dir="ltr" so SVG x-axis runs left→right regardless of page RTL
    <div style={{ direction: 'ltr' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Grid lines */}
        {Array.from({ length: yLines + 1 }, (_, i) => {
          const y = PAD.top + chartH - (i / yLines) * chartH
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke={C.line} strokeWidth={0.5} strokeDasharray={i === 0 ? '' : '3 3'} />
              {i > 0 && (
                <text x={PAD.left + 2} y={y - 3} fontSize={7} fill={C.muted} textAnchor="start">
                  {fmt(i * yStep)}
                </text>
              )}
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const cx = PAD.left + i * groupW + groupW / 2
          const incH = (d.income / maxVal) * chartH
          const expH = (d.expense / maxVal) * chartH
          const incX = cx - gap / 2 - barW
          const expX = cx + gap / 2
          const baseY = PAD.top + chartH

          return (
            <g key={d.month}>
              {/* Income bar */}
              <rect x={incX} y={baseY - incH} width={barW} height={incH}
                fill={C.income} rx={2} opacity={0.85} />
              {/* Expense bar */}
              <rect x={expX} y={baseY - expH} width={barW} height={expH}
                fill={C.expense} rx={2} opacity={0.85} />
              {/* Month label */}
              <text x={cx} y={baseY + 12} fontSize={8} fill={C.muted} textAnchor="middle">
                {monthShort(d.month)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        {[['הכנסות', C.income], ['הוצאות', C.expense]].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontSize: '0.75rem', color: C.muted, fontFamily: 'Assistant, sans-serif' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
