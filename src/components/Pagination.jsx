import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-semibold text-slate-700">{start}</span>-
        <span className="font-semibold text-slate-700">{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span>
      </div>

      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition ${
                currentPage === p
                  ? 'bg-[#ed7a1c] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-orange-50 hover:text-[#ed7a1c]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
