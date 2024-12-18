import { EvaluationResponse } from '@/hooks/useEvaluation';
import React from 'react';

interface EvaluationResultsProps {
  isLoading: boolean;
  evaluationError: string | null;
  data: EvaluationResponse | null
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({
  isLoading,
  evaluationError,
  data
}) => {
  if (!data) return null;

  return (
    <div className='mt-10 mb-40 md:px-14 max-w-[650px]'>
      {isLoading && <div>Je antwoord wordt geanalyseerd...</div>}
      {evaluationError && <div>{evaluationError}</div>}
      {data && (
        <div>
          <h2 
            className={`
              ${data.answer.result === 'voldoende' 
                ? 'text-green-400' 
                : 'text-red-500'
              } 
              capitalize underline text-lg font-bold p-4
            `}
          >
            {data.answer.result}
          </h2>
          {data.answer.feedback}
          <div className='flex flex-col gap-4 mt-4'>
            {data.answer.possibleAnswers.map(pa => (
              <div 
                key={pa} 
                className='bg-green-600 text-white font-semibold p-4'
              >
                - {pa}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationResults;