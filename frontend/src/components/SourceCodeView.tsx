import { useSubsData } from '../hooks/useSubsData';

export default function SourceCodeView() {
  const { rawData } = useSubsData();

  // Take the first 20 submissions as mock data for the left panel
  const recentSubmissions = rawData ? rawData.slice(0, 20) : [];

  const mockCode = `function calculateSum(a, b) {
  // This is a placeholder for the actual source code
  console.log("Calculating sum...");
  
  let result = a + b;
  
  return result;
}

// Example usage
const total = calculateSum(10, 20);
console.log("Total is: ", total);`;

  return (
    <div className="source-code-grid">
      {/* Left Panel: Query and list (4 columns) */}
      <div className="glass-card col-span-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Search Submissions</h2>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {recentSubmissions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
              {recentSubmissions.map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{sub['題目'] || `Task ${idx + 1}`}</span>
                    <span
                      style={{
                        color: sub['結果'] === 'AC' ? 'var(--color-ac)' :
                          sub['結果'] === 'WA' ? 'var(--color-wa)' :
                            sub['結果'] === 'TLE' ? 'var(--color-tle)' : 'var(--text-secondary)',
                        fontWeight: 600
                      }}
                    >
                      {sub['結果']}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{sub['姓名']}</span>
                    <span>{sub['繳交時間']}</span>
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
      </div>

      {/* Right Panel: Source Code Display (8 columns) */}
      <div className="glass-card code-card col-span-8">
        <div className="code-header">
          <span>solution.js</span>
          <span>JavaScript</span>
        </div>
        <pre className="code-content">
          <code>{mockCode}</code>
        </pre>
      </div>
    </div>
  );
}
