import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
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

    // Build the WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCounter = 1;

    if (filters.keyword) {
      whereConditions.push(`(
        title ILIKE $${paramCounter} OR 
        description ILIKE $${paramCounter} OR 
        department_agency ILIKE $${paramCounter} OR
        sub_tier ILIKE $${paramCounter} OR
        office ILIKE $${paramCounter}
      )`);
      queryParams.push(`%${filters.keyword}%`);
      paramCounter++;
    }

    if (filters.type) {
      whereConditions.push(`type = $${paramCounter}`);
      queryParams.push(filters.type);
      paramCounter++;
    }

    if (filters.department_agency) {
      whereConditions.push(`department_agency = $${paramCounter}`);
      queryParams.push(filters.department_agency);
      paramCounter++;
    }

    if (filters.sub_tier) {
      whereConditions.push(`sub_tier = $${paramCounter}`);
      queryParams.push(filters.sub_tier);
      paramCounter++;
    }

    if (filters.set_aside) {
      whereConditions.push(`set_aside = $${paramCounter}`);
      queryParams.push(filters.set_aside);
      paramCounter++;
    }

    if (filters.naics_code) {
      whereConditions.push(`naics_code LIKE $${paramCounter}`);
      queryParams.push(`${filters.naics_code}%`);
      paramCounter++;
    }

    if (filters.state) {
      whereConditions.push(`state = $${paramCounter}`);
      queryParams.push(filters.state);
      paramCounter++;
    }

    if (filters.city) {
      whereConditions.push(`city = $${paramCounter}`);
      queryParams.push(filters.city);
      paramCounter++;
    }

    if (filters.posted_date_from) {
      whereConditions.push(`posted_date >= $${paramCounter}`);
      queryParams.push(filters.posted_date_from);
      paramCounter++;
    }

    if (filters.posted_date_to) {
      whereConditions.push(`posted_date <= $${paramCounter}`);
      queryParams.push(filters.posted_date_to);
      paramCounter++;
    }

    if (filters.response_deadline_from) {
      whereConditions.push(`response_deadline >= $${paramCounter}`);
      queryParams.push(filters.response_deadline_from);
      paramCounter++;
    }

    if (filters.response_deadline_to) {
      whereConditions.push(`response_deadline <= $${paramCounter}`);
      queryParams.push(filters.response_deadline_to);
      paramCounter++;
    }

    // Add filter for award amount if requested
    if (searchParams.get('has_award_amount') === 'true') {
      whereConditions.push(`award_amount IS NOT NULL AND award_amount > 0`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM contracts ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Calculate pagination
    const offset = (filters.page! - 1) * filters.limit!;
    const totalPages = Math.ceil(total / filters.limit!);

    // Get contracts - if location filtering, we need to get more and filter in memory
    let contractsQuery: string;
    let contractsToFetch = filters.limit!;
    let fetchOffset = offset;
    
    if (locationLat && locationLng && locationRadius) {
      // For location filtering, fetch more records to account for filtering
      contractsToFetch = filters.limit! * 10; // Fetch 10x to ensure we have enough after filtering
      contractsQuery = `
        SELECT * FROM contracts 
        ${whereClause}
        ORDER BY ${filters.sort_by} ${filters.sort_order}
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;
    } else {
      contractsQuery = `
        SELECT * FROM contracts 
        ${whereClause}
        ORDER BY ${filters.sort_by} ${filters.sort_order}
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;
    }
    
    queryParams.push(contractsToFetch, fetchOffset);
    
    let contractsResult = await pool.query(contractsQuery, queryParams);
    let contracts = contractsResult.rows;
    
    // Apply location filtering if needed
    if (locationLat && locationLng && locationRadius) {
      contracts = contracts.filter(contract => {
        const coords = getContractCoordinates(contract.city, contract.state);
        if (!coords) return false;
        
        const distance = calculateDistance(locationLat, locationLng, coords.lat, coords.lng);
        return distance <= locationRadius;
      });
      
      // If we don't have enough after filtering, fetch more
      while (contracts.length < filters.limit! && contractsResult.rows.length === contractsToFetch) {
        fetchOffset += contractsToFetch;
        queryParams[queryParams.length - 1] = fetchOffset;
        contractsResult = await pool.query(contractsQuery, queryParams);
        
        const moreContracts = contractsResult.rows.filter(contract => {
          const coords = getContractCoordinates(contract.city, contract.state);
          if (!coords) return false;
          
          const distance = calculateDistance(locationLat, locationLng, coords.lat, coords.lng);
          return distance <= locationRadius;
        });
        
        contracts = [...contracts, ...moreContracts];
      }
      
      // Trim to requested limit
      contracts = contracts.slice(0, filters.limit!);
    }

    const response: ContractsResponse = {
      contracts,
      total,
      page: filters.page!,
      limit: filters.limit!,
      total_pages: totalPages,
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