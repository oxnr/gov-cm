import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    if (type === 'state' && code) {
      const { data, error } = await supabase
        .from('states')
        .select('name')
        .eq('code', code.toUpperCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
      
      if (data) {
        return NextResponse.json({ name: data.name });
      }
      return NextResponse.json({ name: null });
    }

    if (type === 'naics' && code) {
      // Try exact match first
      let { data, error } = await supabase
        .from('naics_codes')
        .select('code, title')
        .eq('code', code)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // If no exact match, try prefix match for hierarchical codes
      if (!data && code.length >= 2) {
        const { data: prefixData, error: prefixError } = await supabase
          .from('naics_codes')
          .select('code, title')
          .like('code', `${code}%`)
          .order('code', { ascending: false })
          .limit(1);
        
        if (prefixError) throw prefixError;
        data = prefixData?.[0];
      }
      
      if (data) {
        return NextResponse.json({ 
          code: data.code,
          title: data.title 
        });
      }
      return NextResponse.json({ code: null, title: null });
    }

    if (type === 'states') {
      const { data, error } = await supabase
        .from('states')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      
      return NextResponse.json(data || []);
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