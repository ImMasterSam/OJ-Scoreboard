
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import WebsiteDistributionChart from './components/charts/WebsiteDistributionChart';
import VerdictDistributionChart from './components/charts/VerdictDistributionChart';
import SubmissionsOverTimeChart from './components/charts/SubmissionsOverTimeChart';
import RecentSubmissionsCard from './components/charts/RecentSubmissionsCard';

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
          
          {/* Right column spanning 2 rows */}
          <RecentSubmissionsCard className="col-span-4 row-span-2" />

          {/* Bottom Row: falls into next row naturally taking 8 columns */}
          <SubmissionsOverTimeChart />
        </div>
      </main>
    </SubsProvider>
  )
}

export default App
