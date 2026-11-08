import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'on' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="setting-row">
      <div className="setting-text">
        <div className="setting-title">{title}</div>
        {desc && <div className="setting-desc">{desc}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  )
}

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fl-theme') || 'dark')
  const [showGrid, setShowGrid] = useState(true)
  const [snap, setSnap] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [name, setName] = useState('Aziz Karimov')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('fl-theme', theme)
  }, [theme])

  return (
    <AppShell title="Settings" subtitle="Manage your profile and app preferences">
      <div className="settings-wrap">
        <section className="card">
          <div className="card-head">
            <Icon name="user" size={18} />
            <h2>Profile</h2>
          </div>
          <div className="profile-block">
            <div className="avatar avatar-lg">AZ</div>
            <div className="profile-fields">
              <label className="field">
                <span>Display name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="field">
                <span>Email</span>
                <input defaultValue="aziz@figmalite.app" />
              </label>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <Icon name="square" size={18} />
            <h2>Appearance</h2>
          </div>
          <Row title="Theme" desc="Switch between dark and light interface">
            <div className="segmented">
              <button
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={theme === 'light' ? 'active' : ''}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
            </div>
          </Row>
          <Row title="Show canvas grid" desc="Display a dotted grid on the editor canvas">
            <Toggle checked={showGrid} onChange={setShowGrid} />
          </Row>
        </section>

        <section className="card">
          <div className="card-head">
            <Icon name="grid" size={18} />
            <h2>Editor</h2>
          </div>
          <Row title="Snap to grid" desc="Align objects to an 8px grid while dragging">
            <Toggle checked={snap} onChange={setSnap} />
          </Row>
          <Row title="Desktop notifications" desc="Get notified when teammates comment">
            <Toggle checked={notifications} onChange={setNotifications} />
          </Row>
        </section>

        <section className="card">
          <div className="card-head">
            <Icon name="settings" size={18} />
            <h2>About</h2>
          </div>
          <Row title="Figma Lite" desc="A tiny design editor built with React">
            <span className="chip">v1.0.0</span>
          </Row>
        </section>
      </div>
    </AppShell>
  )
}
