import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface UsePdfDataResult {
  image: string | null;
  loading: boolean;
  error: string | null;
  fetchImageData: (questionNumber: number) => Promise<void>
}

const usePdfData = (): UsePdfDataResult => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }, []);

  const convertPdfToImage = async (base64Pdf: string): Promise<string> => {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Pdf.replace(/^data:application\/pdf;base64,/, '');

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: atob(base64Data) });
      const pdf = await loadingTask.promise;

      // Get first page
      const page = await pdf.getPage(1);

      // Set canvas dimensions
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to get canvas context');
      }

      // Prepare canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Convert canvas to data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error converting PDF to image:', error);
      throw error;
    }
  };

  const fetchImageData = async (questionNumber: number) => {
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch(`/api/question?questionNumber=${questionNumber}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      const convertedImages = await convertPdfToImage(data.pdf);

      setImage(convertedImages);

      console.log(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { fetchImageData, image, loading, error };
};

export default usePdfData;