export function RotatePrompt() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#070714',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, gap: 24,
    }}>
      <div style={{ fontSize: 64 }}>📱</div>
      <div style={{ fontSize: '10px', color: '#00ff88', textAlign: 'center', letterSpacing: 2, lineHeight: 2.5 }}>
        ROTATE YOUR<br />DEVICE
      </div>
      <div style={{ fontSize: '7px', color: '#444', textAlign: 'center', lineHeight: 2 }}>
        best played in landscape
      </div>
    </div>
  )
}
