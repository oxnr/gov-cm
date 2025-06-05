import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function EnhancedPagination({ 
  currentPage, 
  totalPages, 
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange 
}: EnhancedPaginationProps) {
  // Ensure we have valid numbers
  const safeCurrentPage = Number(currentPage) || 1;
  const safePageSize = Number(pageSize) || 25;
  const safeTotalItems = Number(totalItems) || 0;
  const safeTotalPages = Number(totalPages) || 1;
  
  const startItem = safeTotalItems > 0 ? (safeCurrentPage - 1) * safePageSize + 1 : 0;
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems);
  
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {safeTotalItems > 0 ? (
            <>
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{safeTotalItems}</span> results
            </>
          ) : (
            'No results found'
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            safeCurrentPage === 1 && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          title="First page"
        >
          <CaretDoubleLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" weight="bold" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            safeCurrentPage === 1 && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          title="Previous page"
        >
          <CaretLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" weight="bold" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 text-gray-400 dark:text-gray-600">•••</span>
              )}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
                page === safeCurrentPage
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
            >
              {page}
            </button>
          ))}

          {endPage < safeTotalPages && (
            <>
              {endPage < safeTotalPages - 1 && (
                <span className="px-2 text-gray-400 dark:text-gray-600">•••</span>
              )}
              <button
                onClick={() => onPageChange(safeTotalPages)}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {safeTotalPages}
              </button>
            </>
          )}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            safeCurrentPage === safeTotalPages && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          title="Next page"
        >
          <CaretRight className="h-4 w-4 text-gray-600 dark:text-gray-400" weight="bold" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            safeCurrentPage === safeTotalPages && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          title="Last page"
        >
          <CaretDoubleRight className="h-4 w-4 text-gray-600 dark:text-gray-400" weight="bold" />
        </button>
      </nav>
    </div>
  );
}