import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const imageCache = new Map<string, string>();

export const extractPdfPage = async (
  pdfFilename: string,
  pageNumber: number
): Promise<string> => {
  let pdfDoc;
  try {
    const cacheKey = `${pdfFilename}-page-${pageNumber}`;

    // Check cache first
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    // Construct full path to PDF
    const pdfPath = path.join(process.cwd(), "private", pdfFilename);

    try {
      await fs.access(pdfPath);
    } catch (error) {
      console.log(`PDF file not found: ${pdfFilename}`, error);
      throw new Error(`PDF file not found: ${pdfFilename}`);
    }

    // Read PDF file
    const pdfBuffer = await fs.readFile(pdfPath);

    // Load PDF
    pdfDoc = await PDFDocument.load(pdfBuffer);

    // Validate page number
    const pages = pdfDoc.getPages();
    const pagesCount = pages.length;
    if (pageNumber < 1 || pageNumber > pagesCount) {
      throw new Error(`Invalid page number. Total pages: ${pagesCount}`);
    }

    // Fallback to SVG placeholder
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]); // pageNumber is 1-based, but copyPages uses 0-based index
    newPdfDoc.addPage(copiedPage);
    const newPdfBytes = await newPdfDoc.save();
    const base64String = uint8ArrayToBase64(newPdfBytes);

    // Cache the result
    imageCache.set(cacheKey, base64String);

    return base64String;
  } catch (error) {
    console.error("PDF page extraction error:", error);

    // Fallback to detailed placeholder
    return generatePdfPlaceholder(
      pdfFilename,
      pageNumber,
      pdfDoc?.getPageCount() || 1
    );
  }
};

export const generatePdfPlaceholder = async (
  filename: string,
  currentPage: number,
  totalPages: number
): Promise<string> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a blank page
  const page = pdfDoc.addPage([800, 600]); // Width: 800, Height: 600

  // Draw a background rectangle
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    color: rgb(0.941, 0.941, 0.941), // Light gray background
  });

  // Add text for the filename
  page.drawText(`PDF: ${filename}`, {
    x: 50,
    y: 500,
    size: 20,
    color: rgb(0.4, 0.4, 0.4), // Dark gray
  });

  // Add text for the current page and total pages without specifying a font
  page.drawText(`Page ${currentPage} of ${totalPages}`, {
    x: 50,
    y: 450,
    size: 36,
    color: rgb(0.2, 0.2, 0.2), // Darker gray
  });

  // Add text for the unavailable preview message
  page.drawText("Preview Unavailable", {
    x: 50,
    y: 400,
    size: 24,
    color: rgb(0.533, 0.533, 0.533), // Medium gray
  });

  // Draw a horizontal line
  page.drawLine({
    start: { x: 80, y: 350 },
    end: { x: 720, y: 350 },
    thickness: 5,
    color: rgb(0.8, 0.8, 0.8), // Light gray line
  });

  // Serialize the PDF document to bytes (Buffer)
  const pdfBytes = await pdfDoc.save();
  const base64String = uint8ArrayToBase64(pdfBytes);

  return base64String;
};

const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  // Convert Uint8Array to a string
  const binaryString = String.fromCharCode(...uint8Array);
  const prefix = 'data:application/pdf;base64,';
  // Convert the binary string to Base64
  return prefix + btoa(binaryString);
};