'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, ChartBar, MapPin, Buildings, Hash, CircleNotch, Check, Funnel, CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import SpendDetailModal from '@/components/SpendDetailModal';
import { US_STATES } from '@/lib/states';
import dynamic from 'next/dynamic';

const AutocompleteInput = dynamic(() => import('@/components/AutocompleteInput'), {
  ssr: false,
  loading: () => <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
});

interface SpendData {
  name: string;
  state_name?: string;
  naics_title?: string;
  sub_tier?: string;
  years: {
    [year: string]: {
      contract_count: number;
      total_amount: number;
      avg_amount: number;
    };
  };
  total: number;
  contract_count: number;
}

interface FilterOption {
  value: string;
  label: string;
  sublabel?: string;
}

type GroupByType = 'geography' | 'agency' | 'naics';

export default function SpendAnalysisPage() {
  const [groupBy, setGroupBy] = useState<GroupByType>('geography');
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('graph');
  const [data, setData] = useState<SpendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{title: string; filters: {groupBy: string; value: string}} | null>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [naicsFilter, setNaicsFilter] = useState('');

  // Fetch filter options based on dimension
  const fetchFilterOptions = useCallback(async () => {
    try {
      if (groupBy === 'geography') {
        const response = await fetch('/api/contracts/filters');
        const data = await response.json();
        setFilterOptions(data.states.map((state: string) => ({ 
          value: state, 
          label: US_STATES[state] ? `${US_STATES[state]} (${state})` : state 
        })));
      } else if (groupBy === 'agency') {
        const response = await fetch('/api/contracts/filters');
        const data = await response.json();
        const options: FilterOption[] = [];
        data.agencies.forEach((agency: any) => {
          options.push({ value: agency.name, label: agency.name });
          agency.subTiers.forEach((subTier: string) => {
            if (subTier !== agency.name) {
              options.push({ value: subTier, label: subTier, sublabel: agency.name });
            }
          });
        });
        setFilterOptions(options);
      } else if (groupBy === 'naics') {
        const response = await fetch('/api/contracts/filters');
        const data = await response.json();
        // Fetch NAICS details to get descriptions
        const naicsResponse = await fetch('/api/analytics/naics-lookup');
        const naicsData = await naicsResponse.json();
        
        setFilterOptions(data.naicsCodes.map((code: string) => ({ 
          value: code, 
          label: naicsData[code] ? `${code} - ${naicsData[code]}` : code,
          sublabel: naicsData[code] || undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, [groupBy]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        groupBy,
        limit: viewMode === 'graph' ? '10' : '1000'
      });

      // Apply filters based on current groupBy dimension
      if (groupBy === 'geography' && stateFilter) {
        params.append('state', stateFilter);
      } else if (groupBy === 'agency' && agencyFilter) {
        params.append('agency', agencyFilter);
      } else if (groupBy === 'naics' && naicsFilter) {
        params.append('naics', naicsFilter);
      }

      const response = await fetch(`/api/analytics/spend?${params}`);
      const result = await response.json();
      
      setData(result.data || []);
      setIsLimited(result.isLimited);
    } catch (error) {
      console.error('Error fetching spend data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [groupBy, viewMode, stateFilter, agencyFilter, naicsFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const years = ['2020']; // Only 2020 data available

  const getIcon = () => {
    switch (groupBy) {
      case 'geography': return MapPin;
      case 'agency': return Buildings;
      case 'naics': return Hash;
    }
  };

  const Icon = getIcon();


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Spend Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Analyze government contract spending trends across three key dimensions
        </p>
      </div>

      {/* Dimension Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => {
                setGroupBy('geography');
                setStateFilter('');
                setAgencyFilter('');
                setNaicsFilter('');
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                groupBy === 'geography'
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <MapPin className="h-4 w-4" weight="duotone" />
              Geography
            </button>
            <button
              onClick={() => {
                setGroupBy('agency');
                setStateFilter('');
                setAgencyFilter('');
                setNaicsFilter('');
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                groupBy === 'agency'
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Buildings className="h-4 w-4" weight="duotone" />
              Agency
            </button>
            <button
              onClick={() => {
                setGroupBy('naics');
                setStateFilter('');
                setAgencyFilter('');
                setNaicsFilter('');
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2",
                groupBy === 'naics'
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Hash className="h-4 w-4" weight="duotone" />
              NAICS
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" /> {/* Spacer */}
            <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">View:</span>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === 'table'
                        ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    title="Table view"
                  >
                    <Table className="h-4 w-4" weight={viewMode === 'table' ? 'fill' : 'regular'} />
                  </button>
                  <button
                    onClick={() => setViewMode('graph')}
                    className={cn(
                      "p-2 rounded-md transition-all duration-200",
                      viewMode === 'graph'
                        ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    title="Graph view"
                  >
                    <ChartBar className="h-4 w-4" weight={viewMode === 'graph' ? 'fill' : 'regular'} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {groupBy === 'geography' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <AutocompleteInput
                    value={stateFilter}
                    onChange={setStateFilter}
                    options={filterOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label
                    }))}
                    placeholder="Search states..."
                  />
                </div>
              )}
              
              {groupBy === 'agency' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agency</label>
                  <AutocompleteInput
                    value={agencyFilter}
                    onChange={setAgencyFilter}
                    options={filterOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label,
                      description: opt.sublabel
                    }))}
                    placeholder="Search agencies..."
                  />
                </div>
              )}
              
              {groupBy === 'naics' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NAICS Code</label>
                  <AutocompleteInput
                    value={naicsFilter}
                    onChange={setNaicsFilter}
                    options={filterOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label,
                      description: opt.sublabel
                    }))}
                    placeholder="Search NAICS codes..."
                  />
                </div>
              )}
            </div>
          )}

          {viewMode === 'graph' && isLimited && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Showing top 10 results by total spending. View all results in Table mode.
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <CircleNotch className="h-8 w-8 animate-spin text-indigo-600" weight="bold" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No data available for the selected filters.
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {groupBy === 'geography' ? 'Location' : groupBy === 'agency' ? 'Agency' : 'NAICS Code'}
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-2">(Click for details)</span>
                  </th>
                  {years.map(year => (
                    <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {year}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedDetail({
                      title: groupBy === 'geography' && item.state_name 
                        ? `${item.state_name} (${item.name})`
                        : groupBy === 'naics' && item.naics_title
                        ? `${item.name} - ${item.naics_title}`
                        : item.name,
                      filters: { groupBy, value: item.name }
                    })}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <div>
                            {groupBy === 'geography' && item.state_name 
                              ? `${item.state_name} (${item.name})`
                              : groupBy === 'naics' && item.naics_title
                              ? `${item.name} - ${item.naics_title}`
                              : item.name}
                          </div>
                          {item.sub_tier && item.sub_tier !== item.name && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.sub_tier}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {years.map(year => (
                      <td key={year} className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {item.years[year] ? formatCurrency(item.years[year].total_amount) : '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      Total ({data.length})
                    </td>
                    {years.map(year => (
                      <td key={year} className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(
                          data.reduce((sum, item) => 
                            sum + (item.years[year]?.total_amount || 0), 0
                          )
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(data.reduce((sum, item) => sum + item.total, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Government Contract Spending Trends
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Top 10 {groupBy === 'geography' ? 'states' : groupBy === 'agency' ? 'agencies' : 'NAICS codes'} by total contract value
              </p>
            </div>
            
            {/* Simple Bar Chart Visualization */}
            <div className="space-y-4">
              {data.map((item, idx) => (
                <div 
                  key={idx} 
                  className="space-y-2 cursor-pointer"
                  onClick={() => setSelectedDetail({
                    title: groupBy === 'geography' && item.state_name 
                      ? `${item.state_name} (${item.name})`
                      : groupBy === 'naics' && item.naics_title
                      ? `${item.name} - ${item.naics_title}`
                      : item.name,
                    filters: { groupBy, value: item.name }
                  })}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {groupBy === 'geography' && item.state_name 
                        ? `${item.state_name} (${item.name})`
                        : groupBy === 'naics' && item.naics_title
                        ? `${item.name} - ${item.naics_title}`
                        : item.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-end pr-3"
                      style={{
                        width: `${(item.total / data[0].total) * 100}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {((item.total / data[0].total) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLimited && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setViewMode('table')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                >
                  View All in Table →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Spend Detail Modal */}
      {selectedDetail && (
        <SpendDetailModal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
          title={selectedDetail.title}
          filters={selectedDetail.filters}
        />
      )}
    </div>
  );
}