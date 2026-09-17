import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TablePagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemLabel = 'records'
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to generate clean page numbers with ellipsis when > 5 pages
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-2 px-1 py-0.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="font-mono-signal text-[11px] text-[#647895]">
        Showing <strong className="text-[#203247] font-semibold">{startItem}</strong> to{' '}
        <strong className="text-[#203247] font-semibold">{endItem}</strong> of{' '}
        <strong className="text-[#203247] font-semibold">{totalItems}</strong> {itemLabel}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-full border border-[#203247]/15 bg-white text-[#203247] hover:bg-[#f5f3ed] disabled:opacity-35 disabled:cursor-not-allowed font-medium transition-colors text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            aria-label="Previous Page"
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-[#647895] text-xs font-mono-signal select-none">
                    …
                  </span>
                );
              }
              const isActive = currentPage === p;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-full text-xs font-mono-signal flex items-center justify-center transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-[#203247] text-[#f6f3eb] font-semibold shadow-xs'
                      : 'bg-transparent text-[#647895] hover:bg-[#203247]/5 hover:text-[#203247]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-full border border-[#203247]/15 bg-white text-[#203247] hover:bg-[#f5f3ed] disabled:opacity-35 disabled:cursor-not-allowed font-medium transition-colors text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
