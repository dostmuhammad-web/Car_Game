const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function MouseIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="6" />
      <path d="M12 6.5v3" />
    </svg>
  )
}

export function SoundOnIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  )
}

export function SoundOffIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
      <path d="m16.5 9.5 5 5" />
      <path d="m21.5 9.5-5 5" />
    </svg>
  )
}

export function PauseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  )
}

export function PlayIcon(props) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M7 4.5v15l13-7.5L7 4.5Z" />
    </svg>
  )
}

export function RestartIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 11a8 8 0 1 0-2.3 6.7" />
      <path d="M20 4.5V11h-6.5" />
    </svg>
  )
}

export function HomeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m3 10.5 9-7 9 7" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}

export function CoinIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9" />
      <path d="M14.5 9.5c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.9 0 2.6 5 1.3 5 3.9 0 1.2-1.1 1.9-2.5 1.9-1.2 0-2.1-.5-2.6-1.3" />
    </svg>
  )
}

export function HeartIcon({ filled = true, ...props }) {
  return (
    <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'} stroke="currentColor">
      <path d="M12 20s-7-4.4-7-9.3C5 7.8 7 6 9.3 6c1.2 0 2.1.6 2.7 1.5C12.6 6.6 13.5 6 14.7 6 17 6 19 7.8 19 10.7 19 15.6 12 20 12 20Z" />
    </svg>
  )
}

export function TrophyIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5v1.5A3.5 3.5 0 0 0 8.5 10" />
      <path d="M16 5h3v1.5A3.5 3.5 0 0 1 15.5 10" />
      <path d="M12 13v4" />
      <path d="M8.5 20h7l-.7-3h-5.6l-.7 3Z" />
    </svg>
  )
}

export function CarIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 16V9.5l2-3.5h10l2 3.5V16" />
      <path d="M3.5 16h17" />
      <path d="M6.5 16v2" />
      <path d="M17.5 16v2" />
      <path d="M7 9.5h10" />
      <path d="M7.5 12.5h.01" />
      <path d="M16.5 12.5h.01" />
    </svg>
  )
}

export function ShieldIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v6c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
