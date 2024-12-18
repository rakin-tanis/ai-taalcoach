import { useState } from 'react';

interface UsePdfDataResult {
  pdf: string | null;
  loading: boolean;
  error: string | null;
  fetchImageData: (questionNumber: number) => Promise<void>
}

const usePdfData = (): UsePdfDataResult => {
  const [pdf, setPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImageData = async (questionNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/question?questionNumber=${questionNumber}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      setPdf(data.pdf);
      console.log(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { fetchImageData, pdf, loading, error };
};

export default usePdfData;