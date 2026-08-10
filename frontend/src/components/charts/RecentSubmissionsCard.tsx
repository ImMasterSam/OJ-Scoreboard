import { useContext, useMemo } from 'react';
import { SubsContext } from '../../context/SubsContext';

export default function RecentSubmissionsCard({ className = '' }: { className?: string }) {
  const { data, loading, error } = useContext(SubsContext);

  const recentSubs = useMemo(() => {
    if (!data) return [];

    // Sort by "完成時間" descending
    const sortedData = [...data].sort((a, b) => {
      return new Date(b['完成時間']).getTime() - new Date(a['完成時間']).getTime();
    });

    // Take top 30
    return sortedData.slice(0, 30);
  }, [data]);

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

  return (
    <div className={`glass-card ${className}`}>
      <h2 style={{ marginBottom: '16px' }}>近期提交紀錄</h2>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          載入中...
        </div>
      ) : error ? (
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
                <th>解題網站</th>
                <th>題目名稱</th>
                <th>結果</th>
                <th>完成時間</th>
              </tr>
            </thead>
            <tbody>
              {recentSubs.map((sub, idx) => (
                <tr key={`${sub['題目名稱']}-${sub['完成時間']}-${idx}`}>
                  <td>{sub['網站']}</td>
                  <td className="title-cell" title={sub['題目名稱']}>
                    {sub['題目名稱']}
                  </td>
                  <td style={{ color: getVerdictColor(sub['結果']), fontWeight: 500 }}>
                    {sub['結果']}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
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
