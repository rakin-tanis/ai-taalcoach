import { evaluateAnswer } from "@/lib/gemini";
import { extractPdfPage } from "@/lib/pdfConverter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { questionNumber, studentAnswer } = await req.json();

    // Ensure that imageBase64 and studentAnswer are provided
    if (!questionNumber || !studentAnswer) {
      return NextResponse.json(
        { error: "questionNumber and studentAnswer are required" },
        { status: 400 }
      );
    }
    const imageDataUrl = await extractPdfPage(
      'SprekenAdAppel.pdf',
      questionNumber * 2,
    );
    const answer = await evaluateAnswer(imageDataUrl, studentAnswer);
    console.log("answer");
    console.log(answer);
    return NextResponse.json({ answer, result: "success" }, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
