import { NextRequest, NextResponse } from "next/server";
import { convertPdfPageToImage } from "@/lib/pdfConverter";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const questionNumber = parseInt(searchParams.get("questionNumber") || "1");

    // Call the convertPdfPageToImage function
    console.log("get image ----------")
    const imageDataUrl = await convertPdfPageToImage(
      "SprekenAdAppel.pdf",
      questionNumber * 2 - 1
    );
    console.log("get image ----------" + imageDataUrl.substring(0, 30))

    return NextResponse.json({ image: imageDataUrl });
  } catch (err) {
    console.error("Failed to fetch question:", err);
    return NextResponse.json(
      { error: "Failed to fetch question", err },
      { status: 500 }
    );
  }
}
