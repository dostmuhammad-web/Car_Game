const variants = {
  bank: (
    <>
      <rect x="34" y="16" width="132" height="168" rx="14" fill="#2563eb" />
      <rect x="46" y="30" width="60" height="8" rx="4" fill="#93b4ff" />
      <rect x="46" y="46" width="90" height="8" rx="4" fill="#5b86ff" />
      <rect x="46" y="70" width="108" height="54" rx="10" fill="#111827" />
      <rect x="56" y="82" width="34" height="6" rx="3" fill="#6b7280" />
      <rect x="56" y="96" width="60" height="10" rx="3" fill="#e5e7eb" />
      <circle cx="60" cy="148" r="11" fill="#dbeafe" />
      <circle cx="88" cy="148" r="11" fill="#dbeafe" />
      <circle cx="116" cy="148" r="11" fill="#dbeafe" />
      <rect x="46" y="168" width="108" height="8" rx="4" fill="#3b82f6" />
    </>
  ),
  landing: (
    <>
      <rect x="24" y="24" width="152" height="152" rx="12" fill="#f8fafc" />
      <rect x="38" y="40" width="46" height="8" rx="4" fill="#0f172a" />
      <rect x="120" y="40" width="20" height="8" rx="4" fill="#94a3b8" />
      <rect x="146" y="40" width="16" height="8" rx="4" fill="#94a3b8" />
      <rect x="38" y="66" width="86" height="14" rx="4" fill="#0f172a" />
      <rect x="38" y="86" width="70" height="14" rx="4" fill="#0f172a" />
      <rect x="38" y="108" width="58" height="6" rx="3" fill="#94a3b8" />
      <rect x="38" y="128" width="52" height="18" rx="9" fill="#f97316" />
      <rect x="112" y="66" width="52" height="80" rx="10" fill="#fed7aa" />
      <circle cx="138" cy="96" r="16" fill="#fdba74" />
    </>
  ),
  dash: (
    <>
      <rect x="24" y="24" width="152" height="152" rx="12" fill="#0f172a" />
      <rect x="24" y="24" width="40" height="152" rx="12" fill="#1e293b" />
      <rect x="34" y="40" width="20" height="6" rx="3" fill="#38bdf8" />
      <rect x="34" y="56" width="20" height="6" rx="3" fill="#475569" />
      <rect x="34" y="72" width="20" height="6" rx="3" fill="#475569" />
      <rect x="76" y="40" width="42" height="34" rx="7" fill="#1e293b" />
      <rect x="126" y="40" width="38" height="34" rx="7" fill="#1e293b" />
      <rect x="76" y="84" width="88" height="78" rx="8" fill="#1e293b" />
      <path d="M84 140 L110 118 L128 128 L152 100" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  brand: (
    <>
      <rect x="24" y="24" width="152" height="152" rx="12" fill="#fff7ed" />
      <circle cx="76" cy="80" r="30" fill="#f97316" />
      <rect x="118" y="52" width="42" height="42" rx="10" fill="#fb923c" />
      <path d="M60 128 h44" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
      <path d="M60 146 h72" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="140" cy="134" r="14" fill="#fdba74" />
    </>
  ),
}

export default function ProjectThumb({ variant = 'bank' }) {
  return (
    <svg viewBox="0 0 200 200" className="thumb-svg" role="img" aria-label={`${variant} preview`}>
      <rect x="0" y="0" width="200" height="200" fill="#e2e8f0" />
      {variants[variant]}
    </svg>
  )
}
