import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface KpiData {
  ac: number;
  wa: number;
  tle: number;
}

export function useKpiData() {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKpiData() {
      try {
        setLoading(true);
        let allSubmissions: any[] = [];
        let from = 0;
        const step = 1000;
        let fetchMore = true;

        while (fetchMore) {
          const { data: submissions, error: supabaseError } = await supabase
            .from('Submissions')
            .select('結果')
            .range(from, from + step - 1);

          if (supabaseError) {
            throw supabaseError;
          }

          if (submissions && submissions.length > 0) {
            allSubmissions = allSubmissions.concat(submissions);
            from += step;
            // If we got exactly 1000 rows, there might be more. If less, we're done.
            if (submissions.length < step) {
              fetchMore = false;
            }
          } else {
            fetchMore = false;
          }
        }

        console.log("Total rows fetched:", allSubmissions.length);

        let ac = 0;
        let wa = 0;
        let tle = 0;

        // Client-side computation for KPIs
        allSubmissions.forEach((sub) => {
          const result = sub['結果'];
          if (result === 'AC') ac++;
          else if (result === 'WA') wa++;
          else if (result === 'TLE') tle++;
        });

        setData({ ac, wa, tle });
      } catch (err: any) {
        console.error('Error fetching KPI data:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchKpiData();
  }, []);

  return { data, loading, error };
}
