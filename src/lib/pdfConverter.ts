import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const convertPdfPageToImage = async (
  pdfFilename: string,
  pageNumber: number
): Promise<string> => {
  let browser = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    // Adjust the URL based on your serverless environment
    const viewerPath = `${baseUrl}/pdf-viewer.html`;
    const pdfApiUrl = `${baseUrl}/api/pdf/${pdfFilename}`;

    console.log('PDF Conversion Details:', { baseUrl, viewerPath, pdfApiUrl });

    await page.goto(
      `${viewerPath}?file=${encodeURIComponent(pdfApiUrl)}&page=${pageNumber}`,
      {
        waitUntil: "networkidle0",
        timeout: 30000, // Increased timeout
      }
    );

    // Wait for the PDF to render
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Take screenshot
    const imageBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    // Convert to buffer and base64
    const buffer = Buffer.isBuffer(imageBuffer)
      ? imageBuffer
      : Buffer.from(imageBuffer);

    return buffer.toString("base64");
  } catch (error) {
    console.error("Error converting PDF to image:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

async function getLaunchOptions() {
  // Vercel environment
  if (process.env.VERCEL) {
    return {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    };
  }

  // Local development
  return {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // Use the default Chrome installation path based on your OS
    executablePath: getLocalChromePath(),
  };
}

function getLocalChromePath() {
  const platform = process.platform;
  switch (platform) {
    case 'darwin': // macOS
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    case 'win32': // Windows
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    case 'linux':
      return '/usr/bin/google-chrome';
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function launchBrowser() {
  try {
    const options = await getLaunchOptions();
    
    // Use different launch method based on environment
    const browser = process.env.VERCEL 
      ? await puppeteerCore.launch(options)
      : await puppeteer.launch(options);

    return browser;
  } catch (error) {
    console.error('Browser launch error:', error);
    
    // Detailed error logging
    console.log('System details:', {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      isVercel: !!process.env.VERCEL,
    });

    throw error;
  }
}
