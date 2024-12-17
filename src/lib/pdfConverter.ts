// import * as pdfjsLib from "pdfjs-dist";
// import { GlobalWorkerOptions } from "pdfjs-dist";

// Set up PDF.js worker
// GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

/**
 * Converts a specific page of a PDF to an image
 * @param pdfFile - The PDF file to convert
 * @param pageNumber - The page number to convert (1-based index)
 * @param scale - Optional scale factor for the image (default is 1.5)
 * @returns Promise resolving to a base64 encoded image
 */
/* export async function convertPdfPageToImage(
  pdfFile: Blob,
  pageNumber: number,
  scale: number = 1.5
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Read the PDF file
      const arrayBuffer = await pdfFile.arrayBuffer();

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      // Check if page number is valid
      if (pageNumber < 1 || pageNumber > pdf.numPages) {
        throw new Error(`Invalid page number. PDF has ${pdf.numPages} pages.`);
      }

      // Get the specified page
      const page = await pdf.getPage(pageNumber);

      // Calculate viewport
      const viewport = page.getViewport({ scale });

      // Prepare canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Check if context is null
      if (!context) {
        throw new Error("Failed to get canvas context.");
      }

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to base64 image
      const imageDataUrl = canvas.toDataURL("image/png");

      resolve(imageDataUrl);
    } catch (error) {
      reject(error);
    }
  });
} */

import puppeteer, { Page } from "puppeteer";

export const convertPdfPageToImage = async (
  pdfFilename: string,
  pageNumber: number
): Promise<string> => {
  const browser = await puppeteer.launch();
  const page: Page = await browser.newPage();

  // Open the PDF viewer HTML file and pass the PDF path and page number
  // const viewerPath = path.join(__dirname, "pdf-viewer.html"); // Adjust the path as needed
  const viewerPath = `http://localhost:3000/pdf-viewer.html`;
  const pdfApiUrl = `http://localhost:3000/api/pdf/${pdfFilename}`;

  await page.goto(
    `${viewerPath}?file=${encodeURIComponent(pdfApiUrl)}&page=${pageNumber}`,
    { waitUntil: "networkidle0" }
  );

  // Wait for the PDF to render (you may need to adjust this)
  await page.waitForSelector("canvas"); // Wait for 5 seconds for the PDF to render

  // Now you can take a screenshot of the rendered PDF
  const imageBuffer = await page.screenshot({
    type: "png",
    fullPage: true, // Capture the full page
  });

  // Convert Uint8Array to Buffer if necessary
  const buffer = Buffer.isBuffer(imageBuffer)
    ? imageBuffer
    : Buffer.from(imageBuffer);

  await browser.close();
  return buffer.toString("base64"); // Return the image as a base64 string
};
