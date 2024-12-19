import React, { ChangeEvent } from 'react';

interface UserInputProps {
  input: string;
  handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

const UserInput: React.FC<UserInputProps> = ({ 
  input, 
  handleChange 
}) => {
  return (
    <div className='my-4 md:px-14 px-0 max-w-[900px] w-full'>
      <h3 className='text-sm text-gray-400'>Je antwoord:</h3>
      <textarea
        value={input}
        onChange={handleChange}
        className='w-full border-none p-2 dark:bg-gray-700'
        rows={3}
      />
    </div>
  );
};

export default UserInput;