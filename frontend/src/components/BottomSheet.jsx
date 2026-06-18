import { useRef, useState } from 'react'

const CLOSE_THRESHOLD = 80
const sheet = {
  background: '#F7F8F4', borderRadius: '22px 22px 0 0',
  padding: '1rem 1.5rem 2rem', width: '100%', maxWidth: 480,
  margin: '0 auto', fontFamily: 'Assistant, sans-serif',
  maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box',
  willChange: 'transform',
}

export default function BottomSheet({ onClose, children, zIndex = 100, style = {} }) {
  const [dragY, setDragY] = useState(0)
  const startY = useRef(null)
  const dragging = useRef(false)

  const onTouchStart = e => {
    startY.current = e.touches[0].clientY
    dragging.current = true
  }

  const onTouchMove = e => {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }

  const onTouchEnd = () => {
    dragging.current = false
    if (dragY >= CLOSE_THRESHOLD) onClose()
    setDragY(0)
  }

  const overlayAlpha = Math.max(0.4 - dragY / 500, 0).toFixed(3)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: `rgba(27,42,39,${overlayAlpha})`, display: 'flex', alignItems: 'flex-end', zIndex }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          ...sheet,
          ...style,
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform 0.25s ease' : 'none',
        }}
      >
        {/* drag handle — full-width touch target */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ margin: '0 -1.5rem 1rem', padding: '0.25rem 0 0.75rem', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: 40, height: 4, background: '#D5D8CF', borderRadius: 2, margin: '0 auto' }} />
        </div>
        {children}
      </div>
    </div>
  )
}
