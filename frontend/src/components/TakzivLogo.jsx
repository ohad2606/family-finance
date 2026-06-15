export default function TakzivLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="64" height="64" rx="14" fill="#1B2A27"/>
      <polygon points="32,11 54,32 10,32" fill="#C9A23F"/>
      <rect x="15" y="30" width="34" height="22" rx="2" fill="#C9A23F" fillOpacity="0.18" stroke="#C9A23F" strokeWidth="2"/>
      <text x="32" y="47" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="bold" fill="#C9A23F">₪</text>
    </svg>
  )
}
