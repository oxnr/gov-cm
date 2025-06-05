import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const groupBy = searchParams.get('groupBy') || 'geography'; // geography, agency, naics
    const states = searchParams.getAll('state');
    const agencies = searchParams.getAll('agency');
    const naicsCodes = searchParams.getAll('naics');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query;
    
    if (groupBy === 'geography') {
      // Build the query for geography grouping
      query = supabase
        .from('contracts')
        .select('state, posted_date, award_amount')
        .not('award_amount', 'is', null)
        .gt('award_amount', 0)
        .not('state', 'is', null)
        .neq('state', '');

      if (states.length > 0) {
        query = query.in('state', states);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get state names
      const stateCodes = [...new Set(data?.map(row => row.state) || [])];
      const { data: statesData } = await supabase
        .from('states')
        .select('code, name')
        .in('code', stateCodes);
      
      const stateNames = new Map(statesData?.map(s => [s.code, s.name]) || []);

      // Process the data to group by state and year
      const processedData = new Map<string, {
        name: string;
        state_name: string;
        years: Record<string, {contract_count: number; total_amount: number; avg_amount: number}>;
        total: number;
        contract_count: number;
      }>();

      data?.forEach((row: any) => {
        const year = row.posted_date ? new Date(row.posted_date).getFullYear() : 2020;
        const key = row.state;
        
        if (!processedData.has(key)) {
          processedData.set(key, {
            name: key,
            state_name: stateNames.get(key) || key,
            years: {},
            total: 0,
            contract_count: 0
          });
        }

        const entity = processedData.get(key)!;
        if (!entity.years[year]) {
          entity.years[year] = {
            contract_count: 0,
            total_amount: 0,
            avg_amount: 0
          };
        }

        entity.years[year].contract_count += 1;
        entity.years[year].total_amount += row.award_amount;
        entity.total += row.award_amount;
        entity.contract_count += 1;
      });

      // Calculate averages
      processedData.forEach(entity => {
        Object.keys(entity.years).forEach(year => {
          entity.years[year].avg_amount = 
            entity.years[year].total_amount / entity.years[year].contract_count;
        });
      });

      // Convert to array and sort
      const entities = Array.from(processedData.values())
        .sort((a, b) => b.total - a.total);

      const topEntities = entities.slice(0, limit);
      const isLimited = entities.length > limit;

      return NextResponse.json({
        data: topEntities,
        total: entities.length,
        isLimited,
        groupBy
      });

    } else if (groupBy === 'agency') {
      // Build the query for agency grouping
      query = supabase
        .from('contracts')
        .select('department_agency, sub_tier, posted_date, award_amount')
        .not('award_amount', 'is', null)
        .gt('award_amount', 0)
        .not('department_agency', 'is', null)
        .neq('department_agency', '');

      if (agencies.length > 0) {
        query = query.in('department_agency', agencies);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process the data to group by agency and year
      const processedData = new Map<string, {
        name: string;
        sub_tier?: string;
        years: Record<string, {contract_count: number; total_amount: number; avg_amount: number}>;
        total: number;
        contract_count: number;
      }>();

      data?.forEach((row: any) => {
        const year = new Date(row.posted_date).getFullYear();
        const key = row.department_agency;
        
        if (!processedData.has(key)) {
          processedData.set(key, {
            name: key,
            sub_tier: row.sub_tier,
            years: {},
            total: 0,
            contract_count: 0
          });
        }

        const entity = processedData.get(key)!;
        if (!entity.years[year]) {
          entity.years[year] = {
            contract_count: 0,
            total_amount: 0,
            avg_amount: 0
          };
        }

        entity.years[year].contract_count += 1;
        entity.years[year].total_amount += row.award_amount;
        entity.total += row.award_amount;
        entity.contract_count += 1;
      });

      // Calculate averages
      processedData.forEach(entity => {
        Object.keys(entity.years).forEach(year => {
          entity.years[year].avg_amount = 
            entity.years[year].total_amount / entity.years[year].contract_count;
        });
      });

      // Convert to array and sort
      const entities = Array.from(processedData.values())
        .sort((a, b) => b.total - a.total);

      const topEntities = entities.slice(0, limit);
      const isLimited = entities.length > limit;

      return NextResponse.json({
        data: topEntities,
        total: entities.length,
        isLimited,
        groupBy
      });

    } else if (groupBy === 'naics') {
      // Build the query for NAICS grouping
      query = supabase
        .from('contracts')
        .select('naics_code, posted_date, award_amount')
        .not('award_amount', 'is', null)
        .gt('award_amount', 0)
        .not('naics_code', 'is', null)
        .neq('naics_code', '');

      if (naicsCodes.length > 0) {
        // Use OR conditions for NAICS code patterns
        const orConditions = naicsCodes.map(code => `naics_code.like.${code}%`).join(',');
        query = query.or(orConditions);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get NAICS titles
      const naicsCodesList = [...new Set(data?.map(row => row.naics_code) || [])];
      const { data: naicsData } = await supabase
        .from('naics_codes')
        .select('code, title')
        .in('code', naicsCodesList);
      
      const naicsTitles = new Map(naicsData?.map(n => [n.code, n.title]) || []);

      // Process the data to group by NAICS code and year
      const processedData = new Map<string, {
        name: string;
        naics_title?: string;
        years: Record<string, {contract_count: number; total_amount: number; avg_amount: number}>;
        total: number;
        contract_count: number;
      }>();

      data?.forEach((row: any) => {
        const year = new Date(row.posted_date).getFullYear();
        const key = row.naics_code;
        
        if (!processedData.has(key)) {
          processedData.set(key, {
            name: key,
            naics_title: naicsTitles.get(key),
            years: {},
            total: 0,
            contract_count: 0
          });
        }

        const entity = processedData.get(key)!;
        if (!entity.years[year]) {
          entity.years[year] = {
            contract_count: 0,
            total_amount: 0,
            avg_amount: 0
          };
        }

        entity.years[year].contract_count += 1;
        entity.years[year].total_amount += row.award_amount;
        entity.total += row.award_amount;
        entity.contract_count += 1;
      });

      // Calculate averages
      processedData.forEach(entity => {
        Object.keys(entity.years).forEach(year => {
          entity.years[year].avg_amount = 
            entity.years[year].total_amount / entity.years[year].contract_count;
        });
      });

      // Convert to array and sort
      const entities = Array.from(processedData.values())
        .sort((a, b) => b.total - a.total);

      const topEntities = entities.slice(0, limit);
      const isLimited = entities.length > limit;

      return NextResponse.json({
        data: topEntities,
        total: entities.length,
        isLimited,
        groupBy
      });
    }

    return NextResponse.json({
      data: [],
      total: 0,
      isLimited: false,
      groupBy
    });

  } catch (error) {
    console.error('Error in spend analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spend analysis' },
      { status: 500 }
    );
  }
}