import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const contractors = searchParams.getAll('contractor');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // Build the query
    let query = supabase
      .from('contracts')
      .select('awardee, state, city, award_amount, posted_date', { count: 'exact' })
      .not('awardee', 'is', null)
      .neq('awardee', '')
      .not('award_amount', 'is', null)
      .gt('award_amount', 0);

    // Apply filters
    if (search) {
      query = query.ilike('awardee', `%${search}%`);
    }

    if (contractors.length > 0) {
      query = query.in('awardee', contractors);
    }

    if (dateFrom) {
      query = query.gte('posted_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('posted_date', dateTo);
    }

    // Execute the query to get all matching records
    const { data, error } = await query;
    if (error) throw error;

    // Group by contractor
    const contractorMap = new Map<string, {
      contractor: string;
      state?: string;
      city?: string;
      awardCount: number;
      totalAwards: number;
      avgAwardSize: number;
      firstAward?: string;
      lastAward?: string;
    }>();

    data?.forEach((row) => {
      const key = `${row.awardee}-${row.state || ''}-${row.city || ''}`;
      
      if (!contractorMap.has(key)) {
        contractorMap.set(key, {
          contractor: row.awardee,
          state: row.state,
          city: row.city,
          awardCount: 0,
          totalAwards: 0,
          avgAwardSize: 0,
          firstAward: row.posted_date,
          lastAward: row.posted_date
        });
      }

      const contractor = contractorMap.get(key)!;
      contractor.awardCount += 1;
      contractor.totalAwards += row.award_amount;
      
      // Update first and last award dates
      if (!contractor.firstAward || row.posted_date < contractor.firstAward) {
        contractor.firstAward = row.posted_date;
      }
      if (!contractor.lastAward || row.posted_date > contractor.lastAward) {
        contractor.lastAward = row.posted_date;
      }
    });

    // Calculate averages
    contractorMap.forEach(contractor => {
      contractor.avgAwardSize = contractor.totalAwards / contractor.awardCount;
    });

    // Convert to array and sort by total awards
    const allContractors = Array.from(contractorMap.values())
      .sort((a, b) => b.totalAwards - a.totalAwards);

    // Apply pagination
    const start = (page - 1) * limit;
    const paginatedContractors = allContractors.slice(start, start + limit);

    // Format the response
    const contractorsData = paginatedContractors.map(contractor => ({
      contractor: contractor.contractor,
      location: contractor.state ? `${contractor.city || ''}, ${contractor.state}`.trim() : '--',
      totalAwards: contractor.totalAwards,
      awardCount: contractor.awardCount,
      avgAwardSize: contractor.avgAwardSize,
      firstAward: contractor.firstAward,
      lastAward: contractor.lastAward
    }));

    const total = allContractors.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      contractors: contractorsData,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error in contractor analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractor analysis' },
      { status: 500 }
    );
  }
}