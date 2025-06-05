import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'NAICS code is required' },
        { status: 400 }
      );
    }

    // Look up NAICS code
    const { data, error } = await supabase
      .from('naics_codes')
      .select('code, title')
      .eq('code', code)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'NAICS code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: data.code,
      title: data.title
    });
  } catch (error) {
    console.error('Error looking up NAICS code:', error);
    return NextResponse.json(
      { error: 'Failed to look up NAICS code' },
      { status: 500 }
    );
  }
}