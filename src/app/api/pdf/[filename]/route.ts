import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Define the path to the PDF file
  const pdfPath = path.join(process.cwd(), "private", filename);

  // Check if the file exists
  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Create a readable stream from the PDF file
  const fileStream = fs.createReadStream(pdfPath);

  // Create a ReadableStream for the Response
  const readableStream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      fileStream.on("end", () => {
        controller.close();
      });
      fileStream.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  // Set the appropriate headers
  const response = new Response(readableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });

  return response;
}
