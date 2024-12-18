import { GoogleGenerativeAI } from "@google/generative-ai";

interface EvaluationResult {
  feedback: string;
  result: "voldoende" | "onvoldoende";
  possibleAnswers: string[];
}

export async function evaluateAnswer(
  pdfBase64: string, // Change parameter name to reflect that it's a PDF
  studentAnswer: string
): Promise<EvaluationResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Invalid/Missing environment variable: "GEMINI_API_KEY"');
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // This model supports image + text inputs
  });

  // Ensure the pdfBase64 is in the correct format
  if (pdfBase64.startsWith("data:application/pdf;base64,")) {
    // Extract only the Base64 part
    pdfBase64 = pdfBase64.split(",")[1];
  }

  // Prepare the prompt to explicitly request JSON format
  const prompt = `Evalueer het antwoord van de student met speciale aandacht voor het taalniveau van de voorbeeldafbeelding.

    Beantwoord ALLEEN in de volgende strikte JSON-indeling:
    {
      "feedback": "Persoonlijke, gerichte feedback aan de student, specifiek gericht op taalniveau",
      "result": "voldoende" of "onvoldoende",
      "possibleAnswers": [
        "EXACTE TEKST UIT DE VOORBEELDAFBEELDING", 
        "Alternatieve suggestie 1 op hetzelfde taalniveau", 
        "Alternatieve suggestie 2 op hetzelfde taalniveau", 
        "Alternatieve suggestie 3 op hetzelfde taalniveau", 
        "Alternatieve suggestie 4 op hetzelfde taalniveau"
      ]
    }

    Belangrijke instructies:
    - De EERSTE suggestie MOET de exacte tekst zijn uit de voorbeeldafbeelding
    - Zorg ervoor dat de 4 extra suggesties EXACT hetzelfde taalniveau hebben
    - Analyseer zorgvuldig het taalniveau van de voorbeeldafbeelding
    - Let op woordkeuze, zinsstructuur, grammaticale complexiteit en woordenschat

    Beoordelingscriteria:
    - Past jouw antwoord qua taalgebruik bij het niveau van de voorbeeldtekst?
    - Gebruik je vergelijkbare zinsconstructies?
    - Is je woordkeuze vergelijkbaar met de voorbeeldtekst?
    - Toon je hetzelfde taalbeheersingsniveau?

    Geef suggesties die:
    - Qua lengte vergelijkbaar zijn met de voorbeeldtekst
    - Dezelfde grammaticale structuren gebruiken
    - Hetzelfde taalregister hanteren
    - Inhoudelijk vergelijkbaar zijn met de oorspronkelijke tekst

    Vraagafbeelding: [Afbeelding]
    Jouw antwoord: ${studentAnswer}

    BELANGRIJK: Zorg ervoor dat de reactie een geldig JSON-object is zonder extra tekst.`;

  try {
    // Send multi-modal input to Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf", // Change MIME type to PDF
                data: pdfBase64, // Use the PDF base64 data
              },
            },
          ],
        },
      ],
    });

    // Process the response
    const response = await result.response;
    const responseText = response.text();

    // Clean the response text
    const cleanedResponseText = responseText
      .trim() // Remove leading/trailing whitespace
      .replace(/```json|```/g, ""); // Remove any backticks and "json" labels

    console.log(cleanedResponseText);

    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(cleanedResponseText);
      return {
        feedback:
          parsedResponse.feedback || "Geen gedetailleerde feedback gegeven",
        result: parsedResponse.result || "onvoldoende",
        possibleAnswers: parsedResponse.possibleAnswers || [],
      };
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", responseText);
      console.error(jsonError);
      return {
        feedback: "Fout bij het verwerken van de AI-reactie",
        result: "onvoldoende",
        possibleAnswers: [],
      };
    }
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return {
      feedback: "Er is een onverwachte fout opgetreden tijdens de evaluatie",
      result: "onvoldoende",
      possibleAnswers: [],
    };
  }
}
