'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CircleNotch } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SpendDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filters: {
    groupBy: string;
    value: string;
  };
}

interface Contract {
  id: number;
  title: string;
  department_agency: string;
  sub_tier: string;
  award_amount: number;
  posted_date: string;
  awardee: string;
  city: string;
  state: string;
  naics_code?: string;
}

export default function SpendDetailModal({ isOpen, onClose, title, filters }: SpendDetailModalProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        sort_by: 'award_amount',
        sort_order: 'desc',
        has_award_amount: 'true', // Only show contracts with award amounts
      });

      // Add appropriate filter based on groupBy
      if (filters.groupBy === 'geography') {
        params.append('state', filters.value);
      } else if (filters.groupBy === 'agency') {
        params.append('department_agency', filters.value);
      } else if (filters.groupBy === 'naics') {
        // Use the exact NAICS code for filtering
        params.append('naics_code', filters.value);
      }

      const response = await fetch(`/api/contracts?${params}`);
      const data = await response.json();
      
      setContracts(data.contracts);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters, pageSize]);

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
    }
  }, [isOpen, fetchContracts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title} - Contract Details
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <X className="h-6 w-6" weight="bold" />
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div>Showing {contracts.length > 0 ? ((page - 1) * pageSize + 1) : 0} to{' '}
              {Math.min(page * pageSize, total)} of {total} contracts</div>
              {contracts.length > 0 && (
                <div className="mt-1 text-sm">
                  Page total: {formatCurrency(contracts.reduce((sum, c) => sum + (c.award_amount || 0), 0))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <CircleNotch className="h-8 w-8 animate-spin text-indigo-600" weight="bold" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No contracts found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Agency
                      </th>
                      {filters.groupBy === 'naics' && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          NAICS
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Awardee
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {contract.title || 'Untitled'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>{contract.department_agency}</div>
                          {contract.sub_tier && contract.sub_tier !== contract.department_agency && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">{contract.sub_tier}</div>
                          )}
                        </td>
                        {filters.groupBy === 'naics' && (
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {contract.naics_code || 'N/A'}
                          </td>
                        )}
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>{contract.awardee || 'N/A'}</div>
                          {contract.city && contract.state && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {contract.city}, {contract.state}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                          {contract.award_amount ? formatCurrency(contract.award_amount) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {contract.posted_date
                            ? format(new Date(contract.posted_date), 'MM/dd/yyyy')
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md",
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md",
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}