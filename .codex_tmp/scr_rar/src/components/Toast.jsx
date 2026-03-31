// Toast.jsx — MANFHER SYSTEMS · Atlas HIS
export default function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'fixed', top: 72, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : -20}px)`,
      background: 'var(--teal)', color: 'white',
      padding: '10px 22px', borderRadius: 9,
      fontSize: '.81rem', fontWeight: 700,
      boxShadow: 'var(--shadow-lg)',
      opacity: visible ? 1 : 0,
      transition: 'all .3s',
      zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  );
}
