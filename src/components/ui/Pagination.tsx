import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number,
  page: number,
  itemsPerPage: number,
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  itemsPerPage,
  total,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / itemsPerPage);
  const [inputPage, setInputPage] = useState(page);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (value.length > 1 && value.startsWith('0')) {
      value = value.replace(/^0+/, ''); // Remove leading zeros
    }
    setInputPage(Number(value));
  };

  const goToPage = () => {
    if (inputPage >= 1 && inputPage <= totalPages) {
      onPageChange(inputPage);
    }
  };

  const onPageNumberChange = (pageNumber: number) => {
    setInputPage(pageNumber);
    onPageChange(pageNumber)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm dark:text-gray-300 text-gray-500">
        Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, total)} of {total} entries
      </div>
      {/* New input and button for navigating to specific page */}
      <div>
        <button
          onClick={goToPage}
          className="p-2 mr-2 rounded-lg text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          Go to page
        </button>
        <input
          type="number"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && goToPage()}
          className="w-16 p-1 border rounded text-sm text-black dark:text-white"
        />

      </div>
      <div className="flex items-center space-x-2">
        <button
          className="p-2 rounded-lg dark:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => onPageNumberChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm dark:text-white">
          Page {page} of {totalPages || 1}
        </span>
        <button
          className="p-2 rounded-lg dark:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => onPageNumberChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;