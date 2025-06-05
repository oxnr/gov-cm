import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get distinct values for filters
    const [
      typesResult,
      agenciesResult,
      setAsidesResult,
      statesResult,
      naicsResult
    ] = await Promise.all([
      supabase
        .from('contracts')
        .select('type')
        .not('type', 'is', null)
        .order('type'),
      supabase
        .from('contracts')
        .select('department_agency, sub_tier')
        .not('department_agency', 'is', null)
        .order('department_agency')
        .order('sub_tier'),
      supabase
        .from('contracts')
        .select('set_aside')
        .not('set_aside', 'is', null)
        .neq('set_aside', '')
        .order('set_aside'),
      supabase
        .from('contracts')
        .select('state')
        .not('state', 'is', null)
        .order('state'),
      supabase
        .from('contracts')
        .select('naics_code')
        .not('naics_code', 'is', null)
        .neq('naics_code', '')
        .order('naics_code')
        .limit(500)
    ]);

    if (typesResult.error) throw typesResult.error;
    if (agenciesResult.error) throw agenciesResult.error;
    if (setAsidesResult.error) throw setAsidesResult.error;
    if (statesResult.error) throw statesResult.error;
    if (naicsResult.error) throw naicsResult.error;

    // Get unique values
    const uniqueTypes = [...new Set(typesResult.data?.map(r => r.type) || [])];
    const uniqueSetAsides = [...new Set(setAsidesResult.data?.map(r => r.set_aside) || [])];
    const uniqueStates = [...new Set(statesResult.data?.map(r => r.state) || [])];
    const uniqueNaicsCodes = [...new Set(naicsResult.data?.map(r => r.naics_code) || [])];

    // Process agencies into hierarchical structure
    const agencyMap = new Map<string, Set<string>>();
    agenciesResult.data?.forEach(row => {
      if (!agencyMap.has(row.department_agency)) {
        agencyMap.set(row.department_agency, new Set());
      }
      if (row.sub_tier) {
        agencyMap.get(row.department_agency)!.add(row.sub_tier);
      }
    });

    const agencies = Array.from(agencyMap.entries()).map(([agency, subTiers]) => ({
      name: agency,
      subTiers: Array.from(subTiers).sort()
    }));

    return NextResponse.json({
      types: uniqueTypes,
      agencies,
      setAsides: uniqueSetAsides,
      states: uniqueStates,
      naicsCodes: uniqueNaicsCodes
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}