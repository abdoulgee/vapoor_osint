/**
 * StatsCard — SOC hard-edged stat panel with neon accent.
 */

export default function StatsCard({ title, value, icon, color = 'cyber', subtitle }) {
    const colorMap = {
        cyber: { border: 'border-cyber-400/20', text: 'text-cyber-400', glow: 'shadow-cyber' },
        red: { border: 'border-threat-critical/20', text: 'text-threat-critical', glow: '' },
        blue: { border: 'border-threat-info/20', text: 'text-threat-info', glow: '' },
        green: { border: 'border-cyber-400/20', text: 'text-cyber-500', glow: '' },
        yellow: { border: 'border-threat-medium/20', text: 'text-threat-medium', glow: '' },
    };

    const c = colorMap[color] || colorMap.cyber;

    return (
        <div className={`soc-panel p-4 ${c.border} ${c.glow} transition-all hover:border-cyber-400/40`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-mono text-soc-400 uppercase tracking-wider">{title}</p>
                    <p className={`text-2xl font-mono font-bold mt-1 ${c.text}`}>{value}</p>
                    {subtitle && <p className="text-[10px] font-mono text-soc-500 mt-1">{subtitle}</p>}
                </div>
                <span className="text-lg opacity-50">{icon}</span>
            </div>
        </div>
    );
}
