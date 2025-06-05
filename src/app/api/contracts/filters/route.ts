import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
      pool.query('SELECT DISTINCT type FROM contracts WHERE type IS NOT NULL ORDER BY type'),
      pool.query(`
        SELECT DISTINCT department_agency, sub_tier 
        FROM contracts 
        WHERE department_agency IS NOT NULL 
        ORDER BY department_agency, sub_tier
      `),
      pool.query('SELECT DISTINCT set_aside FROM contracts WHERE set_aside IS NOT NULL AND set_aside != \'\' ORDER BY set_aside'),
      pool.query('SELECT DISTINCT state FROM contracts WHERE state IS NOT NULL ORDER BY state'),
      pool.query(`
        SELECT DISTINCT naics_code 
        FROM contracts 
        WHERE naics_code IS NOT NULL AND naics_code != '' 
        ORDER BY naics_code
        LIMIT 500
      `)
    ]);

    // Process agencies into hierarchical structure
    const agencyMap = new Map<string, Set<string>>();
    agenciesResult.rows.forEach(row => {
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
      types: typesResult.rows.map(r => r.type),
      agencies,
      setAsides: setAsidesResult.rows.map(r => r.set_aside),
      states: statesResult.rows.map(r => r.state),
      naicsCodes: naicsResult.rows.map(r => r.naics_code)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}