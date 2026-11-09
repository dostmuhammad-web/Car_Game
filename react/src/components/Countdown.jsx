export default function Countdown({ value }) {
  if (value === null || value === undefined) return null
  const go = value === 0
  return (
    <div className="countdown" aria-live="assertive">
      <span key={value} className={go ? 'countdown__num is-go' : 'countdown__num'}>
        {go ? 'GO!' : value}
      </span>
    </div>
  )
}
