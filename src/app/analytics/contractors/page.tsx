'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlass, Buildings, CurrencyDollar, Trophy, CircleNotch, Funnel, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import EnhancedPagination from '@/components/EnhancedPagination';
import { US_STATES } from '@/lib/states';

interface ContractorData {
  contractor: string;
  location: string;
  totalAwards: number;
  awardCount: number;
  avgAwardSize: number;
  firstAward: string;
  lastAward: string;
}

export default function ContractorAnalysisPage() {
  const [contractors, setContractors] = useState<ContractorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stateFilter, setStateFilter] = useState<string>('');

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (stateFilter) {
        params.append('state', stateFilter);
      }

      selectedContractors.forEach(contractor => {
        params.append('contractor', contractor);
      });

      const response = await fetch(`/api/analytics/contractors?${params}`);
      const data = await response.json();
      
      setContractors(data.contractors);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedContractors, stateFilter]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const totalPages = Math.ceil(total / pageSize);

  // Calculate summary statistics
  const summaryStats = contractors.reduce((acc, contractor) => ({
    totalValue: acc.totalValue + contractor.totalAwards,
    totalContracts: acc.totalContracts + contractor.awardCount,
    avgContractSize: 0
  }), { totalValue: 0, totalContracts: 0, avgContractSize: 0 });
  
  summaryStats.avgContractSize = summaryStats.totalContracts > 0 
    ? summaryStats.totalValue / summaryStats.totalContracts 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contractor Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyze government contract awards by contractor
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" weight="bold" />
              <input
                type="text"
                placeholder="Search contractors by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Funnel className="h-5 w-5" weight="fill" />
              <span>Filters</span>
              <CaretDown className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "transform rotate-180"
              )} weight="bold" />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={stateFilter}
                >
                  <option value="">All States</option>
                  {Object.entries(US_STATES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Show</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  value={pageSize}
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          )}

          {selectedContractors.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Contractors ({selectedContractors.length}):</div>
              <div className="flex flex-wrap gap-2">
                {selectedContractors.map(contractor => (
                  <span
                    key={contractor}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                  >
                    {contractor}
                    <button
                      onClick={() => {
                        setSelectedContractors(prev => prev.filter(c => c !== contractor));
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedContractors([]);
                    setCurrentPage(1);
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      {!loading && contractors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Contract Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summaryStats.totalValue)}</p>
              </div>
              <CurrencyDollar className="h-8 w-8 text-green-500 dark:text-green-400" weight="duotone" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Awards</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summaryStats.totalContracts.toLocaleString()}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500 dark:text-blue-400" weight="duotone" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Award Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summaryStats.avgContractSize)}</p>
              </div>
              <Buildings className="h-8 w-8 text-purple-500 dark:text-purple-400" weight="duotone" />
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <CircleNotch className="h-8 w-8 animate-spin text-indigo-600" weight="bold" />
          </div>
        ) : contractors.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No contractors found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Awards
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    # Awards
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Award Size
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {contractors.map((contractor, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <button
                        onClick={() => {
                          if (!selectedContractors.includes(contractor.contractor)) {
                            setSelectedContractors(prev => [...prev, contractor.contractor]);
                            setCurrentPage(1);
                          }
                        }}
                        className="text-left hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {contractor.contractor}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {contractor.location && US_STATES[contractor.location] 
                        ? `${US_STATES[contractor.location]} (${contractor.location})`
                        : contractor.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                      {formatCurrency(contractor.totalAwards)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">
                      {contractor.awardCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">
                      {formatCurrency(contractor.avgAwardSize)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && contractors.length > 0 && (
          <EnhancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}