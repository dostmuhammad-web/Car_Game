import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import Icon from '../components/Icon.jsx'
import ProjectThumb from '../components/ProjectThumb.jsx'

const projects = [
  { id: 1, name: 'Mobile Banking App', variant: 'bank', edited: '2 hours ago', team: ['AZ', 'MK', 'SL'] },
  { id: 2, name: 'SaaS Landing Page', variant: 'landing', edited: 'Yesterday', team: ['AZ', 'SL'] },
  { id: 3, name: 'Analytics Dashboard', variant: 'dash', edited: '3 days ago', team: ['MK'] },
  { id: 4, name: 'Brand Identity Kit', variant: 'brand', edited: 'Last week', team: ['AZ', 'MK'] },
]

export default function Home() {
  return (
    <AppShell
      title="Recents"
      subtitle="Jump back into your latest designs"
      actions={
        <>
          <Link to="/templates" className="btn btn-ghost">
            <Icon name="grid" size={16} /> Browse templates
          </Link>
          <Link to="/editor" className="btn btn-primary">
            <Icon name="plus" size={16} /> New design
          </Link>
        </>
      }
    >
      <div className="section-label">
        <Icon name="folder" size={15} /> Your projects
      </div>

      <div className="project-grid">
        {projects.map((p) => (
          <Link key={p.id} to="/editor" className="project-card">
            <div className="project-thumb">
              <ProjectThumb variant={p.variant} />
            </div>
            <div className="project-body">
              <div className="project-name">{p.name}</div>
              <div className="project-meta">
                <span>{p.edited}</span>
                <div className="avatar-stack">
                  {p.team.map((t) => (
                    <span key={t} className="avatar avatar-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 34 }}>
        <Icon name="star" size={15} /> Quick actions
      </div>
      <div className="quick-grid">
        <Link to="/editor" className="quick-card">
          <div className="quick-ico"><Icon name="square" size={20} /></div>
          <div>
            <div className="quick-title">Blank canvas</div>
            <div className="quick-sub">Start a design from scratch</div>
          </div>
          <Icon name="chevronRight" size={18} className="quick-arrow" />
        </Link>
        <Link to="/templates" className="quick-card">
          <div className="quick-ico"><Icon name="grid" size={20} /></div>
          <div>
            <div className="quick-title">Use a template</div>
            <div className="quick-sub">Ready-made starting points</div>
          </div>
          <Icon name="chevronRight" size={18} className="quick-arrow" />
        </Link>
        <Link to="/settings" className="quick-card">
          <div className="quick-ico"><Icon name="settings" size={20} /></div>
          <div>
            <div className="quick-title">Preferences</div>
            <div className="quick-sub">Theme, account and more</div>
          </div>
          <Icon name="chevronRight" size={18} className="quick-arrow" />
        </Link>
      </div>
    </AppShell>
  )
}
