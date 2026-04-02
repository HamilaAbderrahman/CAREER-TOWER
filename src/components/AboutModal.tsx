interface Props {
  onClose: () => void
}

export function AboutModal({ onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,4,20,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0a0a1a',
          border: '2px solid #00ff88',
          boxShadow: '0 0 30px #00ff8844',
          padding: '28px 32px',
          maxWidth: 400,
          width: '90%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: '#00ff88', marginBottom: 16, letterSpacing: 3 }}>
          ABOUT
        </div>

        <div style={{ fontSize: '7px', color: '#aaa', lineHeight: 2.2, marginBottom: 22 }}>
          A pixel-art platformer built as a personal portfolio artifact.
          Climb through 13 years of engineering — each platform is a real chapter.
          <br /><br />
          Built with Phaser 3 · React · TypeScript · Web Audio API.
          All audio, graphics, and backgrounds are procedurally generated — no assets.
        </div>

        <div style={{ fontSize: '8px', color: '#555', marginBottom: 12, letterSpacing: 2 }}>
          ABDERRAHMANE HAMILA
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          <a
            href="https://www.linkedin.com/in/abderrahmanehamila/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '7px',
              color: '#000',
              background: '#0077b5',
              textDecoration: 'none',
              padding: '8px 14px',
              letterSpacing: 1,
              display: 'inline-block',
            }}
          >
            LINKEDIN
          </a>
          <a
            href="https://github.com/HamilaAbderrahman"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '7px',
              color: '#000',
              background: '#e6edf3',
              textDecoration: 'none',
              padding: '8px 14px',
              letterSpacing: 1,
              display: 'inline-block',
            }}
          >
            GITHUB
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#000',
            background: '#00ff88',
            border: 'none',
            padding: '10px 22px',
            cursor: 'pointer',
            letterSpacing: 2,
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
