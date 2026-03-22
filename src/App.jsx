/**
 * Vampire Clan Select Screen
 * AI 201 — Project 1: Hero Faction Screen (Instructor Demo)
 * 
 * Current Pass: SETUP (repo scaffolding)
 * Next: Pass 1 — Monochrome Silhouettes
 * 
 * See .claude/design-intent.md for full creative specification.
 * See .claude/CLAUDE.md for AI collaboration context.
 */

export default function App() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      color: '#444',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '11px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        marginBottom: '16px',
        color: '#555',
      }}>
        AI 201 — Project 1
      </div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'normal',
        color: '#666',
        marginBottom: '8px',
        letterSpacing: '0.05em',
      }}>
        Vampire Clan Select
      </h1>
      <p style={{
        fontSize: '14px',
        color: '#444',
        maxWidth: '300px',
        lineHeight: 1.6,
      }}>
        Repo scaffolded. Design Intent locked.<br />
        Pass 1 begins here.
      </p>
    </div>
  )
}
