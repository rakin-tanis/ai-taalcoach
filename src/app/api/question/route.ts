import { NextRequest, NextResponse } from "next/server";
import { extractPdfPage } from "@/lib/pdfConverter";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionNumber = parseInt(searchParams.get("questionNumber") || "1");

    // Call the convertPdfPageToImage function
    const pdfBase64String = await extractPdfPage(
      "SprekenAdAppel.pdf",
      questionNumber * 2 - 1
    );

    return NextResponse.json({ pdf: pdfBase64String });
  } catch (err) {
    console.error("Failed to fetch question:", err);
    return NextResponse.json(
      { error: "Failed to fetch question", err },
      { status: 500 }
    );
  }
}
