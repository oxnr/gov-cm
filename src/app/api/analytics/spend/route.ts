import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const groupBy = searchParams.get('groupBy') || 'geography'; // geography, agency, naics
    const states = searchParams.getAll('state');
    const agencies = searchParams.getAll('agency');
    const naicsCodes = searchParams.getAll('naics');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (groupBy === 'geography') {
      query = `
        SELECT 
          c.state as name,
          s.name as state_name,
          EXTRACT(YEAR FROM c.posted_date) as year,
          COUNT(*) as contract_count,
          SUM(c.award_amount) as total_amount,
          AVG(c.award_amount) as avg_amount
        FROM contracts c
        LEFT JOIN states s ON c.state = s.code
        WHERE c.award_amount IS NOT NULL 
          AND c.award_amount > 0
          AND c.state IS NOT NULL
          AND c.state != ''
          AND c.posted_date IS NOT NULL
      `;

      if (states.length > 0) {
        query += ` AND c.state = ANY($${paramIndex}::text[])`;
        params.push(states);
        paramIndex++;
      }

      query += `
        GROUP BY c.state, s.name, EXTRACT(YEAR FROM c.posted_date)
        ORDER BY SUM(c.award_amount) DESC
      `;
    } else if (groupBy === 'agency') {
      query = `
        SELECT 
          department_agency as name,
          sub_tier,
          EXTRACT(YEAR FROM posted_date) as year,
          COUNT(*) as contract_count,
          SUM(award_amount) as total_amount,
          AVG(award_amount) as avg_amount
        FROM contracts
        WHERE award_amount IS NOT NULL 
          AND award_amount > 0
          AND department_agency IS NOT NULL
          AND posted_date IS NOT NULL
      `;

      if (agencies.length > 0) {
        query += ` AND department_agency = ANY($${paramIndex}::text[])`;
        params.push(agencies);
        paramIndex++;
      }

      query += `
        GROUP BY department_agency, sub_tier, EXTRACT(YEAR FROM posted_date)
        ORDER BY SUM(award_amount) DESC
      `;
    } else if (groupBy === 'naics') {
      query = `
        SELECT 
          c.naics_code as name,
          n.title as naics_title,
          EXTRACT(YEAR FROM c.posted_date) as year,
          COUNT(*) as contract_count,
          SUM(c.award_amount) as total_amount,
          AVG(c.award_amount) as avg_amount
        FROM contracts c
        LEFT JOIN naics_codes n ON c.naics_code = n.code
        WHERE c.award_amount IS NOT NULL 
          AND c.award_amount > 0
          AND c.naics_code IS NOT NULL
          AND c.naics_code != ''
          AND c.posted_date IS NOT NULL
      `;

      if (naicsCodes.length > 0) {
        const naicsPatterns = naicsCodes.map(code => `${code}%`);
        query += ` AND (`;
        const conditions = naicsPatterns.map((_, idx) => 
          `c.naics_code LIKE $${paramIndex + idx}`
        ).join(' OR ');
        query += conditions + ')';
        params.push(...naicsPatterns);
        paramIndex += naicsPatterns.length;
      }

      query += `
        GROUP BY c.naics_code, n.title, EXTRACT(YEAR FROM c.posted_date)
        ORDER BY SUM(c.award_amount) DESC
      `;
    }

    const result = await pool.query(query, params);

    // Group data by entity and calculate totals
    const entityMap = new Map<string, any>();

    result.rows.forEach(row => {
      const key = row.name;
      if (!entityMap.has(key)) {
        entityMap.set(key, {
          name: key,
          state_name: row.state_name,
          naics_title: row.naics_title,
          sub_tier: row.sub_tier,
          years: {},
          total: 0,
          contract_count: 0
        });
      }

      const entity = entityMap.get(key);
      entity.years[row.year] = {
        contract_count: parseInt(row.contract_count),
        total_amount: parseFloat(row.total_amount),
        avg_amount: parseFloat(row.avg_amount)
      };
      entity.total += parseFloat(row.total_amount);
      entity.contract_count += parseInt(row.contract_count);
    });

    // Convert to array and sort by total
    let entities = Array.from(entityMap.values())
      .sort((a, b) => b.total - a.total);

    // Apply limit for graph view
    const topEntities = entities.slice(0, limit);
    const isLimited = entities.length > limit;

    return NextResponse.json({
      data: topEntities,
      total: entities.length,
      isLimited,
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