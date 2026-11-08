import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Editor from './pages/Editor.jsx'
import Templates from './pages/Templates.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
