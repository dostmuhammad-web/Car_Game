import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

const ART_W = 480
const ART_H = 720

const initialShapes = [
  { id: 'header', type: 'rect', name: 'Header', x: 0, y: 0, w: 480, h: 170, fill: '#2563eb', radius: 0, visible: true },
  { id: 'greet', type: 'text', name: 'Good morning', x: 24, y: 44, w: 220, h: 20, text: 'Good morning', color: '#bfdbfe', fontSize: 14, weight: 500, visible: true },
  { id: 'user', type: 'text', name: 'Name', x: 24, y: 66, w: 260, h: 30, text: 'Aziz Karimov', color: '#ffffff', fontSize: 21, weight: 600, visible: true },
  { id: 'balance', type: 'text', name: 'Balance title', x: 24, y: 108, w: 320, h: 48, text: '$12,480.00', color: '#ffffff', fontSize: 36, weight: 700, visible: true },
  { id: 'card', type: 'rect', name: 'Debit card', x: 24, y: 196, w: 432, h: 132, fill: '#0f172a', radius: 18, visible: true },
  { id: 'cardnum', type: 'text', name: 'Card number', x: 44, y: 216, w: 220, h: 18, text: 'Visa •••• 4291', color: '#94a3b8', fontSize: 13, weight: 500, visible: true },
  { id: 'cardsub', type: 'text', name: 'Card label', x: 44, y: 244, w: 220, h: 18, text: 'Available balance', color: '#64748b', fontSize: 12, weight: 500, visible: true },
  { id: 'cardsum', type: 'text', name: 'Card amount', x: 44, y: 268, w: 240, h: 32, text: '$8,240.50', color: '#f8fafc', fontSize: 23, weight: 600, visible: true },
  { id: 'cardlogo', type: 'circle', name: 'Card logo', x: 380, y: 214, w: 44, h: 44, fill: '#1d4ed8', visible: true },
  { id: 'qtitle', type: 'text', name: 'Quick actions', x: 24, y: 356, w: 220, h: 24, text: 'Quick actions', color: '#0f172a', fontSize: 15, weight: 600, visible: true },
  { id: 'q1', type: 'circle', name: 'Action 1', x: 34, y: 392, w: 60, h: 60, fill: '#dbeafe', visible: true },
  { id: 'q2', type: 'circle', name: 'Action 2', x: 138, y: 392, w: 60, h: 60, fill: '#e0e7ff', visible: true },
  { id: 'q3', type: 'circle', name: 'Action 3', x: 242, y: 392, w: 60, h: 60, fill: '#dcfce7', visible: true },
  { id: 'q4', type: 'circle', name: 'Action 4', x: 346, y: 392, w: 60, h: 60, fill: '#fee2e2', visible: true },
  { id: 'ttitle', type: 'text', name: 'Transactions', x: 24, y: 486, w: 220, h: 24, text: 'Transactions', color: '#0f172a', fontSize: 15, weight: 600, visible: true },
  { id: 't1', type: 'rect', name: 'Transaction 1', x: 24, y: 518, w: 432, h: 64, fill: '#f1f5f9', radius: 14, visible: true },
  { id: 't2', type: 'rect', name: 'Transaction 2', x: 24, y: 592, w: 432, h: 64, fill: '#f1f5f9', radius: 14, visible: true },
  { id: 'nav', type: 'rect', name: 'Bottom nav', x: 0, y: 664, w: 480, h: 56, fill: '#f8fafc', radius: 0, visible: true },
]

let uid = 0
const nextId = () => `shape-${Date.now()}-${uid++}`

function ShapeView({ shape, selected, onPointerDown }) {
  const style = {
    position: 'absolute',
    left: shape.x,
    top: shape.y,
    width: shape.w,
    height: shape.h,
    display: shape.visible === false ? 'none' : undefined,
    boxShadow: selected ? '0 0 0 2px #0d99ff, 0 0 0 4px rgba(13,153,255,0.25)' : undefined,
    cursor: 'grab',
    userSelect: 'none',
  }

  const onDown = (e) => {
    e.stopPropagation()
    onPointerDown(e, shape)
  }

  if (shape.type === 'text') {
    return (
      <div
        style={{
          ...style,
          color: shape.color,
          fontSize: shape.fontSize,
          fontWeight: shape.weight,
          lineHeight: 1.15,
          display: shape.visible === false ? 'none' : 'flex',
          alignItems: 'flex-start',
          whiteSpace: 'pre-wrap',
        }}
        onPointerDown={onDown}
      >
        {shape.text}
      </div>
    )
  }

  return (
    <div
      style={{
        ...style,
        background: shape.fill,
        borderRadius: shape.type === 'circle' ? '50%' : shape.radius || 0,
      }}
      onPointerDown={onDown}
    />
  )
}

