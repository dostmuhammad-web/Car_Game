import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import ProjectThumb from '../components/ProjectThumb.jsx'

const templates = [
  { id: 'bank', name: 'Finance App', tag: 'Mobile', variant: 'bank' },
  { id: 'landing', name: 'Startup Landing', tag: 'Web', variant: 'landing' },
  { id: 'dash', name: 'Admin Dashboard', tag: 'Web app', variant: 'dash' },
  { id: 'brand', name: 'Brand Guidelines', tag: 'Branding', variant: 'brand' },
  { id: 'bank2', name: 'Wallet Concept', tag: 'Mobile', variant: 'bank' },
  { id: 'dash2', name: 'Reports Panel', tag: 'Web app', variant: 'dash' },
]

export default function Templates() {
  return (
    <AppShell
      title="Templates"
      subtitle="Start faster with a ready-made layout"
      actions={
        <Link to="/editor" className="btn btn-primary">
          <Icon name="plus" size={16} /> Blank design
        </Link>
      }
    >
      <div className="template-grid">
        {templates.map((t) => (
          <div key={t.id} className="template-card">
            <div className="template-thumb">
              <ProjectThumb variant={t.variant} />
              <div className="template-overlay">
                <Link to="/editor" className="btn btn-primary btn-sm">
                  <Icon name="play" size={14} /> Open
                </Link>
              </div>
            </div>
            <div className="template-body">
              <div className="template-name">{t.name}</div>
              <span className="chip">{t.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
