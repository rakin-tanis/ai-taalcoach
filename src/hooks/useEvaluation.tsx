import { useState } from 'react';

interface EvaluationResponse {
  answer: {
    feedback: string;
    result: "voldoende" | "onvoldoende";
    possibleAnswers: string[];
  },
  result: string
}

interface UseEvaluationHookReturn {
  evaluate: (questionNumber: number, studentAnswer: string) => Promise<EvaluationResponse>;
  isLoading: boolean;
  error: string | null;
  data: EvaluationResponse | null;
}

export const useEvaluation = (): UseEvaluationHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EvaluationResponse | null>(null);

  const evaluate = async (questionNumber: number, studentAnswer: string): Promise<EvaluationResponse> => {
    // Reset previous state
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionNumber,
          studentAnswer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Evaluation failed');
      }

      const responseData: EvaluationResponse = await response.json();

      // Update state
      setData(responseData);
      setIsLoading(false);

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

      // Update state
      setError(errorMessage);
      setIsLoading(false);

      throw err;
    }
  };

  return {
    evaluate,
    isLoading,
    error,
    data,
  };
};