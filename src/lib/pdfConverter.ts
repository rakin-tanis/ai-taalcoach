import puppeteer, { Page } from "puppeteer";

export const convertPdfPageToImage = async (
  pdfFilename: string,
  pageNumber: number
): Promise<string> => {
  const baseUrl = process.env.BASE_URL;
  console.log("convertPdfPageToImage ----------" + baseUrl)

  const browser = await puppeteer.launch();
  const page: Page = await browser.newPage();

  // Open the PDF viewer HTML file and pass the PDF path and page number
  // const viewerPath = path.join(__dirname, "pdf-viewer.html"); // Adjust the path as needed
  const viewerPath = `${baseUrl}/pdf-viewer.html`;
  const pdfApiUrl = `${baseUrl}/api/pdf/${pdfFilename}`;

  console.log(viewerPath, pdfApiUrl, `${viewerPath}?file=${encodeURIComponent(pdfApiUrl)}&page=${pageNumber}`)

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
