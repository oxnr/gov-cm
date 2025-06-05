'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlass, Funnel, CaretDown, CircleNotch, MapPin } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { Contract, ContractFilters } from '@/types/contract';
import { cn } from '@/lib/utils';
import ContractModal from '@/components/ContractModal';
import EnhancedPagination from '@/components/EnhancedPagination';
import dynamic from 'next/dynamic';
import { US_STATES } from '@/lib/states';
import { getContractCoordinates } from '@/lib/geo';

// Dynamic import for map component to avoid SSR issues
const MapRadiusSearch = dynamic(() => import('@/components/MapRadiusSearch'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
});

const AutocompleteInput = dynamic(() => import('@/components/AutocompleteInput'), {
  ssr: false,
  loading: () => <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
});

interface FilterOptions {
  types: string[];
  agencies: { name: string; subTiers: string[] }[];
  setAsides: string[];
  states: string[];
  naicsCodes: string[];
}

export default function FederalContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<ContractFilters>({
    sort_by: 'posted_date',
    sort_order: 'desc'
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [locationFilter, setLocationFilter] = useState<{lat: number; lng: number; radius: number; address: string} | null>(null);
  const [contractForMap, setContractForMap] = useState<{lat: number; lng: number; title: string; city?: string; state?: string} | null>(null);

  // Fetch filter options
  useEffect(() => {
    fetch('/api/contracts/filters')
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(console.error);
  }, []);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value.toString();
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await fetch(`/api/contracts?${params}`);
      const data = await response.json();
      
      setContracts(data.contracts);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: value }));
      setCurrentPage(1);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (key: keyof ContractFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Federal Contracts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse government contract opportunities from SAM.gov</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 relative">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" weight="bold" />
              <input
                type="text"
                placeholder="Search contracts by keyword, description, or agency..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowMapSearch(!showMapSearch)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200",
                showMapSearch
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              )}
            >
              <MapPin className="h-5 w-5" weight="duotone" />
              <span>Location</span>
              {locationFilter && ` (${locationFilter.radius}mi)`}
            </button>
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

          {/* Map Search Section - Full Width */}
          {showMapSearch && (
            <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto">
                <MapRadiusSearch
                onLocationSelect={(lat, lng, radius, address) => {
                  setLocationFilter({ lat, lng, radius, address });
                  // Add location filter to the filters
                  // You'll need to implement the backend API to handle location-based filtering
                  setFilters(prev => ({ 
                    ...prev, 
                    location_lat: lat,
                    location_lng: lng,
                    location_radius: radius
                  } as ContractFilters & {location_lat: number; location_lng: number; location_radius: number}));
                  setCurrentPage(1);
                }}
                initialLocation={locationFilter ? { lat: locationFilter.lat, lng: locationFilter.lng } : undefined}
                initialRadius={locationFilter?.radius}
                contractLocation={contractForMap}
                />
                {locationFilter && (
                  <button
                    onClick={() => {
                      setLocationFilter(null);
                      setContractForMap(null);
                      setFilters(prev => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { location_lat, location_lng, location_radius, ...rest } = prev as ContractFilters & {location_lat?: number; location_lng?: number; location_radius?: number};
                        return rest;
                      });
                      setCurrentPage(1);
                    }}
                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Clear location filter
                  </button>
                )}
              </div>
            </div>
          )}

          {showFilters && filterOptions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  value={filters.type || ''}
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agency</label>
                <AutocompleteInput
                  value={filters.department_agency || ''}
                  onChange={(value) => handleFilterChange('department_agency', value)}
                  options={filterOptions.agencies.flatMap(agency => [
                    { value: agency.name, label: agency.name },
                    ...agency.subTiers.map(subTier => ({
                      value: subTier,
                      label: subTier,
                      description: agency.name
                    }))
                  ])}
                  placeholder="Search agencies..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Set-Aside</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => handleFilterChange('set_aside', e.target.value)}
                  value={filters.set_aside || ''}
                >
                  <option value="">All Set-Asides</option>
                  {filterOptions.setAsides.map(setAside => (
                    <option key={setAside} value={setAside}>
                      {setAside.length > 50 ? setAside.substring(0, 50) + '...' : setAside}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NAICS Code</label>
                <AutocompleteInput
                  value={filters.naics_code || ''}
                  onChange={(value) => handleFilterChange('naics_code', value)}
                  options={filterOptions.naicsCodes.map((code: string) => ({
                    value: code,
                    label: code
                  }))}
                  placeholder="Search NAICS codes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <AutocompleteInput
                  value={filters.state || ''}
                  onChange={(value) => handleFilterChange('state', value)}
                  options={filterOptions.states.map(state => ({
                    value: state,
                    label: US_STATES[state] ? `${US_STATES[state]} (${state})` : state
                  }))}
                  placeholder="Search states..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posted After</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => handleFilterChange('posted_date_from', e.target.value)}
                  value={filters.posted_date_from || ''}
                />
              </div>
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
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No contracts found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('type')}
                  >
                    Type
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('department_agency')}
                  >
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Set Aside
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('posted_date')}
                  >
                    Posted
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('response_deadline')}
                  >
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    NAICS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedContract(contract);
                      // If map is open and contract has location, show it on the map
                      if (showMapSearch && contract.city && contract.state) {
                        const coords = getContractCoordinates(contract.city, contract.state);
                        if (coords) {
                          setContractForMap({
                            lat: coords.lat,
                            lng: coords.lng,
                            title: contract.title || 'Untitled Contract',
                            city: contract.city,
                            state: contract.state
                          });
                        }
                      }
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {contract.title || 'Untitled'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.department_agency || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {contract.set_aside || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.posted_date
                        ? format(new Date(contract.posted_date), 'MM/dd/yyyy')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.response_deadline
                        ? format(new Date(contract.response_deadline), 'MM/dd/yyyy')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
                      {contract.description || 'No description available'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.naics_code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {contract.city && contract.state 
                        ? `${contract.city}, ${contract.state}`
                        : contract.state || contract.city || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && contracts.length > 0 && (
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

      {/* Contract Modal */}
      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}