import { useContext, useMemo } from 'react';
import { SubsContext } from '../../context/SubsContext';
import { RecentSubmissionsSkeleton } from '../ChartPlaceholders';

export default function RecentSubmissionsCard({ className = '' }: { className?: string }) {
  const { data, filteredData, loading, error } = useContext(SubsContext);

  const recentSubs = useMemo(() => {
    const dataSource = filteredData || data;
    if (!dataSource) return [];

    // Sort by "完成時間" descending
    const sortedData = [...dataSource].sort((a, b) => {
      return new Date(b['完成時間']).getTime() - new Date(a['完成時間']).getTime();
    });

    // Take top 30
    return sortedData.slice(0, 30);
  }, [data, filteredData]);

  const getVerdictColor = (verdict: string) => {
    const v = verdict.toUpperCase();
    if (v.includes('AC')) return 'var(--color-ac)';
    if (v.includes('WA')) return 'var(--color-wa)';
    if (v.includes('TLE')) return 'var(--color-tle)';
    if (v.includes('CE')) return 'var(--color-ce)';
    if (v.includes('RE')) return 'var(--color-re)';
    if (v.includes('MLE')) return 'var(--color-mle)';
    if (v.includes('OLE')) return 'var(--color-ole)';
    if (v.includes('RF')) return 'var(--color-rf)';
    return 'var(--text-primary)';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  if (loading) {
    return <RecentSubmissionsSkeleton />;
  }

  return (
    <div className={`glass-card ${className}`}>
      <h2 className="chart-title">近期提交紀錄</h2>

      {error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-wa)' }}>
          無法載入資料: {error}
        </div>
      ) : recentSubs.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          目前沒有任何提交紀錄
        </div>
      ) : (
        <div className="recent-subs-container">
          <table className="recent-subs-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '1%' }}>解題網站</th>
                <th>題目名稱</th>
                <th style={{ whiteSpace: 'nowrap', width: '1%' }}>完成時間</th>
              </tr>
            </thead>
            <tbody>
              {recentSubs.map((sub, idx) => (
                <tr key={`${sub['題目名稱']}-${sub['完成時間']}-${idx}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={`./OJ logos/${sub['網站']}.png`}
                        alt={sub['網站']}
                        title={sub['網站']}
                        style={{ height: '24px' }}
                      />
                    </div>
                  </td>
                  <td
                    className="title-cell"
                    title={`[${sub['結果']}] ${sub['題目名稱']}`}
                    style={{
                      width: '100%',
                      borderRight: `4px solid ${getVerdictColor(sub['結果'])}`
                    }}
                  >
                    <a
                      href={sub['網址']}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {sub['題目名稱']}
                    </a>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {formatDate(sub['完成時間'])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
