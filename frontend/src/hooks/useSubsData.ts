import { useContext, useMemo } from 'react';
import { SubsContext } from '../context/SubsContext';

export function useSubsData() {
  const context = useContext(SubsContext);
  if (context === undefined) {
    throw new Error('useSubsData must be used within a SubsProvider');
  }

  const { data, loading, error } = context;

  // Keep the aggregated AC, WA, TLE logic for KpiCards backwards compatibility
  const kpiData = useMemo(() => {
    if (!data) return null;
    let ac = 0;
    let wa = 0;
    let tle = 0;
    data.forEach((sub) => {
      const result = sub['結果'];
      if (result === 'AC') ac++;
      else if (result === 'WA') wa++;
      else if (result === 'TLE') tle++;
    });
    return { ac, wa, tle };
  }, [data]);

  return { rawData: data, data: kpiData, loading, error };
}
