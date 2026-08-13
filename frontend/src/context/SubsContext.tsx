import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SubmissionData {
  '網站': string;
  '結果': string;
  '完成時間': string;
  '題目名稱': string;
  '網址': string;
  '程式語言': string;
  'Code'?: string | null;
}

interface SubsContextType {
  data: SubmissionData[] | null;
  filteredData: SubmissionData[] | null;
  loading: boolean;
  error: string | null;
  selectedWebsite: string | null;
  selectedVerdict: string | null;
  setWebsiteFilter: (website: string | null) => void;
  setVerdictFilter: (verdict: string | null) => void;
  clearFilters: () => void;
}

export const SubsContext = createContext<SubsContextType>({
  data: null,
  filteredData: null,
  loading: true,
  error: null,
  selectedWebsite: null,
  selectedVerdict: null,
  setWebsiteFilter: () => { },
  setVerdictFilter: () => { },
  clearFilters: () => { },
});

export function SubsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubmissionData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);

  const setWebsiteFilter = (website: string | null) => {
    setSelectedWebsite(prev => prev === website ? null : website);
  };

  const setVerdictFilter = (verdict: string | null) => {
    setSelectedVerdict(prev => prev === verdict ? null : verdict);
  };

  const clearFilters = () => {
    setSelectedWebsite(null);
    setSelectedVerdict(null);
  };

  const filteredData = useMemo(() => {
    if (!data) return null;
    return data.filter(sub => {
      const matchWebsite = selectedWebsite ? sub['網站'] === selectedWebsite : true;
      const matchVerdict = selectedVerdict ? sub['結果'] === selectedVerdict : true;
      return matchWebsite && matchVerdict;
    });
  }, [data, selectedWebsite, selectedVerdict]);

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
            .select('"網站","結果","完成時間","題目名稱","網址","程式語言","Code"')
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
    <SubsContext.Provider value={{
      data,
      filteredData,
      loading,
      error,
      selectedWebsite,
      selectedVerdict,
      setWebsiteFilter,
      setVerdictFilter,
      clearFilters
    }}>
      {children}
    </SubsContext.Provider>
  );
}
