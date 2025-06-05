import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { ContractFilters, ContractsResponse } from '@/types/contract';
import { calculateDistance, getContractCoordinates } from '@/lib/geo';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query parameters
    const filters: ContractFilters = {
      keyword: searchParams.get('keyword') || undefined,
      type: searchParams.get('type') || undefined,
      department_agency: searchParams.get('department_agency') || undefined,
      sub_tier: searchParams.get('sub_tier') || undefined,
      set_aside: searchParams.get('set_aside') || undefined,
      naics_code: searchParams.get('naics_code') || undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      posted_date_from: searchParams.get('posted_date_from') || undefined,
      posted_date_to: searchParams.get('posted_date_to') || undefined,
      response_deadline_from: searchParams.get('response_deadline_from') || undefined,
      response_deadline_to: searchParams.get('response_deadline_to') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '25'),
      sort_by: searchParams.get('sort_by') || 'posted_date',
      sort_order: (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc',
    };

    // Location-based filtering parameters
    const locationLat = searchParams.get('location_lat') ? parseFloat(searchParams.get('location_lat')!) : undefined;
    const locationLng = searchParams.get('location_lng') ? parseFloat(searchParams.get('location_lng')!) : undefined;
    const locationRadius = searchParams.get('location_radius') ? parseFloat(searchParams.get('location_radius')!) : undefined;

    // Get contracts from database (will use either Supabase or PostgreSQL based on mode)
    const result = await db.getContracts({
      ...filters,
      locationLat,
      locationLng,
      locationRadius
    });

    // Apply location-based filtering if needed
    let filteredContracts = result.contracts;
    if (locationLat && locationLng && locationRadius) {
      filteredContracts = result.contracts.filter(contract => {
        const coords = getContractCoordinates(contract);
        if (!coords) return false;
        
        const distance = calculateDistance(
          locationLat,
          locationLng,
          coords.lat,
          coords.lng
        );
        
        return distance <= locationRadius;
      });
    }

    const response: ContractsResponse = {
      contracts: filteredContracts,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}