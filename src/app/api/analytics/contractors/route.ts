import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const contractors = searchParams.getAll('contractor');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    let query = `
      SELECT 
        awardee,
        state,
        city,
        COUNT(*) as award_count,
        SUM(award_amount) as total_awards,
        AVG(award_amount) as avg_award_size,
        MIN(posted_date) as first_award,
        MAX(posted_date) as last_award
      FROM contracts
      WHERE awardee IS NOT NULL 
        AND awardee != ''
        AND award_amount IS NOT NULL
        AND award_amount > 0
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND LOWER(awardee) LIKE LOWER($${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Selected contractors filter
    if (contractors.length > 0) {
      query += ` AND awardee = ANY($${paramIndex}::text[])`;
      params.push(contractors);
      paramIndex++;
    }

    // Date filters
    if (dateFrom) {
      query += ` AND posted_date >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND posted_date <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    query += `
      GROUP BY awardee, state, city
      ORDER BY total_awards DESC
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT awardee) as count
      FROM contracts
      WHERE awardee IS NOT NULL 
        AND awardee != ''
        AND award_amount IS NOT NULL
        AND award_amount > 0
        ${search ? ` AND LOWER(awardee) LIKE LOWER($1)` : ''}
        ${contractors.length > 0 ? ` AND awardee = ANY($${search ? 2 : 1}::text[])` : ''}
    `;

    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (contractors.length > 0) countParams.push(contractors);

    const [dataResult, countResult] = await Promise.all([
      pool.query(query + ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, (page - 1) * limit]),
      pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Parse contractor data
    const contractorsData = dataResult.rows.map(row => ({
      contractor: row.awardee,
      location: row.state ? `${row.city || ''}, ${row.state}`.trim() : '--',
      totalAwards: parseFloat(row.total_awards),
      awardCount: parseInt(row.award_count),
      avgAwardSize: parseFloat(row.avg_award_size),
      firstAward: row.first_award,
      lastAward: row.last_award
    }));

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