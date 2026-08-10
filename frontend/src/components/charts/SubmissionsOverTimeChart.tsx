import { useMemo, useState } from 'react';
import { useSubsData } from '../../hooks/useSubsData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SubmissionsOverTimeChart() {
  const { rawData, loading, error } = useSubsData();
  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly');

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const countsByMonth = new Map<string, number>();
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    rawData.forEach((sub) => {
      const dateStr = sub['完成時間'];
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      countsByMonth.set(key, (countsByMonth.get(key) || 0) + 1);
    });

    if (!minDate || !maxDate) return [];

    const minD = minDate as Date;
    const maxD = maxDate as Date;

    const data = [];
    let cumulative = 0;
    const current = new Date(minD.getFullYear(), minD.getMonth(), 1);
    const end = new Date(maxD.getFullYear(), maxD.getMonth(), 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const monthCount = countsByMonth.get(key) || 0;
      cumulative += monthCount;
      data.push({
        name: key, // YYYY-MM
        dateObj: new Date(current),
        count: monthCount,
        cumulativeCount: cumulative,
      });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [rawData]);

  if (loading) {
    return <div className="chart-card dashboard-item loading" style={{ gridColumn: 'span 8' }}>載入中...</div>;
  }
  if (error) {
    return <div className="chart-card dashboard-item error" style={{ gridColumn: 'span 8' }}>Error: {error}</div>;
  }

  const totalSubmissions = rawData ? rawData.length : 0;
  const isCumulative = viewMode === 'cumulative';

  return (
    <div className="chart-card dashboard-item" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2 className="chart-title" style={{ margin: 0 }}>歷年提交量</h2>
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('monthly')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: !isCumulative ? 'var(--surface-color-hover, #666769)' : 'transparent',
                color: !isCumulative ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: !isCumulative ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              單月
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderLeft: '1px solid var(--border-color)',
                background: isCumulative ? 'var(--surface-color-hover, #666769)' : 'transparent',
                color: isCumulative ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isCumulative ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              累計
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            {totalSubmissions.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
            總提交量
          </span>
        </div>
      </div>
      <div className="chart-container" style={{ flexGrow: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSubmissionsCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={true} />
            <XAxis
              dataKey="name"
              ticks={chartData.filter(d => d.dateObj.getMonth() === 0).map(d => d.name)}
              tickFormatter={(val: string) => {
                const year = val.split('-')[0];
                return `${year}年`;
              }}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              itemStyle={{ color: isCumulative ? '#10b981' : '#3b82f6', fontWeight: 600 }}
              labelFormatter={(_label, payload) => {
                if (payload && payload.length > 0) {
                  const dateObj = payload[0].payload.dateObj as Date;
                  if (dateObj && dateObj instanceof Date) {
                    return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月`;
                  }
                }
                return _label;
              }}
            />
            <Area
              type="monotone"
              dataKey={isCumulative ? "cumulativeCount" : "count"}
              name={isCumulative ? "累計提交量" : "單月提交量"}
              stroke={isCumulative ? "#10b981" : "#3b82f6"}
              strokeWidth={3}
              fillOpacity={1}
              fill={isCumulative ? "url(#colorSubmissionsCumulative)" : "url(#colorSubmissions)"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
