
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import { 
  RecentSubmissionsSkeleton,
  HistoricalSubmissionsSkeleton,
  MonthlyStatsSkeleton
} from './components/ChartPlaceholders';

import WebsiteDistributionChart from './components/charts/WebsiteDistributionChart';
import VerdictDistributionChart from './components/charts/VerdictDistributionChart';

import { SubsProvider } from './context/SubsContext';

function App() {
  return (
    <SubsProvider>
      <main className="main-content">
        <Header />
        
        <KpiCards />

        <div className="dashboard-grid">
          {/* Top Row: 3 columns (4-4-4 out of 12) */}
          <WebsiteDistributionChart />
          <VerdictDistributionChart />
          <RecentSubmissionsSkeleton />

          {/* Bottom Row: 2 columns (8-4 out of 12) */}
          <HistoricalSubmissionsSkeleton />
          <MonthlyStatsSkeleton />
        </div>
      </main>
    </SubsProvider>
  )
}

export default App