export default function Editor() {
  const [shapes, setShapes] = useState(initialShapes)
  const [selectedId, setSelectedId] = useState('header')
  const [zoom, setZoom] = useState(0.82)
  const [drag, setDrag] = useState(null)
  const [fileName, setFileName] = useState('Mobile Banking App')
  const artboardRef = useRef(null)

  const selected = shapes.find((s) => s.id === selectedId) || null

  const updateShape = useCallback((id, patch) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const startDrag = (e, shape) => {
    e.preventDefault()
    setSelectedId(shape.id)
    setDrag({ id: shape.id, startX: e.clientX, startY: e.clientY, origX: shape.x, origY: shape.y })
  }

  useEffect(() => {
    if (!drag) return
    const move = (e) => {
      const dx = (e.clientX - drag.startX) / zoom
      const dy = (e.clientY - drag.startY) / zoom
      updateShape(drag.id, {
        x: Math.round(drag.origX + dx),
        y: Math.round(drag.origY + dy),
      })
    }
    const up = () => setDrag(null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [drag, zoom, updateShape])

  const deleteSelected = useCallback(() => {
    if (!selectedId) return
    setShapes((prev) => prev.filter((s) => s.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
      }
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteSelected])

  const addShape = (type) => {
    const n = shapes.length
    const base = { id: nextId(), visible: true, x: 120 + (n % 5) * 18, y: 240 + (n % 5) * 18 }
    let shape
    if (type === 'text') {
      shape = { ...base, type, name: 'Text', w: 160, h: 34, text: 'New text', color: '#0f172a', fontSize: 22, weight: 600 }
    } else if (type === 'circle') {
      shape = { ...base, type, name: 'Ellipse', w: 110, h: 110, fill: '#6366f1' }
    } else {
      shape = { ...base, type: 'rect', name: 'Rectangle', w: 160, h: 110, fill: '#6366f1', radius: 10 }
    }
    setShapes((prev) => [...prev, shape])
    setSelectedId(shape.id)
  }

  const toggleVisible = (id) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))
  }

  return (
    <div className="editor">
      <header className="ed-topbar">
        <div className="ed-left">
          <Link to="/" className="icon-btn" title="Back to files">
            <Icon name="arrowLeft" size={18} />
          </Link>
          <div className="ed-logo"><span className="brand-dot" /></div>
          <div className="ed-file">
            <input
              className="ed-filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              aria-label="File name"
            />
            <span className="ed-filepath">Draft · Saved</span>
          </div>
        </div>

        <div className="ed-tools">
          <button className="tool-btn" title="Select"><Icon name="drag" size={18} /></button>
          <span className="tool-sep" />
          <button className="tool-btn" title="Rectangle" onClick={() => addShape('rect')}><Icon name="square" size={18} /></button>
          <button className="tool-btn" title="Ellipse" onClick={() => addShape('circle')}><Icon name="circle" size={18} /></button>
          <button className="tool-btn" title="Text" onClick={() => addShape('text')}><Icon name="text" size={18} /></button>
          <span className="tool-sep" />
          <button
            className="tool-btn danger"
            title="Delete"
            onClick={deleteSelected}
            disabled={!selectedId}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>

        <div className="ed-right">
          <div className="avatar-stack">
            <span className="avatar avatar-xs">MK</span>
            <span className="avatar avatar-xs">SL</span>
            <span className="avatar avatar-xs">AZ</span>
          </div>
          <button className="btn btn-primary btn-sm">Share</button>
        </div>
      </header>

      <div className="ed-body">
        <aside className="ed-panel ed-layers">
          <div className="panel-h">
            <span>Layers</span>
            <span className="panel-count">{shapes.length}</span>
          </div>
          <div className="layer-list">
            {[...shapes].reverse().map((s) => (
              <div
                key={s.id}
                className={`layer-row ${s.id === selectedId ? 'active' : ''} ${s.visible === false ? 'hidden' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="layer-type">
                  <Icon name={s.type === 'text' ? 'text' : s.type === 'circle' ? 'circle' : 'square'} size={14} />
                </span>
                <span className="layer-name">{s.name}</span>
                <button
                  className="layer-eye"
                  title={s.visible === false ? 'Show' : 'Hide'}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleVisible(s.id)
                  }}
                >
                  <Icon name={s.visible === false ? 'eyeOff' : 'eye'} size={14} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="ed-canvas">
          <div className="canvas-toolbar">
            <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} title="Zoom out">
              <Icon name="zoomOut" size={16} />
            </button>
            <span className="zoom-val">{Math.round(zoom * 100)}%</span>
            <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} title="Zoom in">
              <Icon name="zoomIn" size={16} />
            </button>
            <button className="zoom-btn reset" onClick={() => setZoom(0.82)}>Reset</button>
          </div>

          <div className="canvas-viewport">
            <div className="zoom-layer" style={{ transform: `scale(${zoom})` }}>
              <div className="artboard-name">iPhone 14 · 480 × 720</div>
              <div
                className="artboard"
                ref={artboardRef}
                style={{ width: ART_W, height: ART_H }}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null)
                }}
              >
                {shapes.map((s) => (
                  <ShapeView
                    key={s.id}
                    shape={s}
                    selected={s.id === selectedId}
                    onPointerDown={startDrag}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="ed-panel ed-props">
          <div className="panel-h">
            <span>Design</span>
          </div>

          {selected ? (
            <div className="props">
              <label className="prop-field">
                <span>Name</span>
                <input value={selected.name} onChange={(e) => updateShape(selected.id, { name: e.target.value })} />
              </label>

              <div className="prop-grid">
                <label className="prop-mini">
                  <span>X</span>
                  <input type="number" value={selected.x} onChange={(e) => updateShape(selected.id, { x: Number(e.target.value) })} />
                </label>
                <label className="prop-mini">
                  <span>Y</span>
                  <input type="number" value={selected.y} onChange={(e) => updateShape(selected.id, { y: Number(e.target.value) })} />
                </label>
                <label className="prop-mini">
                  <span>W</span>
                  <input type="number" value={selected.w} onChange={(e) => updateShape(selected.id, { w: Number(e.target.value) })} />
                </label>
                <label className="prop-mini">
                  <span>H</span>
                  <input type="number" value={selected.h} onChange={(e) => updateShape(selected.id, { h: Number(e.target.value) })} />
                </label>
              </div>

              {selected.type === 'text' ? (
                <>
                  <label className="prop-field">
                    <span>Content</span>
                    <input value={selected.text} onChange={(e) => updateShape(selected.id, { text: e.target.value })} />
                  </label>
                  <div className="prop-color">
                    <span>Color</span>
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => updateShape(selected.id, { color: e.target.value })}
                    />
                    <code>{selected.color}</code>
                  </div>
                  <label className="prop-field">
                    <span>Font size</span>
                    <input
                      type="range"
                      min="10"
                      max="56"
                      value={selected.fontSize}
                      onChange={(e) => updateShape(selected.id, { fontSize: Number(e.target.value) })}
                    />
                    <b>{selected.fontSize}px</b>
                  </label>
                </>
              ) : (
                <>
                  <div className="prop-color">
                    <span>Fill</span>
                    <input
                      type="color"
                      value={selected.fill}
                      onChange={(e) => updateShape(selected.id, { fill: e.target.value })}
                    />
                    <code>{selected.fill}</code>
                  </div>
                  {selected.type === 'rect' && (
                    <label className="prop-field">
                      <span>Corner radius</span>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={selected.radius || 0}
                        onChange={(e) => updateShape(selected.id, { radius: Number(e.target.value) })}
                      />
                      <b>{selected.radius || 0}px</b>
                    </label>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="props-empty">
              <div className="props-empty-ico"><Icon name="drag" size={22} /></div>
              <p>Select a layer on the canvas to edit its properties.</p>
              <div className="artboard-info">
                <span>Frame</span>
                <b>480 × 720</b>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
