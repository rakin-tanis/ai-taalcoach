import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

const imageCache = new Map<string, string>();

export const convertPdfPageToImage = async (
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
      throw new Error(`PDF file not found: ${pdfFilename}`);
    }

    // Read PDF file
    const pdfBuffer = await fs.readFile(pdfPath);

    // Load PDF
    pdfDoc = await PDFDocument.load(pdfBuffer);

    // Validate page number
    const totalPages = pdfDoc.getPageCount();
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(`Invalid page number. Total pages: ${totalPages}`);
    }

    // Fallback to SVG placeholder
    const base64Image = generateDetailedPlaceholderImage(
      pdfFilename, 
      pageNumber, 
      totalPages
    );

    // Cache the result
    imageCache.set(cacheKey, base64Image);

    return base64Image;
  } catch (error) {
    console.error("PDF page extraction error:", error);

    // Fallback to basic placeholder
    return generateSimplePlaceholderImage(pageNumber, 1);
  }
};

function generateDetailedPlaceholderImage(
  filename: string,
  currentPage: number,
  totalPages: number
): string {
  // Create an SVG with more detailed information
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" style="background-color: #f0f0f0;">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e0e0e0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5f5f5;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
      
      <text 
        x="50%" 
        y="30%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="20" 
        fill="#666666"
      >
        PDF: ${filename}
      </text>
      
      <text 
        x="50%" 
        y="40%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="36" 
        font-weight="bold" 
        fill="#333333"
      >
        Page ${currentPage} of ${totalPages}
      </text>
      
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        fill="#888888"
      >
        Preview Unavailable
      </text>
      
      <rect 
        x="10%" 
        y="60%" 
        width="80%" 
        height="5" 
        fill="#cccccc"
      />
    </svg>
  `;

  // Convert SVG to base64
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

function generateSimplePlaceholderImage(
  currentPage: number,
  totalPages: number
): string {
  // Create a basic SVG placeholder
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="white"/>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        fill="black"
      >
        Page ${currentPage} - Preview Not Available
      </text>
    </svg>
  `;

  // Convert SVG to base64
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

// Optional debugging function
export const logPdfDetails = async (pdfFilename: string) => {
  try {
    const pdfPath = path.join(process.cwd(), "private", pdfFilename);
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    console.log({
      filename: pdfFilename,
      totalPages: pdfDoc.getPageCount(),
      path: pdfPath
    });
  } catch (error) {
    console.error("PDF logging error:", error);
  }
};