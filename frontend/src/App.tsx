
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import { 
  WebsiteDistributionSkeleton, 
  VerdictDistributionSkeleton, 
  RecentSubmissionsSkeleton,
  HistoricalSubmissionsSkeleton,
  MonthlyStatsSkeleton
} from './components/ChartPlaceholders';

function App() {
  return (
    <>

      <main className="main-content">
        <Header />
        
        <KpiCards />

        <div className="dashboard-grid">
          {/* Top Row: 3 columns (4-4-4 out of 12) */}
          <WebsiteDistributionSkeleton />
          <VerdictDistributionSkeleton />
          <RecentSubmissionsSkeleton />

          {/* Bottom Row: 2 columns (8-4 out of 12) */}
          <HistoricalSubmissionsSkeleton />
          <MonthlyStatsSkeleton />
        </div>
      </main>
    </>
  )
}

export default App
