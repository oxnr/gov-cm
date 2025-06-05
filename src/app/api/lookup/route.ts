import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    if (type === 'state' && code) {
      const result = await pool.query(
        'SELECT name FROM states WHERE code = $1',
        [code.toUpperCase()]
      );
      
      if (result.rows.length > 0) {
        return NextResponse.json({ name: result.rows[0].name });
      }
      return NextResponse.json({ name: null });
    }

    if (type === 'naics' && code) {
      // Try exact match first
      let result = await pool.query(
        'SELECT code, title FROM naics_codes WHERE code = $1',
        [code]
      );
      
      // If no exact match, try prefix match for hierarchical codes
      if (result.rows.length === 0 && code.length >= 2) {
        result = await pool.query(
          'SELECT code, title FROM naics_codes WHERE code LIKE $1 ORDER BY LENGTH(code) DESC LIMIT 1',
          [code + '%']
        );
      }
      
      if (result.rows.length > 0) {
        return NextResponse.json({ 
          code: result.rows[0].code,
          title: result.rows[0].title 
        });
      }
      return NextResponse.json({ code: null, title: null });
    }

    if (type === 'states') {
      const result = await pool.query(
        'SELECT code, name FROM states ORDER BY name'
      );
      return NextResponse.json(result.rows);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in lookup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}