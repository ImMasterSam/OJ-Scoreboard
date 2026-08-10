import { createContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SubmissionData {
  '網站': string;
  '結果': string;
  '完成時間': string;
  '題目名稱': string;
  '網址': string;
}

interface SubsContextType {
  data: SubmissionData[] | null;
  loading: boolean;
  error: string | null;
}

export const SubsContext = createContext<SubsContextType>({
  data: null,
  loading: true,
  error: null,
});

export function SubsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubmissionData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubsData() {
      try {
        setLoading(true);
        let allSubmissions: SubmissionData[] = [];
        let from = 0;
        const step = 1000;
        let fetchMore = true;

        while (fetchMore) {
          const { data: submissions, error: supabaseError } = await supabase
            .from('Submissions')
            .select('"網站","結果","完成時間","題目名稱","網址"')
            .range(from, from + step - 1);

          if (supabaseError) {
            throw supabaseError;
          }

          if (submissions && submissions.length > 0) {
            allSubmissions = allSubmissions.concat(submissions as unknown as SubmissionData[]);
            from += step;
            if (submissions.length < step) {
              fetchMore = false;
            }
          } else {
            fetchMore = false;
          }
        }

        console.log("Total rows fetched:", allSubmissions.length);
        setData(allSubmissions);
      } catch (err: any) {
        console.error('Error fetching submissions data:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSubsData();
  }, []);

  return (
    <SubsContext.Provider value={{ data, loading, error }}>
      {children}
    </SubsContext.Provider>
  );
}
