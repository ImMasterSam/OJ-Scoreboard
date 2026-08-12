import { useState } from 'react';
import { useSubsData } from '../../hooks/useSubsData';
import { Code } from 'lucide-react';

function WebsiteLogo({ website }: { website?: string }) {
  const [error, setError] = useState(false);

  if (!website || error) {
    return <Code size={24} color="var(--text-secondary)" />;
  }

  return (
    <img
      src={`./OJ logos/${website}.png`}
      alt={website}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      onError={() => setError(true)}
    />
  );
}

const getVerdictColor = (verdict?: string) => {
  const v = verdict?.toUpperCase();
  if (['AC', 'WA', 'TLE', 'CE', 'RE', 'MLE', 'OLE', 'RF'].includes(v || '')) {
    return `var(--color-${v?.toLowerCase()})`;
  }
  return 'var(--text-secondary)';
};

interface SearchSubmissionsProps {
  selectedSubmission: any;
  onSelect: (sub: any) => void;
}

export default function SearchSubmissions({ selectedSubmission, onSelect }: SearchSubmissionsProps) {
  const { rawData } = useSubsData();

  // Filter States
  const [websiteFilter, setWebsiteFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');
  const [taskNameFilter, setTaskNameFilter] = useState('');

  // Extract unique options
  const websites = rawData ? Array.from(new Set(rawData.map(sub => sub['網站']).filter(Boolean))) : [];
  const verdicts = rawData ? Array.from(new Set(rawData.map(sub => sub['結果']).filter(Boolean))) : [];

  // Apply filters
  let filteredSubmissions = rawData ? [...rawData] : [];
  if (websiteFilter) {
    filteredSubmissions = filteredSubmissions.filter(sub => sub['網站'] === websiteFilter);
  }
  if (verdictFilter) {
    filteredSubmissions = filteredSubmissions.filter(sub => sub['結果'] === verdictFilter);
  }
  if (startTimeFilter) {
    const startTime = new Date(startTimeFilter).getTime();
    filteredSubmissions = filteredSubmissions.filter(sub => new Date(sub['完成時間']).getTime() >= startTime);
  }
  if (endTimeFilter) {
    const endTime = new Date(endTimeFilter).getTime();
    filteredSubmissions = filteredSubmissions.filter(sub => new Date(sub['完成時間']).getTime() <= endTime);
  }
  if (taskNameFilter) {
    const searchLower = taskNameFilter.toLowerCase();
    filteredSubmissions = filteredSubmissions.filter(sub => sub['題目名稱']?.toLowerCase().includes(searchLower));
  }

  // Sort and limit
  filteredSubmissions.sort((a, b) => new Date(b['完成時間']).getTime() - new Date(a['完成時間']).getTime());
  const hasMore = filteredSubmissions.length > 20;
  const recentSubmissions = filteredSubmissions.slice(0, 20);

  return (
    <div className="glass-card col-span-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Search Submissions</h2>

      {/* Top 2x2 Grid Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', flexShrink: 0 }}>
        <select 
          value={websiteFilter} 
          onChange={e => setWebsiteFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
        >
          <option value="" style={{ color: 'black' }}>All Websites</option>
          {websites.map(w => <option key={w} value={w} style={{ color: 'black' }}>{w}</option>)}
        </select>
        <select 
          value={verdictFilter} 
          onChange={e => setVerdictFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }}
        >
          <option value="" style={{ color: 'black' }}>All Verdicts</option>
          {verdicts.map(v => <option key={v} value={v} style={{ color: 'black' }}>{v}</option>)}
        </select>
        <input 
          type="datetime-local" 
          value={startTimeFilter} 
          onChange={e => setStartTimeFilter(e.target.value)}
          title="Start Time"
          style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none', colorScheme: 'dark' }}
        />
        <input 
          type="datetime-local" 
          value={endTimeFilter} 
          onChange={e => setEndTimeFilter(e.target.value)}
          title="End Time"
          style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none', colorScheme: 'dark' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {recentSubmissions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
            {recentSubmissions.map((sub, idx) => (
              <div
                key={idx}
                onClick={() => onSelect(sub)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedSubmission === sub ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedSubmission === sub ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => { if (selectedSubmission !== sub) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)' }}
                onMouseLeave={(e) => { if (selectedSubmission !== sub) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)' }}
              >
                {/* Left: Website Logo */}
                <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WebsiteLogo website={sub['網站']} />
                </div>

                {/* Middle: Time and Task Name */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {sub['完成時間']}
                  </span>
                  <span style={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {sub['題目名稱'] || `Task ${idx + 1}`}
                  </span>
                </div>

                {/* Right: Verdict */}
                <div style={{ flexShrink: 0 }}>
                  <span
                    style={{
                      color: getVerdictColor(sub['結果']),
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      fontSize: '1.2rem'
                    }}
                  >
                    {sub['結果']}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '24px' }}>
            No submissions found.
          </div>
        )}
      </div>

      {/* Bottom Filter & Hint */}
      <div style={{ flexShrink: 0, marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hasMore && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            顯示超過 20 筆結果，請增加更多篩選條件
          </div>
        )}
        <input
          type="text"
          placeholder="Search Task Name..."
          value={taskNameFilter}
          onChange={e => setTaskNameFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '100%',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}
