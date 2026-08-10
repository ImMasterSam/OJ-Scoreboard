import '../css/ChartPlaceholders.css';

export function WebsiteDistributionSkeleton() {
  return (
    <div className="glass-card col-span-4 skeleton-card">
      <h2 className="skeleton-title">解題網站</h2>
      <div className="skeleton-content-center">
        <div className="skeleton-donut skeleton-donut-website"></div>
      </div>
    </div>
  );
}

export function VerdictDistributionSkeleton() {
  return (
    <div className="glass-card col-span-4 skeleton-card">
      <h2 className="skeleton-title">解題統計</h2>
      <div className="skeleton-content-center">
        <div className="skeleton-donut skeleton-donut-verdict"></div>
      </div>
    </div>
  );
}

export function RecentSubmissionsSkeleton() {
  return (
    <div className="glass-card col-span-4 skeleton-card">
      <h2 className="skeleton-title">最近完成題目</h2>
      <div className="skeleton-list">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-list-badge"></div>
            <div className="skeleton-list-line-long"></div>
            <div className="skeleton-list-line-short"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoricalSubmissionsSkeleton() {
  return (
    <div className="glass-card col-span-8 skeleton-history-card">
      <h2 className="skeleton-title">歷年提交量</h2>
      <div className="skeleton-history-content">
        {/* Placeholder for Big number */}
        <div className="skeleton-history-number-container">
           <div className="display-number skeleton-history-number">2,017</div>
           <div className="text-secondary skeleton-history-label">總提交量</div>
        </div>
        {/* Placeholder for Area Chart */}
        <div className="skeleton-area-chart"></div>
      </div>
    </div>
  );
}

export function MonthlyStatsSkeleton() {
  return (
    <div className="glass-card col-span-4 skeleton-history-card">
      <h2 className="skeleton-title">近 1個月內 各網站統計</h2>
      <div className="skeleton-monthly-content">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
        ))}
      </div>
    </div>
  );
}
