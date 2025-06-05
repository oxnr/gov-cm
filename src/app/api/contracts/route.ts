import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContractFilters, ContractsResponse } from '@/types/contract';
import { calculateDistance, getContractCoordinates } from '@/lib/geo';

export async function GET(request: NextRequest) {
  try {
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

    // Build query
    let query = supabase
      .from('contracts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.keyword) {
      query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,department_agency.ilike.%${filters.keyword}%,sub_tier.ilike.%${filters.keyword}%,office.ilike.%${filters.keyword}%`);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.department_agency) {
      query = query.eq('department_agency', filters.department_agency);
    }

    if (filters.sub_tier) {
      query = query.eq('sub_tier', filters.sub_tier);
    }

    if (filters.set_aside) {
      query = query.eq('set_aside', filters.set_aside);
    }

    if (filters.naics_code) {
      query = query.eq('naics_code', filters.naics_code);
    }

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.city) {
      query = query.ilike('city', `${filters.city}%`);
    }

    if (filters.posted_date_from) {
      query = query.gte('posted_date', filters.posted_date_from);
    }

    if (filters.posted_date_to) {
      query = query.lte('posted_date', filters.posted_date_to);
    }

    if (filters.response_deadline_from) {
      query = query.gte('response_deadline', filters.response_deadline_from);
    }

    if (filters.response_deadline_to) {
      query = query.lte('response_deadline', filters.response_deadline_to);
    }

    // Apply sorting
    const sortColumn = filters.sort_by || 'posted_date';
    const ascending = filters.sort_order === 'asc';
    query = query.order(sortColumn, { ascending, nullsFirst: false });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: contracts, error, count } = await query;

    if (error) {
      throw error;
    }

    // Apply location-based filtering if needed
    let filteredContracts = contracts || [];
    if (locationLat && locationLng && locationRadius) {
      filteredContracts = contracts?.filter(contract => {
        const coords = getContractCoordinates(contract.city, contract.state);
        if (!coords) return false;
        
        const distance = calculateDistance(
          locationLat,
          locationLng,
          coords.lat,
          coords.lng
        );
        
        return distance <= locationRadius;
      }) || [];
    }

    const response: ContractsResponse = {
      contracts: filteredContracts,
      total: count || 0,
      page: page,
      limit: limit,
      total_pages: Math.ceil((count || 0) / limit),
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