export default function StatCard({ label, value, icon, sub, color = 'jade', trend }) {
  const colors = {
    jade: { glow: 'rgba(0,214,143,0.08)', border: 'rgba(0,214,143,0.15)', text: '#00D68F', bg: 'rgba(0,214,143,0.12)' },
    coral: { glow: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.15)', text: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
    amber: { glow: 'rgba(255,179,71,0.08)', border: 'rgba(255,179,71,0.15)', text: '#FFB347', bg: 'rgba(255,179,71,0.12)' },
    sky: { glow: 'rgba(79,195,247,0.08)', border: 'rgba(79,195,247,0.15)', text: '#4FC3F7', bg: 'rgba(79,195,247,0.12)' },
  }
  const c = colors[color]

  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-default"
      style={{
        background: `linear-gradient(135deg, #1A1A2E 60%, ${c.glow})`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Subtle glow top-right */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: c.text, filter: 'blur(30px)' }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          {icon}
        </div>

        {/* Value */}
        <div className="font-display font-bold text-2xl text-white mb-1 count-up">{value}</div>

        {/* Label */}
        <div className="text-white/45 text-sm font-body">{label}</div>

        {/* Sub / trend */}
        {sub && (
          <div className="mt-3 text-xs font-body" style={{ color: c.text }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
