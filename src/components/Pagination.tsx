// Pagination.tsx
import React from 'react';
import { Button } from './ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageRange = 2; // Number of pages to show before and after the current page
  const pages: (number | string)[] = [];

  // Add first page
  if (currentPage > pageRange + 1) {
    pages.push(1);
  }

  // Add ellipsis if needed
  if (currentPage > pageRange + 2) {
    pages.push('...');
  }

  // Add pages around the current page
  for (let i = Math.max(1, currentPage - pageRange); i <= Math.min(totalPages, currentPage + pageRange); i++) {
    pages.push(i);
  }

  // Add ellipsis if needed
  if (currentPage < totalPages - pageRange - 1) {
    pages.push('...');
  }

  // Add last page
  if (currentPage < totalPages - pageRange) {
    pages.push(totalPages);
  }

  return (
    <div className='flex items-center justify-center my-4'>
      {pages.map((page, index) => (
        <Button
          variant={`${page === currentPage ? "outline" : "ghost"}`}
          key={index}
          onClick={() => {
            if (typeof page === 'number' && page !== currentPage) {
              onPageChange(page);
            }
          }}
          // disabled={currentPage === page}
          className={`${page === currentPage ? 'font-bold' : ''}`}
        >
          {page}
        </Button>
      ))}
    </div>
  );
};

export default Pagination;