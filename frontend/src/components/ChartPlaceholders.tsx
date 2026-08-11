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
    <div className="glass-card col-span-4 row-span-2 skeleton-card">
      <h2 className="skeleton-title">近期提交紀錄</h2>
      <div className="skeleton-list">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
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
        {/* Placeholder for Area Chart */}
        <div className="skeleton-area-chart"></div>
      </div>
    </div>
  );
}
