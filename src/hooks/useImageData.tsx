import { useState } from 'react';

interface UseImageDataResult {
  image: string | null;
  loading: boolean;
  error: string | null;
  fetchImageData: (questionNumber: number) => Promise<void>
}

const useImageData = (): UseImageDataResult => {
  const [image, setImage] = useState<string | null>(null);
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
      console.log(data.image)
      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { fetchImageData, image, loading, error };
};

export default useImageData;