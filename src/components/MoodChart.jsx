import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';

/**
 * Özelleştirilmiş Tooltip — Grafiğin üzerine gelinince gösterilir.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-3 py-2.5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
          {d.value}/10 puan
        </p>
        {d.payload?.duygu && (
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            {d.payload.emoji} {d.payload.duygu}
          </p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * MoodChart — Haftalık ruh hali trendi grafiği.
 *
 * Recharts'ın ResponsiveContainer'ı sayesinde her ekran boyutuna uyum sağlar.
 * AreaChart kullanarak dolu alan görüntüsü ekledik — daha premium görünür.
 */
export default function MoodChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6">
          📈 Grafik için en az 2 giriş gerekli
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📈</span>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Haftalık Ruh Hali Trendi
        </h2>
        <span className="ml-auto text-xs text-gray-400">Son {data.length} giriş</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700/50" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Orta referans çizgisi */}
          <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" />

          <Area
            type="monotone"
            dataKey="puan"
            stroke="#7c3aed"
            strokeWidth={2.5}
            fill="url(#moodGradient)"
            dot={{ fill: '#7c3aed', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
