'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const BREVET_DATE = new Date('2026-06-29T08:00:00')

// ─── Badge System ───
const BADGES = [
  { id: 'diamond', name: 'Diamant', emoji: '💎', min: 20, color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'gold', name: 'Or', emoji: '🥇', min: 15, color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'silver', name: 'Argent', emoji: '🥈', min: 10, color: '#64748B', bg: '#F1F5F9' },
  { id: 'bronze', name: 'Bronze', emoji: '🥉', min: 3, color: '#C2410C', bg: '#FFF7ED' },
]
function getBadge(count) {
  return BADGES.find(b => count >= b.min) || null
}
function getNextBadge(count) {
  const remaining = [...BADGES].reverse()
  return remaining.find(b => count < b.min) || null
}

// ─── XP System ───
const XP_ACTIONS = {
  complete_chapter: { xp: 50, label: 'Chapitre terminé' },
  open_pdf: { xp: 5, label: 'PDF ouvert' },
  streak_day: { xp: 20, label: 'Streak maintenu' },
  game_played: { xp: 10, label: 'Jeu terminé' },
  game_record: { xp: 25, label: 'Nouveau record' },
}
const XP_LEVELS = [
  { level: 1, name: 'Débutant', min: 0, emoji: '🌱' },
  { level: 2, name: 'Apprenti', min: 100, emoji: '📗' },
  { level: 3, name: 'Intermédiaire', min: 250, emoji: '📘' },
  { level: 4, name: 'Avancé', min: 500, emoji: '⚡' },
  { level: 5, name: 'Expert', min: 1000, emoji: '🔥' },
  { level: 6, name: 'Maître', min: 2000, emoji: '👑' },
  { level: 7, name: 'Légende', min: 3500, emoji: '🏆' },
]
function getLevel(xp) { return [...XP_LEVELS].reverse().find(l => xp >= l.min) || XP_LEVELS[0] }
function getNextLevel(xp) { return XP_LEVELS.find(l => xp < l.min) || null }

// ─── Fun Facts ───
const FUN_FACTS = [
  "Le nombre π a été calculé à plus de 100 000 milliards de décimales !",
  "Le mot « calcul » vient du latin « calculus » qui signifie... petit caillou.",
  "Un googol, c'est 10 puissance 100. C'est de là que vient le nom Google !",
  "Le symbole = a été inventé en 1557 par Robert Recorde.",
  "Il existe des nombres premiers jumeaux : 11 et 13, 17 et 19, 29 et 31...",
  "Le triangle de Pascal cache la suite de Fibonacci !",
  "Pythagore pensait que les nombres gouvernaient l'univers.",
  "Le zéro a été inventé en Inde au 7e siècle.",
  "En anglais, le théorème de Thalès s'appelle « Basic Proportionality Theorem ».",
  "La probabilité d'avoir le même anniversaire dans un groupe de 23 personnes est supérieure à 50% !",
  "Le nombre d'or (1,618...) se retrouve dans la nature : coquillages, tournesols, galaxies...",
  "Al-Khwarizmi, un savant musulman du 9e siècle, est le père de l'algèbre. Le mot « algorithme » vient de son nom !",
  "Les Babyloniens calculaient déjà √2 il y a 4000 ans avec une précision étonnante.",
  "Le symbole ÷ s'appelle un « obélus ». Il date du 17e siècle.",
  "111 111 111 × 111 111 111 = 12 345 678 987 654 321. Magique !",
  "Euler a découvert que e^(iπ) + 1 = 0, considérée comme la plus belle formule des maths.",
  "Les Égyptiens utilisaient des fractions unitaires : ils écrivaient 3/4 comme 1/2 + 1/4.",
  "Un rubik's cube peut toujours être résolu en 20 mouvements maximum.",
  "La somme des angles d'un triangle fait toujours 180°, peu importe le triangle.",
  "Le chiffre 7 est considéré comme le nombre préféré au monde dans toutes les cultures.",
]

// ─── Icons (inline SVG) ───
const IC = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  target: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pdf: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  dash: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chev: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  game: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="0.5" fill="currentColor" stroke="none"/><circle cx="17" cy="13" r="0.5" fill="currentColor" stroke="none"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  arrowLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
}

// ─── Helpers ───
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <div onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.close}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

function Toast({ message }) {
  return <div className="toast">{IC.check} {message}</div>
}

function ProgressBar({ value, max, height = 8 }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-fill" style={{ width: `${pct}%`, height: '100%' }} />
    </div>
  )
}

function Countdown() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])
  const diff = BREVET_DATE - now
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', lineHeight: 1 }}>{String(days).padStart(2, '0')}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 5 }}>jours</div>
      </div>
      <span style={{ fontSize: 30, fontWeight: 300, color: 'var(--border)', marginTop: -10 }}>:</span>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', lineHeight: 1 }}>{String(hours).padStart(2, '0')}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 5 }}>heures</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════
function LoginPage({ onLogin }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const go = async (e) => { e.preventDefault(); setErr(''); setLoading(true); await onLogin(u.trim(), p.trim(), setErr); setLoading(false) }
  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 20 }}>B</div>
          <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Brevet <span style={{ color: 'var(--accent)' }}>Booster</span></span>
        </div>
        <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 32 }}>Connecte-toi pour accéder à ta plateforme</p>
        {err && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{err}</div>}
        <form onSubmit={go}>
          <div className="form-group"><label className="form-label">Identifiant</label><input className="form-input" value={u} onChange={e => setU(e.target.value)} placeholder="Ton identifiant" /></div>
          <div className="form-group"><label className="form-label">Mot de passe</label><input className="form-input" type="password" value={p} onChange={e => setP(e.target.value)} placeholder="Ton mot de passe" /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }} disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════
function Sidebar({ items, current, setCurrent, onLogout, role, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile header bar */}
      <div className="mobile-topbar">
        <div onClick={() => setMobileOpen(true)} style={{ cursor: 'pointer', padding: 4 }}>{IC.menu}</div>
        <span style={{ fontSize: 16, fontWeight: 800 }}>Brevet <span style={{ color: 'var(--accent)' }}>Booster</span></span>
        <div style={{ width: 26 }} />
      </div>
      {/* Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      {/* Sidebar */}
      <div className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">B</div>
          <span className="sidebar-title">Brevet <span>Booster</span></span>
          <div className="sidebar-close" onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.close}</div>
        </div>
        {role && <div className={`sidebar-role ${role}`}>{role === 'admin' ? 'Administration' : 'Espace élève'}</div>}
        <nav className="sidebar-nav">
          {items.map(it => (
            <div key={it.id} className={`sidebar-item ${current === it.id ? 'active' : ''}`} onClick={() => { setCurrent(it.id); setMobileOpen(false) }}>
              {it.icon}<span>{it.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom"><button className="sidebar-logout" onClick={onLogout}>{IC.logout}<span>Déconnexion</span></button></div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════
// STUDENT: WELCOME (with badges, streak, fun facts)
// ═══════════════════════════════════════
function WelcomePage({ settings, completedIds, totalChapters, streak, xp }) {
  const pct = totalChapters > 0 ? Math.round((completedIds.length / totalChapters) * 100) : 0
  const badge = getBadge(completedIds.length)
  const [funFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])
  const level = getLevel(xp)
  const nextLevel = getNextLevel(xp)
  const xpInLevel = nextLevel ? xp - level.min : 0
  const xpForNext = nextLevel ? nextLevel.min - level.min : 1
  const diff = BREVET_DATE - new Date()
  const daysLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))

  return (
    <div>
      <h1 className="page-title">Bienvenue sur Brevet Booster</h1>
      <p className="page-subtitle">Ta plateforme de révision maths pour le brevet</p>

      {/* Fun fact - compact */}
      <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: 14, padding: '12px 18px', marginBottom: 16, border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 }}>Le savais-tu ?</div>
          <div style={{ fontSize: 13, color: '#3730A3', lineHeight: 1.4 }}>{funFact}</div>
        </div>
      </div>

      {/* XP Level - prominent */}
      <div style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #1E1B4B, #312E81)', color: 'white', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{level.emoji}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Niveau {level.level}</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{level.name}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#A5B4FC' }}>{xp}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>XP total</div>
          </div>
        </div>
        {nextLevel && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
              <span>{level.name}</span>
              <span>{nextLevel.emoji} {nextLevel.name} — {nextLevel.min} XP</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (xpInLevel / xpForNext) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #818CF8, #A5B4FC)', borderRadius: 20, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 3 }}>Encore {nextLevel.min - xp} XP</div>
          </div>
        )}
        {!nextLevel && <div style={{ fontSize: 12, color: '#A5B4FC', textAlign: 'center' }}>🏆 Niveau maximum atteint !</div>}
      </div>

      {/* 4 mini stat cards */}
      <div className="mini-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginTop: 4 }}>{completedIds.length}/{totalChapters} chapitres</div>
        </div>
        <div className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 2 }}>🔥</div>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: '#F59E0B', lineHeight: 1 }}>{streak.current_streak || 0}j</div>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginTop: 2 }}>de suite</div>
        </div>
        <div className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
          {badge ? (
            <>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{badge.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: badge.color }}>{badge.name}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, marginBottom: 2, opacity: 0.3 }}>🥉</div>
              <div style={{ fontSize: 10, color: 'var(--text-sec)' }}>Aucun badge</div>
            </>
          )}
        </div>
        <div className="card" style={{ padding: '14px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color: 'var(--text)', lineHeight: 1 }}>{daysLeft}j</div>
          <div style={{ fontSize: 10, color: 'var(--text-sec)', marginTop: 4 }}>avant brevet</div>
        </div>
      </div>

      {/* Badges compact */}
      <div className="card" style={{ padding: '12px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Badges</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[...BADGES].reverse().map(b => (
            <div key={b.id} style={{ textAlign: 'center', opacity: completedIds.length >= b.min ? 1 : 0.3 }}>
              <div style={{ fontSize: 22 }}>{b.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: completedIds.length >= b.min ? b.color : 'var(--text-sec)' }}>{b.min} ch.</div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome video - compact */}
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Présentation</h2>
        <p style={{ color: 'var(--text-sec)', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{settings.welcome_text || ''}</p>
        {settings.welcome_video && (
          <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', paddingBottom: '45%', background: '#000' }}>
            <iframe src={settings.welcome_video} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: CHAPTERS (3 PDFs + auto-eval)
// ═══════════════════════════════════════
function ChaptersPage({ parts, completedIds, toggleComplete, userId, earnXP }) {
  const [openPart, setOpenPart] = useState(parts[0]?.id || null)
  const [viewingPdf, setViewingPdf] = useState(null) // { url, title, type }
  const totalCh = parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)

  const trackPdf = async (pdfType, chapterTitle) => {
    if (!userId) return
    try { await supabase.from('pdf_clicks').insert({ user_id: userId, pdf_type: pdfType, chapter_title: chapterTitle }) } catch {}
    await earnXP(userId, 'open_pdf')
  }

  const openPdf = (url, title, type) => {
    trackPdf(type, title)
    setViewingPdf({ url, title, type })
  }

  // If viewing a PDF, show the viewer
  if (viewingPdf) {
    const typeLabels = { cours: 'Cours', exercices: 'Exercices', 'auto-eval': 'Auto-évaluation' }
    const typeColors = { cours: { bg: 'var(--accent-bg)', color: 'var(--accent)' }, exercices: { bg: 'var(--danger-bg)', color: 'var(--danger)' }, 'auto-eval': { bg: '#FEF3C7', color: '#92400E' } }
    const tc = typeColors[viewingPdf.type] || typeColors.cours
    return (
      <div>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setViewingPdf(null)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {IC.arrowLeft} Retour
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{viewingPdf.title}</div>
              <span className="badge" style={{ background: tc.bg, color: tc.color, marginTop: 4 }}>{typeLabels[viewingPdf.type]}</span>
            </div>
          </div>
          <a href={viewingPdf.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">↗ Ouvrir dans un nouvel onglet</a>
        </div>
        {/* PDF Viewer */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: '#525659' }}>
          <iframe
            src={`${viewingPdf.url}#toolbar=1&navpanes=0`}
            style={{ width: '100%', height: 'calc(100vh - 180px)', minHeight: 500, border: 'none', display: 'block' }}
            title={viewingPdf.title}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Chapitres</h1>
      <p className="page-subtitle">{totalCh} chapitres — cours, exercices et auto-évaluation</p>
      {parts.map(part => {
        const isOpen = openPart === part.id
        const chapters = part.chapters || []
        const done = chapters.filter(c => completedIds.includes(c.id)).length
        return (
          <div key={part.id} style={{ marginBottom: 14 }}>
            <div className="card" onClick={() => setOpenPart(isOpen ? null : part.id)} style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: isOpen ? 'var(--accent)' : undefined }}>
              <div className="row gap-md">
                <div style={{ fontSize: 28 }}>{part.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{part.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{part.subtitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>{done}/{chapters.length} terminés</div>
                </div>
              </div>
              <div className="row gap-md">
                <div style={{ width: 90 }}><ProgressBar value={done} max={chapters.length} height={6} /></div>
                <div style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-sec)' }}>{IC.chev}</div>
              </div>
            </div>
            {isOpen && (
              <div style={{ paddingLeft: 0, marginTop: 6 }}>
                {chapters.map((ch, i) => {
                  const isDone = completedIds.includes(ch.id)
                  const hasCours = ch.pdf_url && ch.pdf_url !== ''
                  const hasExos = ch.exercises_pdf_url && ch.exercises_pdf_url !== ''
                  const hasEval = ch.eval_pdf_url && ch.eval_pdf_url !== ''
                  return (
                    <div key={ch.id} className="card" style={{ padding: '16px 18px', marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div className={`checkbox ${isDone ? 'checked' : ''}`} onClick={() => toggleComplete(ch.id)}>{isDone && IC.check}</div>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 12, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-sec)' : 'var(--text)' }}>{ch.title}</span>
                      </div>
                      {/* 3 buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginLeft: 52 }}>
                        <button
                          onClick={() => hasCours && openPdf(ch.pdf_url, ch.title, 'cours')}
                          disabled={!hasCours}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: '1px solid var(--border)', background: hasCours ? 'var(--accent-bg)' : 'var(--bg)', color: hasCours ? 'var(--accent)' : 'var(--text-sec)', fontSize: 13, fontWeight: 600, cursor: hasCours ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.15s', opacity: hasCours ? 1 : 0.4 }}
                        >
                          📘 Cours
                        </button>
                        <button
                          onClick={() => hasExos && openPdf(ch.exercises_pdf_url, ch.title, 'exercices')}
                          disabled={!hasExos}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: '1px solid var(--border)', background: hasExos ? 'var(--danger-bg)' : 'var(--bg)', color: hasExos ? 'var(--danger)' : 'var(--text-sec)', fontSize: 13, fontWeight: 600, cursor: hasExos ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.15s', opacity: hasExos ? 1 : 0.4 }}
                        >
                          ✏️ Exercices
                        </button>
                        <button
                          onClick={() => hasEval && openPdf(ch.eval_pdf_url, ch.title, 'auto-eval')}
                          disabled={!hasEval}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 10, border: '1px solid var(--border)', background: hasEval ? '#FEF3C7' : 'var(--bg)', color: hasEval ? '#92400E' : 'var(--text-sec)', fontSize: 13, fontWeight: 600, cursor: hasEval ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all 0.15s', opacity: hasEval ? 1 : 0.4 }}
                        >
                          📝 Auto-éval
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════
// SIMULATEUR DE NOTE DU BREVET 2026
// ═══════════════════════════════════════
function BrevetSimulator() {
  const [showSim, setShowSim] = useState(false)
  const [cc, setCc] = useState('') // controle continu
  const [option, setOption] = useState('')
  const [francais, setFrancais] = useState('')
  const [maths, setMaths] = useState('')
  const [hg, setHg] = useState('')
  const [emc, setEmc] = useState('')
  const [sciences, setSciences] = useState('')
  const [oral, setOral] = useState('')

  const parse = v => { const n = parseFloat(v); return isNaN(n) ? null : Math.min(20, Math.max(0, n)) }

  const result = useMemo(() => {
    const ccVal = parse(cc)
    if (ccVal === null) return null

    // Bonus option: points above 10
    const optVal = parse(option)
    let ccFinal = ccVal
    if (optVal !== null && optVal > 10) ccFinal = Math.min(20, ccVal + (optVal - 10))

    // Epreuves finales
    const notes = [
      { val: parse(francais), coef: 2 },
      { val: parse(maths), coef: 2 },
      { val: parse(hg), coef: 1.5 },
      { val: parse(emc), coef: 0.5 },
      { val: parse(sciences), coef: 2 },
      { val: parse(oral), coef: 2 },
    ]
    const filled = notes.filter(n => n.val !== null)
    if (filled.length === 0) return { moyenne: ccFinal * 0.4, partial: true, cc: ccFinal }

    const totalCoef = filled.reduce((a, n) => a + n.coef, 0)
    const totalPoints = filled.reduce((a, n) => a + n.val * n.coef, 0)
    const epMoyenne = totalPoints / totalCoef

    const allFilled = filled.length === 6
    const moyenne = ccFinal * 0.4 + epMoyenne * 0.6

    let mention = 'Non admis'
    if (moyenne >= 18) mention = 'Très bien avec félicitations 🎉'
    else if (moyenne >= 16) mention = 'Très bien'
    else if (moyenne >= 14) mention = 'Bien'
    else if (moyenne >= 12) mention = 'Assez bien'
    else if (moyenne >= 10) mention = 'Admis'

    return { moyenne: Math.round(moyenne * 100) / 100, mention, partial: !allFilled, cc: ccFinal, ep: Math.round(epMoyenne * 100) / 100 }
  }, [cc, option, francais, maths, hg, emc, sciences, oral])

  const mentionColor = m => {
    if (!m) return 'var(--text-sec)'
    if (m.includes('félicitations')) return '#7C3AED'
    if (m.includes('Très bien')) return '#F59E0B'
    if (m === 'Bien') return 'var(--accent)'
    if (m === 'Assez bien') return 'var(--success)'
    if (m === 'Admis') return 'var(--success)'
    return 'var(--danger)'
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 15, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'monospace', background: 'var(--bg)' }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, display: 'block' }

  if (!showSim) return (
    <div onClick={() => setShowSim(true)} className="card" style={{ padding: 24, cursor: 'pointer', marginBottom: 28, borderColor: 'var(--accent)', background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,99,235,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>Simulateur de note du Brevet 2026</div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>Calcule ta moyenne estimée et découvre ta mention — Clique pour ouvrir</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="card" style={{ marginBottom: 28, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>📊</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Simulateur Brevet 2026</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Barème officiel — 40% contrôle continu + 60% épreuves</div>
          </div>
        </div>
        <div onClick={() => setShowSim(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>{IC.close}</div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Contrôle continu */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>1</span>
            Contrôle continu (40%)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Moyenne générale /20</label>
              <input type="number" step="0.1" min="0" max="20" placeholder="12.5" value={cc} onChange={e => setCc(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Option facultative /20 (bonus)</label>
              <input type="number" step="0.1" min="0" max="20" placeholder="Optionnel" value={option} onChange={e => setOption(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 6 }}>Option : seuls les points au-dessus de 10 sont ajoutés</p>
        </div>

        {/* Épreuves finales */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>2</span>
            Épreuves finales (60%)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              ['Français (coef 2)', francais, setFrancais],
              ['Maths (coef 2)', maths, setMaths],
              ['Histoire-Géo (coef 1.5)', hg, setHg],
              ['EMC (coef 0.5)', emc, setEmc],
              ['Sciences (coef 2)', sciences, setSciences],
              ['Oral (coef 2)', oral, setOral],
            ].map(([label, val, setter]) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input type="number" step="0.5" min="0" max="20" placeholder="/20" value={val} onChange={e => setter(e.target.value)} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* Résultat */}
        {result && (
          <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
            {result.partial && <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 8 }}>⚠️ Estimation partielle — remplis toutes les notes pour un résultat précis</p>}
            <div style={{ fontSize: 14, color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>Ta moyenne estimée</div>
            <div style={{ fontSize: 52, fontWeight: 900, fontFamily: 'monospace', color: result.moyenne >= 10 ? 'var(--accent)' : 'var(--danger)', lineHeight: 1 }}>{result.moyenne.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', margin: '8px 0 16px' }}>/20</div>
            {result.mention && (
              <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 25, fontSize: 15, fontWeight: 800, color: 'white', background: mentionColor(result.mention) }}>
                {result.mention}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, fontSize: 12, color: 'var(--text-sec)' }}>
              <div>Contrôle continu : <b>{result.cc?.toFixed(1)}/20</b></div>
              {result.ep !== undefined && <div>Épreuves : <b>{result.ep}/20</b></div>}
            </div>
          </div>
        )}

        {!result && (
          <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 32, textAlign: 'center', color: 'var(--text-sec)', border: '1px solid var(--border)' }}>
            Entre ta moyenne de contrôle continu pour commencer
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: PREP (with Simulator + Methodo + Fiches Memo)
// ═══════════════════════════════════════
function PrepPage({ modules }) {
  const [viewing, setViewing] = useState(null)
  const methodo = modules.filter(m => m.category !== 'memo')
  const memos = modules.filter(m => m.category === 'memo')

  const Section = ({ title, emoji, items }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{emoji}</span> {title}
      </h2>
      {items.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', padding: 40, textAlign: 'center', color: 'var(--text-sec)' }}>Bientôt disponible</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {items.map((m, i) => (
            <div key={m.id} className="chapter-card" onClick={() => setViewing(m)}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: m.category === 'memo' ? 'var(--orange-bg)' : 'var(--video-bg)', color: m.category === 'memo' ? 'var(--orange-text)' : 'var(--video-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                {m.category === 'memo' ? IC.pdf : IC.play}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{m.category === 'memo' ? 'Fiche mémo' : `Module ${i + 1}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <h1 className="page-title">Préparation Brevet</h1>
      <p className="page-subtitle">Simulateur, méthodologie, fiches mémo et conseils pour le jour J</p>
      <BrevetSimulator />
      <Section title="Méthodologie" emoji="📋" items={methodo} />
      <Section title="Fiches mémo spécial brevet" emoji="🎁" items={memos} />
      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          {viewing.video_url ? (
            <a href={viewing.video_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 15, marginBottom: 16 }}>Ouvrir le PDF</a>
          ) : (
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 60, textAlign: 'center', color: 'var(--text-sec)', marginBottom: 16, border: '1px solid var(--border)' }}>PDF bientôt disponible</div>
          )}
          <button className="btn btn-secondary" onClick={() => setViewing(null)}>Fermer</button>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: EXERCISES
// ═══════════════════════════════════════
function ExercisesPage({ exercises, favoriteIds, toggleFavorite }) {
  const [viewing, setViewing] = useState(null)
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'favorites' ? exercises.filter(ex => favoriteIds.includes(ex.id)) : exercises
  return (
    <div>
      <h1 className="page-title">Exercices type Brevet</h1>
      <p className="page-subtitle">{exercises.length} exercices corrigés en vidéo</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ id: 'all', label: `Tous (${exercises.length})` }, { id: 'favorites', label: `Favoris (${favoriteIds.length})` }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}>{f.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-sec)' }}>
          <p style={{ fontSize: 15, fontWeight: 500 }}>Aucun favori pour l&apos;instant</p>
          <p style={{ fontSize: 13 }}>Clique sur l&apos;étoile d&apos;un exercice pour l&apos;ajouter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {filtered.map(ex => (
            <div key={ex.id} className="exercise-card" onClick={() => setViewing(ex)}>
              <div style={{ height: 90, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sec)', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                {ex.image_url && ex.image_url !== '' ? <img src={ex.image_url} alt={ex.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : 'Capture de l\'énoncé'}
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 3 }}>{(ex.tags || []).join(', ')}</div>
                </div>
                <div onClick={e => { e.stopPropagation(); toggleFavorite(ex.id) }} style={{ cursor: 'pointer', flexShrink: 0 }}>
                  {favoriteIds.includes(ex.id) ? IC.starFill : IC.star}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 28, marginBottom: 20, textAlign: 'center', border: '1px solid var(--border)' }}>
            {viewing.image_url && viewing.image_url !== '' ? <img src={viewing.image_url} alt="Énoncé" style={{ maxWidth: '100%', borderRadius: 8 }} /> : <p style={{ color: 'var(--text-sec)' }}>Capture d&apos;écran de l&apos;énoncé</p>}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Correction vidéo</h3>
          {viewing.correction_url && viewing.correction_url !== '' ? (
            <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#000', marginBottom: 20 }}>
              <iframe src={viewing.correction_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
            </div>
          ) : (
            <div style={{ background: '#000', borderRadius: 12, padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Correction bientôt disponible</div>
          )}
          <div className="modal-actions">
            <button className="btn btn-sm" onClick={() => { toggleFavorite(viewing.id) }} style={{ background: 'var(--orange-bg)', color: 'var(--orange-text)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              {favoriteIds.includes(viewing.id) ? IC.starFill : IC.star} {favoriteIds.includes(viewing.id) ? 'Retirer' : 'Ajouter aux favoris'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setViewing(null)}>Fermer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: FAVORITES
// ═══════════════════════════════════════
function FavoritesPage({ exercises, favoriteIds, toggleFavorite }) {
  const favExos = exercises.filter(ex => favoriteIds.includes(ex.id))
  return (
    <div>
      <h1 className="page-title">Mes favoris</h1>
      <p className="page-subtitle">Les exercices marqués pour les retravailler</p>
      {favExos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-sec)' }}>
          <p style={{ fontSize: 15, fontWeight: 500 }}>Aucun favori</p>
          <p style={{ fontSize: 13 }}>Va dans &quot;Exos Brevet&quot; et clique sur l&apos;étoile</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favExos.map(ex => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--orange-bg)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{IC.starFill}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{ex.title}</div><div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{(ex.tags || []).join(', ')}</div></div>
              <button className="btn btn-danger btn-sm" onClick={() => toggleFavorite(ex.id)}>Retirer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN: DASHBOARD
// ═══════════════════════════════════════
function AdminDashboard({ students, parts, exercises }) {
  const totalCh = parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)
  return (
    <div>
      <h1 className="page-title">Tableau de bord</h1>
      <p className="page-subtitle">Vue d&apos;ensemble de Brevet Booster</p>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Élèves</div><div className="stat-value" style={{ color: 'var(--accent)' }}>{students.filter(s => s.active).length}</div></div>
        <div className="stat-card"><div className="stat-label">Parties</div><div className="stat-value" style={{ color: 'var(--video-text)' }}>{parts.length}</div></div>
        <div className="stat-card"><div className="stat-label">Chapitres</div><div className="stat-value" style={{ color: 'var(--success)' }}>{totalCh}</div></div>
        <div className="stat-card"><div className="stat-label">Exos brevet</div><div className="stat-value" style={{ color: 'var(--orange)' }}>{exercises.length}</div></div>
      </div>
      <div className="card">
        <div className="card-header">Élèves inscrits</div>
        {students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid var(--border)' }}>
            <div><span style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</span><span style={{ marginLeft: 12, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-sec)' }}>{s.username}</span></div>
            <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>{s.active ? 'Actif' : 'Inactif'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN: STUDENTS
// ═══════════════════════════════════════
function AdminStudents({ students, reload, showToast }) {
  const [modal, setModal] = useState(false)
  const [f, setF] = useState({ first_name: '', last_name: '', username: '', password: '' })
  const add = async () => {
    if (!f.first_name || !f.username || !f.password) return
    await supabase.from('users').insert({ ...f, role: 'student', active: true })
    setModal(false); setF({ first_name: '', last_name: '', username: '', password: '' })
    showToast('Élève ajouté !'); reload()
  }
  const toggle = async (id, active) => { await supabase.from('users').update({ active: !active }).eq('id', id); reload() }
  const del = async (id) => { await supabase.from('users').delete().eq('id', id); showToast('Supprimé'); reload() }
  return (
    <div>
      <h1 className="page-title">Gestion des élèves</h1>
      <p className="page-subtitle">Crée et gère les comptes élèves</p>
      <div className="card">
        <div className="card-header">
          <span>{students.length} élève{students.length > 1 ? 's' : ''}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>{IC.plus} Ajouter</button>
        </div>
        {students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</span>
              <span style={{ marginLeft: 12, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-sec)' }}>{s.username} / {s.password}</span>
            </div>
            <div className="row gap-sm">
              <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`} style={{ cursor: 'pointer' }} onClick={() => toggle(s.id, s.active)}>{s.active ? 'Actif' : 'Inactif'}</span>
              <button onClick={() => del(s.id)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.trash}</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title="Nouvel élève" onClose={() => setModal(false)}>
          {[['Prénom', 'first_name', 'Yasmine'], ['Nom', 'last_name', 'B.'], ['Identifiant', 'username', 'yasmine.b'], ['Mot de passe', 'password', 'brevet2026']].map(([l, k, ph]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={`Ex: ${ph}`} /></div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary btn-sm" onClick={add}>Créer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN: CONTENT
// ═══════════════════════════════════════
function AdminContent({ parts, reload, showToast }) {
  const [chModal, setChModal] = useState(null)
  const [chTitle, setChTitle] = useState('')
  const addCh = async (partId) => {
    if (!chTitle) return
    const chapters = parts.find(p => p.id === partId)?.chapters || []
    await supabase.from('chapters').insert({ part_id: partId, title: chTitle, sort_order: chapters.length + 1 })
    setChTitle(''); setChModal(null); showToast('Chapitre ajouté !'); reload()
  }
  const delCh = async (chId) => { await supabase.from('chapters').delete().eq('id', chId); showToast('Supprimé'); reload() }
  return (
    <div>
      <h1 className="page-title">Gestion du contenu</h1>
      <p className="page-subtitle">Chapitres, modules et exercices</p>
      {parts.map(part => (
        <div key={part.id} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ background: 'var(--bg)' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{part.emoji} {part.title}</span>
            <button className="btn btn-primary btn-sm" onClick={() => setChModal(part.id)}>{IC.plus} Chapitre</button>
          </div>
          {(part.chapters || []).map((ch, i) => (
            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
              <div className="row gap-sm">
                <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent-bg)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{ch.title}</span>
              </div>
              <div className="row gap-sm">
                <span className="badge badge-pdf">PDF</span>
                <button onClick={() => delCh(ch.id)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.trash}</button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {chModal && (
        <Modal title="Nouveau chapitre" onClose={() => setChModal(null)}>
          <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={chTitle} onChange={e => setChTitle(e.target.value)} placeholder="Ex: Trigonométrie" autoFocus /></div>
          <div className="modal-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setChModal(null)}>Annuler</button>
            <button className="btn btn-primary btn-sm" onClick={() => addCh(chModal)}>Ajouter</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: GAMES
// ═══════════════════════════════════════
function GameTimer({ timeLeft, total }) {
  const pct = total > 0 ? (timeLeft / total) * 100 : 0
  const color = timeLeft > 20 ? 'var(--success)' : timeLeft > 10 ? 'var(--orange)' : 'var(--danger)'
  return (
    <div style={{ width: '100%', background: 'var(--border)', borderRadius: 20, height: 12, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 20, transition: 'width 1s linear' }} />
    </div>
  )
}

function MultiplicationGame({ userId, onBack }) {
  const [state, setState] = useState('ready') // ready, playing, done
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [question, setQuestion] = useState(null)
  const [input, setInput] = useState('')
  const [record, setRecord] = useState(0)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const { data } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', 'multiplication').single()
        if (data) setRecord(data.best_score)
      } catch {}
    }
    loadRecord()
  }, [userId])

  const newQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 2
    const b = Math.floor(Math.random() * 10) + 2
    setQuestion({ a, b, answer: a * b })
    setInput('')
    setFeedback(null)
  }

  const start = () => {
    setState('playing')
    setScore(0)
    setTimeLeft(60)
    newQuestion()
  }

  useEffect(() => {
    if (state !== 'playing') return
    if (timeLeft <= 0) {
      setState('done')
      const saveRecord = async () => {
        try {
          const { data: existing } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', 'multiplication').single()
          if (existing) {
            if (score > existing.best_score) await supabase.from('game_records').update({ best_score: score, last_played: new Date().toISOString() }).eq('user_id', userId).eq('game_type', 'multiplication')
          } else {
            await supabase.from('game_records').insert({ user_id: userId, game_type: 'multiplication', best_score: score })
          }
          if (score > record) setRecord(score)
        } catch {}
      }
      saveRecord()
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, state, score, userId, record])

  const checkAnswer = () => {
    if (!input || !question) return
    const num = parseInt(input, 10)
    if (num === question.answer) {
      setScore(prev => prev + 1)
      setFeedback('correct')
      setTimeout(() => newQuestion(), 300)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 500)
      setInput('')
    }
  }

  if (state === 'ready') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>✖️</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Tables de multiplication</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 8 }}>60 secondes pour répondre à un maximum de multiplications !</p>
      {record > 0 && <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🏆 Ton record : {record} bonnes réponses</p>}
      <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 16, borderRadius: 14 }} onClick={start}>C&apos;est parti !</button>
      <div style={{ marginTop: 16 }}><button className="btn btn-secondary btn-sm" onClick={onBack}>Retour</button></div>
    </div>
  )

  if (state === 'done') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>{score > record ? '🎉' : '⏱️'}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Temps écoulé !</h2>
      <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', marginBottom: 8 }}>{score}</div>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 4 }}>bonnes réponses</p>
      {score > record && <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🎉 Nouveau record !</p>}
      {score <= record && record > 0 && <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 16 }}>Record à battre : {record}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={start}>Rejouer</button>
        <button className="btn btn-secondary" onClick={onBack}>Retour</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sec)' }}>Score : <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 800 }}>{score}</span></div>
        <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text)' }}>{timeLeft}s</div>
      </div>
      <GameTimer timeLeft={timeLeft} total={60} />
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: 'var(--text)', marginBottom: 24 }}>
          {question?.a} × {question?.b} = ?
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="number" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            autoFocus
            style={{
              width: 120, padding: '14px 20px', fontSize: 24, fontWeight: 800, textAlign: 'center',
              borderRadius: 14, border: `3px solid ${feedback === 'correct' ? 'var(--success)' : feedback === 'wrong' ? 'var(--danger)' : 'var(--border)'}`,
              background: feedback === 'correct' ? 'var(--success-bg)' : feedback === 'wrong' ? 'var(--danger-bg)' : 'white',
              outline: 'none', fontFamily: 'monospace', transition: 'all 0.2s',
            }}
          />
          <button className="btn btn-primary" style={{ padding: '14px 24px', fontSize: 16 }} onClick={checkAnswer}>OK</button>
        </div>
      </div>
    </div>
  )
}

function CalculMentalGame({ userId, onBack }) {
  const [state, setState] = useState('ready')
  const [difficulty, setDifficulty] = useState('facile')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [question, setQuestion] = useState(null)
  const [input, setInput] = useState('')
  const [record, setRecord] = useState(0)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    const loadRecord = async () => {
      try {
        const { data } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', 'calcul_' + difficulty).single()
        if (data) setRecord(data.best_score)
      } catch {}
    }
    loadRecord()
  }, [userId, difficulty])

  const newQuestion = useCallback(() => {
    let a, b, op, answer
    const ops = ['+', '-', '×']
    op = ops[Math.floor(Math.random() * ops.length)]
    if (difficulty === 'facile') {
      a = Math.floor(Math.random() * 20) + 1
      b = Math.floor(Math.random() * 20) + 1
      if (op === '×') { a = Math.floor(Math.random() * 10) + 2; b = Math.floor(Math.random() * 10) + 2 }
    } else if (difficulty === 'moyen') {
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * 50) + 10
      if (op === '×') { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2 }
    } else {
      a = Math.floor(Math.random() * 100) + 20
      b = Math.floor(Math.random() * 100) + 20
      if (op === '×') { a = Math.floor(Math.random() * 15) + 5; b = Math.floor(Math.random() * 15) + 5 }
    }
    if (op === '-' && a < b) { const tmp = a; a = b; b = tmp }
    answer = op === '+' ? a + b : op === '-' ? a - b : a * b
    setQuestion({ a, b, op, answer })
    setInput('')
    setFeedback(null)
  }, [difficulty])

  const start = () => {
    setState('playing')
    setScore(0)
    setTimeLeft(60)
    newQuestion()
  }

  useEffect(() => {
    if (state !== 'playing') return
    if (timeLeft <= 0) {
      setState('done')
      const gameType = 'calcul_' + difficulty
      const saveRecord = async () => {
        try {
          const { data: existing } = await supabase.from('game_records').select('best_score').eq('user_id', userId).eq('game_type', gameType).single()
          if (existing) {
            if (score > existing.best_score) await supabase.from('game_records').update({ best_score: score, last_played: new Date().toISOString() }).eq('user_id', userId).eq('game_type', gameType)
          } else {
            await supabase.from('game_records').insert({ user_id: userId, game_type: gameType, best_score: score })
          }
          if (score > record) setRecord(score)
        } catch {}
      }
      saveRecord()
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, state, score, userId, record, difficulty])

  const checkAnswer = () => {
    if (!input || !question) return
    const num = parseInt(input, 10)
    if (num === question.answer) {
      setScore(prev => prev + 1)
      setFeedback('correct')
      setTimeout(() => newQuestion(), 300)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 500)
      setInput('')
    }
  }

  if (state === 'ready') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🧮</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Calcul mental</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 20 }}>60 secondes — additions, soustractions et multiplications !</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {[['facile', '😊 Facile'], ['moyen', '💪 Moyen'], ['difficile', '🔥 Difficile']].map(([d, label]) => (
          <button key={d} onClick={() => setDifficulty(d)} className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-secondary'}`}>{label}</button>
        ))}
      </div>
      {record > 0 && <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>🏆 Record ({difficulty}) : {record}</p>}
      <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: 16, borderRadius: 14 }} onClick={start}>C&apos;est parti !</button>
      <div style={{ marginTop: 16 }}><button className="btn btn-secondary btn-sm" onClick={onBack}>Retour</button></div>
    </div>
  )

  if (state === 'done') return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>{score > record ? '🎉' : '⏱️'}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Temps écoulé !</h2>
      <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: 'var(--accent)', marginBottom: 8 }}>{score}</div>
      <p style={{ color: 'var(--text-sec)', fontSize: 14, marginBottom: 4 }}>bonnes réponses ({difficulty})</p>
      {score > record && <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🎉 Nouveau record !</p>}
      {score <= record && record > 0 && <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 16 }}>Record à battre : {record}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={start}>Rejouer</button>
        <button className="btn btn-secondary" onClick={onBack}>Retour</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sec)' }}>Score : <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 800 }}>{score}</span></div>
        <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text)' }}>{timeLeft}s</div>
      </div>
      <GameTimer timeLeft={timeLeft} total={60} />
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: 'var(--text)', marginBottom: 24 }}>
          {question?.a} {question?.op} {question?.b} = ?
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="number" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            autoFocus
            style={{
              width: 140, padding: '14px 20px', fontSize: 24, fontWeight: 800, textAlign: 'center',
              borderRadius: 14, border: `3px solid ${feedback === 'correct' ? 'var(--success)' : feedback === 'wrong' ? 'var(--danger)' : 'var(--border)'}`,
              background: feedback === 'correct' ? 'var(--success-bg)' : feedback === 'wrong' ? 'var(--danger-bg)' : 'white',
              outline: 'none', fontFamily: 'monospace', transition: 'all 0.2s',
            }}
          />
          <button className="btn btn-primary" style={{ padding: '14px 24px', fontSize: 16 }} onClick={checkAnswer}>OK</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: ASSIGNMENTS (Mes devoirs)
// ═══════════════════════════════════════
function AssignmentsPage({ userId, earnXP }) {
  const [assignments, setAssignments] = useState([])
  const [assignedIds, setAssignedIds] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [uploading, setUploading] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: a } = await supabase.from('assignments').select('*').order('created_at', { ascending: false })
      const { data: as } = await supabase.from('assignment_students').select('assignment_id').eq('user_id', userId)
      const { data: s } = await supabase.from('submissions').select('*').eq('user_id', userId)
      // Get all assignment IDs that have ANY student assignments
      const { data: allAs } = await supabase.from('assignment_students').select('assignment_id')
      const assignedToSpecific = [...new Set((allAs || []).map(x => x.assignment_id))]
      const myAssigned = (as || []).map(x => x.assignment_id)
      // Show: assignments assigned to me OR assignments not assigned to anyone specific (= for all)
      const visible = (a || []).filter(assignment => {
        const hasSpecific = assignedToSpecific.includes(assignment.id)
        if (!hasSpecific) return true // assigned to all
        return myAssigned.includes(assignment.id) // assigned specifically to me
      })
      setAssignments(visible)
      setAssignedIds(myAssigned)
      setSubmissions(s || [])
      setLoading(false)
    }
    load()
  }, [userId])

  const getSubmission = (assignmentId) => submissions.find(s => s.assignment_id === assignmentId)

  const isOverdue = (a) => {
    if (!a.due_date) return false
    return new Date(a.due_date) < new Date() && !getSubmission(a.id)
  }

  const handleUpload = async (assignmentId, file) => {
    if (!file) return
    setUploading(assignmentId)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${assignmentId}_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('submissions').upload(path, file, { upsert: true })
      if (uploadErr) { alert('Erreur upload : ' + uploadErr.message); setUploading(null); return }
      const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path)
      await supabase.from('submissions').upsert({ assignment_id: assignmentId, user_id: userId, image_url: urlData.publicUrl, submitted_at: new Date().toISOString(), corrected: false })
      const { data: s } = await supabase.from('submissions').select('*').eq('user_id', userId)
      setSubmissions(s || [])
      await earnXP(userId, 'open_pdf')
    } catch (err) { alert('Erreur : ' + err.message) }
    setUploading(null)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-sec)' }}>Chargement...</div>

  return (
    <div>
      <h1 className="page-title">Mes devoirs</h1>
      <p className="page-subtitle">Prends en photo ta copie et envoie-la</p>
      {assignments.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-sec)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Aucun devoir pour l&apos;instant</p>
          <p style={{ fontSize: 13 }}>Ton prof n&apos;a pas encore donné de devoir</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map(a => {
            const sub = getSubmission(a.id)
            const isUploading = uploading === a.id
            const overdue = isOverdue(a)
            return (
              <div key={a.id} className="card" style={{ padding: 20, borderColor: overdue ? 'var(--danger)' : undefined }}>
                {/* Status badge */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {!sub && !overdue && <span className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>🔴 À rendre</span>}
                  {!sub && overdue && <span className="badge badge-danger">⚠️ En retard</span>}
                  {sub && !sub.corrected && <span className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>🟡 En attente de correction</span>}
                  {sub && sub.corrected && <span className="badge badge-success">🟢 Corrigé — {sub.score}/20</span>}
                  {a.due_date && <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-sec)' }}>📅 {new Date(a.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{a.title}</h3>
                    {a.description && <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5, marginBottom: 8 }}>{a.description}</p>}
                    {/* Attached image from prof */}
                    {a.image_url && a.image_url !== '' && (
                      <a href={a.image_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>📎 Voir l&apos;énoncé joint</a>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>Donné le {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 140 }}>
                    {!sub ? (
                      <div>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 12, background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                          📷 {isUploading ? 'Envoi...' : 'Envoyer ma copie'}
                          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleUpload(a.id, e.target.files[0])} disabled={isUploading} />
                        </label>
                      </div>
                    ) : (
                      <div>
                        {sub.corrected && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: sub.score >= 10 ? 'var(--success)' : 'var(--danger)' }}>{sub.score}/20</div>
                            {sub.feedback && <p style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4, lineHeight: 1.4 }}>{sub.feedback}</p>}
                          </div>
                        )}
                        <a href={sub.image_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)' }}>Voir ma copie</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN: ASSIGNMENTS (enhanced)
// ═══════════════════════════════════════
function AdminAssignments({ students }) {
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [assignStudents, setAssignStudents] = useState({})
  const [modal, setModal] = useState(false)
  const [corrModal, setCorrModal] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [imgFile, setImgFile] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [assignAll, setAssignAll] = useState(true)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const { data: a } = await supabase.from('assignments').select('*').order('created_at', { ascending: false })
    const { data: s } = await supabase.from('submissions').select('*')
    const { data: as } = await supabase.from('assignment_students').select('*')
    setAssignments(a || [])
    setSubmissions(s || [])
    const asMap = {}
    ;(as || []).forEach(x => { if (!asMap[x.assignment_id]) asMap[x.assignment_id] = []; asMap[x.assignment_id].push(x.user_id) })
    setAssignStudents(asMap)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const addAssignment = async () => {
    if (!title) return
    setCreating(true)
    let imageUrl = ''
    // Upload image if provided
    if (imgFile) {
      const ext = imgFile.name.split('.').pop()
      const path = `enonces/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('submissions').upload(path, imgFile)
      if (!error) {
        const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }
    const { data: newA } = await supabase.from('assignments').insert({ title, description: desc, due_date: dueDate || null, image_url: imageUrl }).select().single()
    // Assign to specific students if not all
    if (!assignAll && selectedStudents.length > 0 && newA) {
      const rows = selectedStudents.map(uid => ({ assignment_id: newA.id, user_id: uid }))
      await supabase.from('assignment_students').insert(rows)
    }
    setTitle(''); setDesc(''); setDueDate(''); setImgFile(null); setSelectedStudents([]); setAssignAll(true); setModal(false); setCreating(false); load()
  }

  const delAssignment = async (id) => { await supabase.from('assignments').delete().eq('id', id); load() }

  const correctSubmission = async () => {
    if (!corrModal) return
    await supabase.from('submissions').update({ score: parseFloat(score), feedback, corrected: true }).eq('id', corrModal.id)
    setCorrModal(null); setScore(''); setFeedback(''); load()
  }

  const getStudent = (userId) => students.find(s => s.id === userId)
  const toggleStudent = (uid) => setSelectedStudents(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid])

  const getAssignedStudents = (assignmentId) => {
    const specific = assignStudents[assignmentId]
    if (!specific || specific.length === 0) return students.filter(s => s.active) // all
    return students.filter(s => specific.includes(s.id))
  }

  const isOverdue = (a, sub) => {
    if (!a.due_date) return false
    return new Date(a.due_date) < new Date() && !sub
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-sec)' }}>Chargement...</div>

  return (
    <div>
      <h1 className="page-title">Gestion des devoirs</h1>
      <p className="page-subtitle">Crée des devoirs, assigne-les et corrige les rendus</p>
      <button className="btn btn-primary" onClick={() => setModal(true)} style={{ marginBottom: 20 }}>{IC.plus} Nouveau devoir</button>

      {assignments.map(a => {
        const targeted = getAssignedStudents(a.id)
        const isForAll = !assignStudents[a.id] || assignStudents[a.id].length === 0
        const subs = submissions.filter(s => s.assignment_id === a.id)
        const subUserIds = subs.map(s => s.user_id)
        const notRendered = targeted.filter(s => !subUserIds.includes(s.id))

        return (
          <div key={a.id} className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>
                  {isForAll ? '👥 Tous les élèves' : `👤 ${targeted.map(s => s.first_name).join(', ')}`}
                  {a.due_date && <span style={{ marginLeft: 8 }}>📅 {new Date(a.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>}
                </div>
              </div>
              <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
                {a.image_url && a.image_url !== '' && <a href={a.image_url} target="_blank" rel="noreferrer" className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', textDecoration: 'none' }}>📎 Énoncé</a>}
                <span className="badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{subs.length}/{targeted.length} rendu{subs.length > 1 ? 's' : ''}</span>
                <button onClick={() => delAssignment(a.id)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-sec)' }}>{IC.trash}</button>
              </div>
            </div>

            {/* Students who submitted */}
            {subs.map(sub => {
              const st = getStudent(sub.user_id)
              return (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                    <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>✅</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{st ? `${st.first_name} ${st.last_name}` : 'Élève'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-sec)' }}>{new Date(sub.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
                    <a href={sub.image_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📷 Voir</a>
                    {sub.corrected ? (
                      <span className="badge badge-success" style={{ fontSize: 14, fontWeight: 800 }}>{sub.score}/20</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => { setCorrModal(sub); setScore(''); setFeedback('') }}>Corriger</button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Students who haven't submitted */}
            {notRendered.map(st => {
              const overdue = isOverdue(a, false)
              return (
                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: overdue ? '#FEF2F2' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge" style={{ background: overdue ? 'var(--danger-bg)' : 'var(--bg)', color: overdue ? 'var(--danger)' : 'var(--text-sec)', fontSize: 10, padding: '2px 6px' }}>{overdue ? '⚠️' : '⏳'}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: overdue ? 'var(--danger)' : 'var(--text)' }}>{st.first_name} {st.last_name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: overdue ? 'var(--danger)' : 'var(--text-sec)', fontWeight: overdue ? 700 : 400 }}>{overdue ? 'En retard' : 'Pas encore rendu'}</span>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Create modal */}
      {modal && (
        <Modal title="Nouveau devoir" onClose={() => setModal(false)}>
          <div className="form-group"><label className="form-label">Titre *</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Devoir n°3 — Pythagore" autoFocus /></div>
          <div className="form-group"><label className="form-label">Consigne</label><input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Exercices 1 à 4 page 12" /></div>
          <div className="form-group"><label className="form-label">Date limite (optionnel)</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Joindre un énoncé (photo/image)</label>
            <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} style={{ fontSize: 13 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Assigner à</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button className={`btn btn-sm ${assignAll ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setAssignAll(true); setSelectedStudents([]) }}>Tous les élèves</button>
              <button className={`btn btn-sm ${!assignAll ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAssignAll(false)}>Choisir</button>
            </div>
            {!assignAll && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, maxHeight: 200, overflowY: 'auto' }}>
                {students.filter(s => s.active).map(s => (
                  <div key={s.id} onClick={() => toggleStudent(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selectedStudents.includes(s.id) ? 'var(--accent-bg)' : 'white' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: selectedStudents.includes(s.id) ? 'none' : '2px solid var(--border)', background: selectedStudents.includes(s.id) ? 'var(--accent)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedStudents.includes(s.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-actions"><button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={addAssignment} disabled={creating}>{creating ? 'Création...' : 'Créer'}</button></div>
        </Modal>
      )}

      {/* Correct modal */}
      {corrModal && (
        <Modal title="Corriger le devoir" onClose={() => setCorrModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <a href={corrModal.image_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>📷 Voir la copie de l&apos;élève</a>
          </div>
          <div className="form-group"><label className="form-label">Note /20</label><input className="form-input" type="number" step="0.5" min="0" max="20" value={score} onChange={e => setScore(e.target.value)} placeholder="15" /></div>
          <div className="form-group"><label className="form-label">Commentaire</label><input className="form-input" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Ex: Bon travail, attention aux signes" /></div>
          <div className="modal-actions"><button className="btn btn-secondary btn-sm" onClick={() => setCorrModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={correctSubmission}>Valider</button></div>
        </Modal>
      )}
    </div>
  )
}

function GamesPage({ userId, earnXP }) {
  const [activeGame, setActiveGame] = useState(null)
  const [records, setRecords] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('game_records').select('game_type, best_score').eq('user_id', userId)
        const map = {}
        ;(data || []).forEach(r => { map[r.game_type] = r.best_score })
        setRecords(map)
      } catch {}
    }
    load()
  }, [userId, activeGame])

  if (activeGame === 'multiplication') return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <MultiplicationGame userId={userId} onBack={() => setActiveGame(null)} earnXP={earnXP} />
    </div>
  )

  if (activeGame === 'calcul') return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <CalculMentalGame userId={userId} onBack={() => setActiveGame(null)} />
    </div>
  )

  const games = [
    { id: 'multiplication', emoji: '✖️', title: 'Tables de multiplication', desc: '60 secondes pour répondre à un max de multiplications', color: '#7C3AED', bg: '#EDE9FE', record: records.multiplication },
    { id: 'calcul', emoji: '🧮', title: 'Calcul mental', desc: 'Additions, soustractions, multiplications — 3 niveaux', color: '#2563EB', bg: '#DBEAFE', record: Math.max(records.calcul_facile || 0, records.calcul_moyen || 0, records.calcul_difficile || 0) },
  ]

  return (
    <div>
      <h1 className="page-title">Jeux</h1>
      <p className="page-subtitle">Entraîne-toi en t&apos;amusant et bats tes records !</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {games.map(g => (
          <div key={g.id} className="card" onClick={() => setActiveGame(g.id)} style={{ padding: 28, cursor: 'pointer', transition: 'all 0.2s', borderColor: 'var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>{g.emoji}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{g.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 12, lineHeight: 1.5 }}>{g.desc}</p>
            {g.record > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700 }}>
                🏆 Record : {g.record}
              </div>
            )}
            {!g.record && (
              <div style={{ fontSize: 13, color: 'var(--text-sec)', fontStyle: 'italic' }}>Pas encore de record — lance-toi !</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// ADMIN: PROGRESSION DASHBOARD
// ═══════════════════════════════════════
function AdminProgression({ students, parts }) {
  const [progressData, setProgressData] = useState({})
  const [streakData, setStreakData] = useState({})
  const [pdfData, setPdfData] = useState({})
  const [xpData, setXpData] = useState({})
  const totalCh = parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)

  useEffect(() => {
    const load = async () => {
      const { data: progress } = await supabase.from('student_progress').select('user_id, chapter_id')
      const { data: streaks } = await supabase.from('student_streaks').select('*')
      const { data: pdfClicks } = await supabase.from('pdf_clicks').select('user_id')
      const { data: xpRecords } = await supabase.from('student_xp').select('user_id, total_xp, level')
      const grouped = {}
      ;(progress || []).forEach(p => {
        if (!grouped[p.user_id]) grouped[p.user_id] = []
        grouped[p.user_id].push(p.chapter_id)
      })
      setProgressData(grouped)
      const streakMap = {}
      ;(streaks || []).forEach(s => { streakMap[s.user_id] = s })
      setStreakData(streakMap)
      const pdfMap = {}
      ;(pdfClicks || []).forEach(c => { pdfMap[c.user_id] = (pdfMap[c.user_id] || 0) + 1 })
      setPdfData(pdfMap)
      const xpMap = {}
      ;(xpRecords || []).forEach(x => { xpMap[x.user_id] = x })
      setXpData(xpMap)
    }
    load()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getDaysInactive = (streak) => {
    if (!streak?.last_login) return null
    const last = new Date(streak.last_login)
    const now = new Date()
    return Math.floor((now - last) / (1000 * 60 * 60 * 24))
  }

  return (
    <div>
      <h1 className="page-title">Progression des élèves</h1>
      <p className="page-subtitle">Suivi en temps réel — connexions, PDF et avancement</p>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Élève</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Progression</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dernière connexion</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Connexions</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>PDF ouverts</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Streak</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-sec)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Badge</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const done = (progressData[s.id] || []).length
              const pct = totalCh > 0 ? Math.round((done / totalCh) * 100) : 0
              const badge = getBadge(done)
              const streak = streakData[s.id]
              const pdfCount = pdfData[s.id] || 0
              const daysInactive = getDaysInactive(streak)
              const isInactive = daysInactive !== null && daysInactive >= 3

              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: isInactive ? '#FEF2F2' : 'white' }}>
                  {/* Élève */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', fontFamily: 'monospace' }}>{s.username}</div>
                    {isInactive && <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700, marginTop: 3 }}>⚠️ Inactif depuis {daysInactive}j</div>}
                  </td>
                  {/* Progression */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'monospace', color: pct >= 75 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--text-sec)' }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{done}/{totalCh}</div>
                    <div style={{ width: 80, margin: '4px auto 0' }}><ProgressBar value={done} max={totalCh} height={4} /></div>
                  </td>
                  {/* Dernière connexion */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, color: isInactive ? 'var(--danger)' : 'var(--text)' }}>{formatDate(streak?.last_login_time || streak?.last_login)}</div>
                    {streak?.last_login_time && <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{formatTime(streak.last_login_time)}</div>}
                  </td>
                  {/* Total connexions */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'monospace', color: 'var(--accent)' }}>{streak?.total_logins || 0}</div>
                  </td>
                  {/* PDF ouverts */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'monospace', color: pdfCount > 0 ? 'var(--success)' : 'var(--text-sec)' }}>{pdfCount}</div>
                  </td>
                  {/* Streak */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {streak && streak.current_streak > 0 ? (
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>🔥 {streak.current_streak}j</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>—</span>
                    )}
                  </td>
                  {/* Badge */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {badge ? <span style={{ fontSize: 22 }}>{badge.emoji}</span> : <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function Home() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('welcome')
  const [toast, setToast] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [students, setStudents] = useState([])
  const [parts, setParts] = useState([])
  const [modules, setModules] = useState([])
  const [exercises, setExercises] = useState([])
  const [settings, setSettings] = useState({})
  const [completedIds, setCompletedIds] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [streak, setStreak] = useState({})
  const [xp, setXp] = useState(0)
  const [xpPopup, setXpPopup] = useState(null)

  const showToast = useCallback(m => { setToast(m); setTimeout(() => setToast(null), 2500) }, [])
  const totalChapters = useMemo(() => parts.reduce((a, p) => a + (p.chapters?.length || 0), 0), [parts])

  // XP system
  const earnXP = useCallback(async (userId, actionKey) => {
    const action = XP_ACTIONS[actionKey]
    if (!action || !userId) return
    try {
      // Log to history
      await supabase.from('xp_history').insert({ user_id: userId, action: actionKey, xp_earned: action.xp })
      // Update total
      const { data: existing } = await supabase.from('student_xp').select('*').eq('user_id', userId).single()
      const newTotal = (existing?.total_xp || 0) + action.xp
      const newLevel = getLevel(newTotal).level
      if (existing) {
        await supabase.from('student_xp').update({ total_xp: newTotal, level: newLevel }).eq('user_id', userId)
      } else {
        await supabase.from('student_xp').insert({ user_id: userId, total_xp: newTotal, level: newLevel })
      }
      setXp(newTotal)
      // Show XP popup
      setXpPopup({ xp: action.xp, label: action.label })
      setTimeout(() => setXpPopup(null), 2000)
    } catch {}
  }, [])

  const loadData = useCallback(async () => {
    const [studentsRes, partsRes, chaptersRes, modulesRes, exercisesRes, settingsRes] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'student').order('created_at'),
      supabase.from('parts').select('*').order('sort_order'),
      supabase.from('chapters').select('*').order('sort_order'),
      supabase.from('prep_modules').select('*').order('sort_order'),
      supabase.from('exercises').select('*').order('sort_order'),
      supabase.from('settings').select('*'),
    ])
    setStudents(studentsRes.data || [])
    setModules(modulesRes.data || [])
    setExercises(exercisesRes.data || [])
    const settingsMap = {}
    ;(settingsRes.data || []).forEach(s => { settingsMap[s.key] = s.value })
    setSettings(settingsMap)
    const allChapters = chaptersRes.data || []
    const partsWithChapters = (partsRes.data || []).map(p => ({ ...p, chapters: allChapters.filter(c => c.part_id === p.id) }))
    setParts(partsWithChapters)
    setLoading(false)
  }, [])

  const loadStudentData = useCallback(async (userId) => {
    const [progRes, favRes] = await Promise.all([
      supabase.from('student_progress').select('chapter_id').eq('user_id', userId),
      supabase.from('student_favorites').select('exercise_id').eq('user_id', userId),
    ])
    setCompletedIds((progRes.data || []).map(r => r.chapter_id))
    setFavoriteIds((favRes.data || []).map(r => r.exercise_id))
  }, [])

  // Update streak on login
  const updateStreak = useCallback(async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    const nowISO = new Date().toISOString()
    const { data: existing } = await supabase.from('student_streaks').select('*').eq('user_id', userId).single()
    if (existing) {
      const lastLogin = existing.last_login
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      let newStreak = existing.current_streak
      if (lastLogin === today) {
        // Already logged in today, just update time
        await supabase.from('student_streaks').update({ last_login_time: nowISO }).eq('user_id', userId)
        setStreak(existing); return
      } else if (lastLogin === yesterday) {
        newStreak = existing.current_streak + 1
      } else {
        newStreak = 1
      }
      const bestStreak = Math.max(newStreak, existing.best_streak || 0)
      const totalLogins = (existing.total_logins || 0) + 1
      await supabase.from('student_streaks').update({ current_streak: newStreak, last_login: today, best_streak: bestStreak, total_logins: totalLogins, last_login_time: nowISO }).eq('user_id', userId)
      setStreak({ current_streak: newStreak, last_login: today, best_streak: bestStreak, total_logins: totalLogins })
      // Award streak XP
      if (newStreak > 1) {
        try { await supabase.from('xp_history').insert({ user_id: userId, action: 'streak_day', xp_earned: 20 }); const { data: xpData } = await supabase.from('student_xp').select('total_xp').eq('user_id', userId).single(); const nt = (xpData?.total_xp || 0) + 20; await supabase.from('student_xp').upsert({ user_id: userId, total_xp: nt, level: getLevel(nt).level }) } catch {}
      }
    } else {
      await supabase.from('student_streaks').insert({ user_id: userId, current_streak: 1, last_login: today, best_streak: 1, total_logins: 1, last_login_time: nowISO })
      setStreak({ current_streak: 1, last_login: today, best_streak: 1, total_logins: 1 })
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const login = async (username, password, setErr) => {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single()
    if (error || !data) { setErr('Identifiant ou mot de passe incorrect'); return }
    if (!data.active && data.role !== 'admin') { setErr('Ton compte est désactivé, contacte ton prof'); return }
    setUser(data)
    if (data.role === 'admin') { setPage('admin-dash') }
    else { setPage('welcome'); await loadStudentData(data.id); await updateStreak(data.id); await loadXP(data.id) }
  }

  const loadXP = async (userId) => {
    try {
      const { data } = await supabase.from('student_xp').select('total_xp').eq('user_id', userId).single()
      if (data) setXp(data.total_xp)
    } catch {}
  }

  const toggleComplete = async (chapterId) => {
    if (!user) return
    if (completedIds.includes(chapterId)) {
      await supabase.from('student_progress').delete().eq('user_id', user.id).eq('chapter_id', chapterId)
      setCompletedIds(prev => prev.filter(id => id !== chapterId))
    } else {
      await supabase.from('student_progress').insert({ user_id: user.id, chapter_id: chapterId })
      setCompletedIds(prev => [...prev, chapterId])
      await earnXP(user.id, 'complete_chapter')
    }
  }

  const toggleFavorite = async (exerciseId) => {
    if (!user) return
    if (favoriteIds.includes(exerciseId)) {
      await supabase.from('student_favorites').delete().eq('user_id', user.id).eq('exercise_id', exerciseId)
      setFavoriteIds(prev => prev.filter(id => id !== exerciseId))
    } else {
      await supabase.from('student_favorites').insert({ user_id: user.id, exercise_id: exerciseId })
      setFavoriteIds(prev => [...prev, exerciseId])
    }
  }

  const logout = () => { setUser(null); setPage('welcome'); setCompletedIds([]); setFavoriteIds([]); setStreak({}) }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-sec)' }}>Chargement...</div>
  if (!user) return <LoginPage onLogin={login} />

  const isAdmin = user.role === 'admin'
  const studentNav = [
    { id: 'welcome', label: 'Bienvenue', icon: IC.home },
    { id: 'chapters', label: 'Chapitres', icon: IC.book },
    { id: 'prep', label: 'Prépa Brevet', icon: IC.target },
    { id: 'exercises', label: 'Exos Brevet', icon: IC.edit },
    { id: 'favorites', label: 'Mes favoris', icon: IC.star },
    { id: 'assignments', label: 'Mes devoirs', icon: IC.pdf },
    { id: 'games', label: 'Jeux', icon: IC.game },
  ]
  const adminNav = [
    { id: 'admin-dash', label: 'Tableau de bord', icon: IC.dash },
    { id: 'admin-students', label: 'Élèves', icon: IC.users },
    { id: 'admin-content', label: 'Contenu', icon: IC.book },
    { id: 'admin-progress', label: 'Progression', icon: IC.chart },
    { id: 'admin-assignments', label: 'Devoirs', icon: IC.edit },
  ]

  return (
    <div className="app-layout">
      <Sidebar items={isAdmin ? adminNav : studentNav} current={page} setCurrent={setPage} onLogout={logout} role={user.role} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-content">
        {!isAdmin && page === 'welcome' && <WelcomePage settings={settings} completedIds={completedIds} totalChapters={totalChapters} streak={streak} xp={xp} />}
        {!isAdmin && page === 'chapters' && <ChaptersPage parts={parts} completedIds={completedIds} toggleComplete={toggleComplete} userId={user.id} earnXP={earnXP} />}
        {!isAdmin && page === 'prep' && <PrepPage modules={modules} />}
        {!isAdmin && page === 'exercises' && <ExercisesPage exercises={exercises} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
        {!isAdmin && page === 'favorites' && <FavoritesPage exercises={exercises} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
        {!isAdmin && page === 'assignments' && <AssignmentsPage userId={user.id} earnXP={earnXP} />}
        {!isAdmin && page === 'games' && <GamesPage userId={user.id} earnXP={earnXP} />}
        {isAdmin && page === 'admin-dash' && <AdminDashboard students={students} parts={parts} exercises={exercises} />}
        {isAdmin && page === 'admin-students' && <AdminStudents students={students} reload={loadData} showToast={showToast} />}
        {isAdmin && page === 'admin-content' && <AdminContent parts={parts} reload={loadData} showToast={showToast} />}
        {isAdmin && page === 'admin-progress' && <AdminProgression students={students} parts={parts} />}
        {isAdmin && page === 'admin-assignments' && <AdminAssignments students={students} />}
      </div>
      {toast && <Toast message={toast} />}
      {xpPopup && <div style={{ position: 'fixed', top: 80, right: 24, background: 'linear-gradient(135deg, #312E81, #1E1B4B)', color: '#A5B4FC', padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 800, zIndex: 300, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'toastIn 0.3s ease' }}>⚡ +{xpPopup.xp} XP <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>— {xpPopup.label}</span></div>}
    </div>
  )
}
