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
function Sidebar({ items, current, setCurrent, onLogout, role }) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand"><div className="sidebar-logo">B</div><span className="sidebar-title">Brevet <span>Booster</span></span></div>
      {role && <div className={`sidebar-role ${role}`}>{role === 'admin' ? 'Administration' : 'Espace élève'}</div>}
      <nav className="sidebar-nav">
        {items.map(it => (
          <div key={it.id} className={`sidebar-item ${current === it.id ? 'active' : ''}`} onClick={() => setCurrent(it.id)}>
            {it.icon}<span>{it.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom"><button className="sidebar-logout" onClick={onLogout}>{IC.logout}<span>Déconnexion</span></button></div>
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: WELCOME (with badges, streak, fun facts)
// ═══════════════════════════════════════
function WelcomePage({ settings, completedIds, totalChapters, streak }) {
  const pct = totalChapters > 0 ? Math.round((completedIds.length / totalChapters) * 100) : 0
  const badge = getBadge(completedIds.length)
  const next = getNextBadge(completedIds.length)
  const [funFact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])

  return (
    <div>
      <h1 className="page-title">Bienvenue sur Brevet Booster</h1>
      <p className="page-subtitle">Ta plateforme de révision maths pour le brevet</p>

      {/* Fun fact */}
      <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: 14, padding: '16px 22px', marginBottom: 20, border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 28 }}>🧠</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Le savais-tu ?</div>
          <div style={{ fontSize: 13, color: '#3730A3', lineHeight: 1.5 }}>{funFact}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Countdown */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-sm" style={{ marginBottom: 16 }}>{IC.clock}<span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-sec)' }}>Compte à rebours brevet</span></div>
          <Countdown />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sec)', marginTop: 8 }}>Brevet de maths — 29 juin 2026</p>
        </div>
        {/* Progress */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-sm" style={{ marginBottom: 16 }}>{IC.target}<span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-sec)' }}>Ta progression</span></div>
          <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--accent)', textAlign: 'center', fontFamily: 'monospace', lineHeight: 1 }}>{pct}%</div>
          <div style={{ margin: '12px 0' }}><ProgressBar value={completedIds.length} max={totalChapters} height={10} /></div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sec)' }}>{completedIds.length} / {totalChapters} chapitres terminés</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Streak */}
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>🔥</div>
          <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'monospace', color: '#F59E0B', lineHeight: 1 }}>{streak.current_streak || 0}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sec)', marginTop: 6 }}>jour{(streak.current_streak || 0) > 1 ? 's' : ''} de suite</div>
          {(streak.best_streak || 0) > 0 && <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 4 }}>Record : {streak.best_streak} jours 🏆</div>}
        </div>
        {/* Badge */}
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          {badge ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 6 }}>{badge.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: badge.color }}>{badge.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>Niveau atteint !</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 6, opacity: 0.3 }}>🥉</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sec)' }}>Pas encore de badge</div>
            </>
          )}
          {next && <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 8 }}>Prochain : {next.emoji} {next.name} → encore {next.min - completedIds.length} chapitre{next.min - completedIds.length > 1 ? 's' : ''}</div>}
        </div>
      </div>

      {/* All badges overview */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sec)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Badges à débloquer</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-around' }}>
          {[...BADGES].reverse().map(b => {
            const unlocked = completedIds.length >= b.min
            return (
              <div key={b.id} style={{ textAlign: 'center', opacity: unlocked ? 1 : 0.35 }}>
                <div style={{ fontSize: 30 }}>{b.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? b.color : 'var(--text-sec)', marginTop: 4 }}>{b.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-sec)' }}>{b.min} chapitres</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Welcome video */}
      <div className="card">
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Présentation de l&apos;accompagnement</h2>
          <p style={{ color: 'var(--text-sec)', fontSize: 14, lineHeight: 1.7 }}>{settings.welcome_text || ''}</p>
        </div>
        {settings.welcome_video && (
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
              <iframe src={settings.welcome_video} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// STUDENT: CHAPTERS (3 PDFs + auto-eval)
// ═══════════════════════════════════════
function ChaptersPage({ parts, completedIds, toggleComplete }) {
  const [openPart, setOpenPart] = useState(parts[0]?.id || null)
  const totalCh = parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)
  return (
    <div>
      <h1 className="page-title">Chapitres</h1>
      <p className="page-subtitle">{totalCh} chapitres — cours simplifié, cours développé et exercices</p>
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
              <div style={{ paddingLeft: 16, marginTop: 6 }}>
                {chapters.map((ch, i) => {
                  const isDone = completedIds.includes(ch.id)
                  return (
                    <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--card)', borderRadius: 12, marginTop: 6, border: '1px solid var(--border)' }}>
                      <div className={`checkbox ${isDone ? 'checked' : ''}`} onClick={() => toggleComplete(ch.id)}>{isDone && IC.check}</div>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 12, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-sec)' : 'var(--text)' }}>{ch.title}</span>
                      <div className="row gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {ch.pdf_url && ch.pdf_url !== '' && (
                          <a href={ch.pdf_url} target="_blank" rel="noreferrer" className="badge badge-success row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer' }}>{IC.pdf} Simplifié</a>
                        )}
                        {ch.detailed_pdf_url && ch.detailed_pdf_url !== '' && (
                          <a href={ch.detailed_pdf_url} target="_blank" rel="noreferrer" className="badge badge-video row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer' }}>{IC.pdf} Développé</a>
                        )}
                        {ch.exercises_pdf_url && ch.exercises_pdf_url !== '' && (
                          <a href={ch.exercises_pdf_url} target="_blank" rel="noreferrer" className="badge badge-pdf row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer' }}>{IC.pdf} Exercices</a>
                        )}
                        {ch.eval_pdf_url && ch.eval_pdf_url !== '' && (
                          <a href={ch.eval_pdf_url} target="_blank" rel="noreferrer" className="badge row gap-sm" style={{ textDecoration: 'none', cursor: 'pointer', background: '#FEF3C7', color: '#92400E' }}>{IC.pdf} Auto-éval</a>
                        )}
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
// STUDENT: PREP (with Methodo + Fiches Memo)
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
      <p className="page-subtitle">Méthodologie, fiches mémo et conseils pour le jour J</p>
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

function GamesPage({ userId }) {
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
      <MultiplicationGame userId={userId} onBack={() => setActiveGame(null)} />
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
  const totalCh = parts.reduce((a, p) => a + (p.chapters?.length || 0), 0)

  useEffect(() => {
    const load = async () => {
      const { data: progress } = await supabase.from('student_progress').select('user_id, chapter_id')
      const { data: streaks } = await supabase.from('student_streaks').select('*')
      const grouped = {}
      ;(progress || []).forEach(p => {
        if (!grouped[p.user_id]) grouped[p.user_id] = []
        grouped[p.user_id].push(p.chapter_id)
      })
      setProgressData(grouped)
      const streakMap = {}
      ;(streaks || []).forEach(s => { streakMap[s.user_id] = s })
      setStreakData(streakMap)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="page-title">Progression des élèves</h1>
      <p className="page-subtitle">Suivi en temps réel de chaque élève</p>
      <div className="card">
        <div className="card-header">
          <span>{students.length} élève{students.length > 1 ? 's' : ''}</span>
        </div>
        {students.map(s => {
          const done = (progressData[s.id] || []).length
          const pct = totalCh > 0 ? Math.round((done / totalCh) * 100) : 0
          const badge = getBadge(done)
          const streak = streakData[s.id]
          return (
            <div key={s.id} style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="row gap-sm">
                  {badge && <span style={{ fontSize: 20 }}>{badge.emoji}</span>}
                  <div>
                    <span style={{ fontWeight: 700 }}>{s.first_name} {s.last_name}</span>
                    <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-sec)' }}>{s.username}</span>
                  </div>
                </div>
                <div className="row gap-md">
                  {streak && streak.current_streak > 0 && (
                    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>🔥 {streak.current_streak}j</span>
                  )}
                  <span style={{ fontWeight: 800, fontSize: 16, fontFamily: 'monospace', color: pct >= 75 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--text-sec)' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}><ProgressBar value={done} max={totalCh} height={8} /></div>
                <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 500, whiteSpace: 'nowrap' }}>{done}/{totalCh}</span>
              </div>
            </div>
          )
        })}
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
  const [loading, setLoading] = useState(true)

  const [students, setStudents] = useState([])
  const [parts, setParts] = useState([])
  const [modules, setModules] = useState([])
  const [exercises, setExercises] = useState([])
  const [settings, setSettings] = useState({})
  const [completedIds, setCompletedIds] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [streak, setStreak] = useState({})

  const showToast = useCallback(m => { setToast(m); setTimeout(() => setToast(null), 2500) }, [])
  const totalChapters = useMemo(() => parts.reduce((a, p) => a + (p.chapters?.length || 0), 0), [parts])

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
    const { data: existing } = await supabase.from('student_streaks').select('*').eq('user_id', userId).single()
    if (existing) {
      const lastLogin = existing.last_login
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      let newStreak = existing.current_streak
      if (lastLogin === today) {
        setStreak(existing); return
      } else if (lastLogin === yesterday) {
        newStreak = existing.current_streak + 1
      } else {
        newStreak = 1
      }
      const bestStreak = Math.max(newStreak, existing.best_streak || 0)
      await supabase.from('student_streaks').update({ current_streak: newStreak, last_login: today, best_streak: bestStreak }).eq('user_id', userId)
      setStreak({ current_streak: newStreak, last_login: today, best_streak: bestStreak })
    } else {
      await supabase.from('student_streaks').insert({ user_id: userId, current_streak: 1, last_login: today, best_streak: 1 })
      setStreak({ current_streak: 1, last_login: today, best_streak: 1 })
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const login = async (username, password, setErr) => {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password).single()
    if (error || !data) { setErr('Identifiant ou mot de passe incorrect'); return }
    if (!data.active && data.role !== 'admin') { setErr('Ton compte est désactivé, contacte ton prof'); return }
    setUser(data)
    if (data.role === 'admin') { setPage('admin-dash') }
    else { setPage('welcome'); await loadStudentData(data.id); await updateStreak(data.id) }
  }

  const toggleComplete = async (chapterId) => {
    if (!user) return
    if (completedIds.includes(chapterId)) {
      await supabase.from('student_progress').delete().eq('user_id', user.id).eq('chapter_id', chapterId)
      setCompletedIds(prev => prev.filter(id => id !== chapterId))
    } else {
      await supabase.from('student_progress').insert({ user_id: user.id, chapter_id: chapterId })
      setCompletedIds(prev => [...prev, chapterId])
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
    { id: 'games', label: 'Jeux', icon: IC.game },
  ]
  const adminNav = [
    { id: 'admin-dash', label: 'Tableau de bord', icon: IC.dash },
    { id: 'admin-students', label: 'Élèves', icon: IC.users },
    { id: 'admin-content', label: 'Contenu', icon: IC.book },
    { id: 'admin-progress', label: 'Progression', icon: IC.chart },
  ]

  return (
    <div className="app-layout">
      <Sidebar items={isAdmin ? adminNav : studentNav} current={page} setCurrent={setPage} onLogout={logout} role={user.role} />
      <div className="main-content">
        {!isAdmin && page === 'welcome' && <WelcomePage settings={settings} completedIds={completedIds} totalChapters={totalChapters} streak={streak} />}
        {!isAdmin && page === 'chapters' && <ChaptersPage parts={parts} completedIds={completedIds} toggleComplete={toggleComplete} />}
        {!isAdmin && page === 'prep' && <PrepPage modules={modules} />}
        {!isAdmin && page === 'exercises' && <ExercisesPage exercises={exercises} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
        {!isAdmin && page === 'favorites' && <FavoritesPage exercises={exercises} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
        {!isAdmin && page === 'games' && <GamesPage userId={user.id} />}
        {isAdmin && page === 'admin-dash' && <AdminDashboard students={students} parts={parts} exercises={exercises} />}
        {isAdmin && page === 'admin-students' && <AdminStudents students={students} reload={loadData} showToast={showToast} />}
        {isAdmin && page === 'admin-content' && <AdminContent parts={parts} reload={loadData} showToast={showToast} />}
        {isAdmin && page === 'admin-progress' && <AdminProgression students={students} parts={parts} />}
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}
