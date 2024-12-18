import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface UsePdfDataResult {
  images: string[] | null;
  skeletons: string[] | null;
  loading: boolean;
  error: string | null;
  fetchImageData: (questionNumber: number) => Promise<void>
}

const usePdfData = (): UsePdfDataResult => {
  const [images, setImages] = useState<string[] | null>(null);
  const [skeletons, setSkeletons] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    setSkeletons([createSkeletonImage(440, 405), createSkeletonImage(440, 90),])
  }, [])

  const createSkeletonImage = (width: number, height: number): string => {
    const skeletonCanvas = document.createElement('canvas');
    const skeletonContext = skeletonCanvas.getContext('2d');
  
    if (!skeletonContext) {
      throw new Error('Unable to get skeleton canvas context');
    }
  
    // Set the dimensions of the skeleton canvas
    skeletonCanvas.width = width;
    skeletonCanvas.height = height;
  
    // Fill the canvas with a light gray color (or any color you prefer)
    skeletonContext.fillStyle = '#e0e0e0'; // Light gray color
    skeletonContext.fillRect(0, 0, width, height);
  
    // Optionally, you can add a loading animation or pattern here
  
    // Convert skeleton canvas to data URL
    return skeletonCanvas.toDataURL('image/png');
  };

  const convertPdfToImage = async (base64Pdf: string): Promise<string[]> => {
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
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const context1 = canvas1.getContext('2d');
      const context2 = canvas2.getContext('2d');

      if (!context1 || !context2) {
        throw new Error('Unable to get canvas context');
      }

      // Prepare canvas
      canvas1.height = viewport.height;
      canvas1.width = viewport.width;
      canvas2.height = viewport.height;
      canvas2.width = viewport.width;

      // Render page to canvas
      const renderContext1 = {
        canvasContext: context1,
        viewport: viewport
      };
      const renderContext2 = {
        canvasContext: context2,
        viewport: viewport
      };

      await page.render(renderContext1).promise;
      await page.render(renderContext2).promise;

      // Convert canvas to data URL
      return [clipImage(canvas1, 0, 130, 440, 405), clipImage(canvas2, 450, 200, 440, 90) ];
    } catch (error) {
      console.error('Error converting PDF to image:', error);
      throw error;
    }
  };

  const clipImage = (
    canvas: HTMLCanvasElement,
    clipX: number,
    clipY: number,
    clipWidth: number,
    clipHeight: number
  ): string => {
    // Create a new canvas for the clipped image
    const clippedCanvas = document.createElement('canvas');
    const clippedContext = clippedCanvas.getContext('2d');

    if (!clippedContext) {
      throw new Error('Unable to get clipped canvas context');
    }
    
    // Set the dimensions of the clipped canvas
    clippedCanvas.width = clipWidth;
    clippedCanvas.height = clipHeight;

    // Draw the clipped area onto the new canvas
    clippedContext.drawImage(
      canvas,
      clipX, clipY, clipWidth, clipHeight, // Source rectangle
      0, 0, clipWidth, clipHeight // Destination rectangle
    );

    // Convert clipped canvas to data URL
    return clippedCanvas.toDataURL('image/png');
  };

  const fetchImageData = async (questionNumber: number) => {
    setLoading(true);
    setError(null);
    setImages(null);

    try {
      const response = await fetch(`/api/question?questionNumber=${questionNumber}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      const convertedImages = await convertPdfToImage(data.pdf);

      setImages(convertedImages);

      console.log(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { fetchImageData, images, skeletons, loading, error };
};

export default usePdfData;