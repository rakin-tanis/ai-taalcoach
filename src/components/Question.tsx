'use client'

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useEvaluation } from '@/hooks/useEvaluation';
import usePdfData from '@/hooks/usePdfData';
import Pagination from './Pagination';
import MobileDebugger from './MobileDebugger';
import QuestionImageNavigator from './QuestionImageNavigator';
import UserInput from './UserInput';
import RecordingControls from './RecordingControls';
import EvaluationResults from './EvaluationResults';

const MAX_QUESTION_NUMBER = 350;

const Question: React.FC = () => {
  // State management
  const [questionNumber, setQuestionNumber] = useState(1);
  const [transcript, setTranscript] = useState<string>('');
  const [recording, setRecording] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const recordingRef = useRef('');

  // Custom hooks
  const {
    evaluate,
    isLoading: isEvaluating,
    error: evaluationError,
    data: evaluationData
  } = useEvaluation();

  const {
    fetchImageData,
    images,
    skeletons,
    loading: imageLoading,
    error: imageError
  } = usePdfData();

  useEffect(() => {
    recordingRef.current = recording
  }, [recording])

  // Memoized image loading function
  const loadPdfAndConvertPageToImage = useCallback(async () => {
    try {
      await fetchImageData(questionNumber);
    } catch (error) {
      console.error("Error converting PDF page to image:", error);
    }
  }, [questionNumber]);

  // Image loading effect
  useEffect(() => {
    loadPdfAndConvertPageToImage();
  }, [loadPdfAndConvertPageToImage]);


  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(event.target.value);
  };

  const handleSubmit = async () => {
    if (!transcript) {
      alert('Please record your answer first.');
      return;
    }

    setShowResults(true);
    try {
      await evaluate(questionNumber, transcript);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your answer. Please try again.');
    }
  };

  const handlePrevious = () => {
    if (questionNumber > 1) {
      setQuestionNumber(prev => prev - 1);
      resetQuestionState();
    }
  };

  const handleNext = () => {
    if (questionNumber < MAX_QUESTION_NUMBER) {
      setQuestionNumber(prev => prev + 1);
      resetQuestionState();
    }
  };

  const goToPage = (page: number) => {
    if (page > 0 && page <= MAX_QUESTION_NUMBER) {
      setQuestionNumber(page);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setTranscript('');
    setShowResults(false);
  };

  const onPause = () => {
    setTranscript(prev => prev + " " + recordingRef.current);
    recordingRef.current = ""
    setRecording("")
  }

  return (
    <div className='flex flex-col items-center relative'>
      {/* Image Navigator */}
      <QuestionImageNavigator
        questionNumber={questionNumber}
        images={images}
        skeletons={skeletons}
        imageLoading={imageLoading}
        imageError={imageError}
        isLoading={isEvaluating}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      />

      {/* Pagination */}
      <Pagination
        currentPage={questionNumber}
        totalPages={MAX_QUESTION_NUMBER}
        onPageChange={goToPage}
      />

      {/* Transcript Input */}
      <UserInput
        input={transcript + (recording ? " " + recording : "")}
        handleChange={handleChange}
      />

      {/* Recording Controls */}
      <RecordingControls
        isLoading={isEvaluating}
        imageLoading={imageLoading}
        onTranscriptChange={setRecording}
        onRecordingPause={onPause}
        onSubmit={handleSubmit}
      />

      {/* Evaluation Results */}
      {
        showResults && (
          <EvaluationResults
            isLoading={isEvaluating}
            evaluationError={evaluationError}
            data={evaluationData}
          />
        )
      }

      {/* Mobile Debugger for Non-Production */}
      {process.env.NODE_ENV !== 'production' && <MobileDebugger />}
    </div >
  );
};

export default Question;