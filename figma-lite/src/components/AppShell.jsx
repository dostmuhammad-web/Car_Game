import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

const nav = [
  { to: '/', label: 'Recents', icon: 'home', end: true },
  { to: '/templates', label: 'Templates', icon: 'grid' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export default function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-brand" title="Figma Lite">
          <span className="brand-dot" />
        </div>
        <nav className="rail-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-foot">
          <div className="avatar avatar-sm">AZ</div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-search">
            <Icon name="search" size={16} />
            <input placeholder="Search files, templates…" />
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Notifications">
              <Icon name="bell" size={18} />
            </button>
            <div className="avatar">AZ</div>
          </div>
        </header>

        <main className="page">
          <div className="page-head">
            <div>
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-sub">{subtitle}</p>}
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
