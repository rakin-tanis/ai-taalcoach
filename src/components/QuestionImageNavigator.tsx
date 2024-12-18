import React from 'react';
import Image from 'next/image';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionImageNavigatorProps {
  questionNumber: number;
  images: string[] | null;
  skeletons: string[] | null;
  imageLoading: boolean;
  imageError: string | null;
  isLoading: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
}

const QuestionImageNavigator: React.FC<QuestionImageNavigatorProps> = ({
  questionNumber,
  images,
  skeletons,
  imageLoading,
  imageError,
  isLoading,
  handlePrevious,
  handleNext
}) => {
  return (
    <div className='relative w-full max-w-[900px] flex items-center'>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        disabled={questionNumber === 1 || isLoading || imageLoading}
        className='absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
                   md:relative md:mr-4 
                   bg-white/50 dark:bg-black/50 rounded-full shadow-md'
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className='flex-grow relative'>
        {imageLoading
          ? (skeletons && skeletons.map((skeleton, index) => (
              <Image
                key={index}
                src={skeleton}
                alt="question image"
                width={100}
                height={100}
                className="w-[550px]"
              />
            )))
          : imageError
          ? (<div>{imageError}</div>)
          : images && images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt="question image"
                width={100}
                height={100}
                className="w-[550px]"
              />
            ))
        }
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={questionNumber === 350 || isLoading || imageLoading}
        className='absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
                   md:relative md:ml-4 
                   bg-white/50 dark:bg-black/50 rounded-full shadow-md'
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default QuestionImageNavigator;