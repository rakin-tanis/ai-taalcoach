import { NextRequest, NextResponse } from "next/server";
import { convertPdfPageToImage } from "@/lib/pdfConverter";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionNumber = parseInt(searchParams.get("questionNumber") || "1");

    // Call the convertPdfPageToImage function
    const imageDataUrl = await convertPdfPageToImage(
      "SprekenAdAppel.pdf",
      questionNumber * 2 - 1
    );

    return NextResponse.json({ image: imageDataUrl });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
