import { useContext, useMemo } from 'react';
import { SubsContext } from '../context/SubsContext';

export function useSubsData() {
  const context = useContext(SubsContext);
  if (context === undefined) {
    throw new Error('useSubsData must be used within a SubsProvider');
  }

  const { data, filteredData, loading, error, selectedWebsite, selectedVerdict, setWebsiteFilter, setVerdictFilter, clearFilters } = context;

  // Use filteredData for KPIs so they reflect the cross-filtering state
  const kpiData = useMemo(() => {
    const dataSource = filteredData || data;
    if (!dataSource) return null;
    let ac = 0;
    let wa = 0;
    let tle = 0;
    dataSource.forEach((sub) => {
      const result = sub['結果'];
      if (result === 'AC') ac++;
      else if (result === 'WA') wa++;
      else if (result === 'TLE') tle++;
    });
    return { ac, wa, tle };
  }, [data, filteredData]);

  return { 
    rawData: data, 
    filteredData,
    data: kpiData, 
    loading, 
    error,
    selectedWebsite,
    selectedVerdict,
    setWebsiteFilter,
    setVerdictFilter,
    clearFilters
  };
}
