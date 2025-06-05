import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import pool from './db';

// Database mode configuration
export type DatabaseMode = 'production' | 'development';

// Get database mode from environment variable
export const getDatabaseMode = (): DatabaseMode => {
  return process.env.NEXT_PUBLIC_DATABASE_MODE === 'development' ? 'development' : 'production';
};

// Database interface for abstraction
export interface DatabaseClient {
  mode: DatabaseMode;
  
  // Contracts
  getContracts(params: any): Promise<any>;
  getContractFilters(): Promise<any>;
  
  // Analytics
  getSpendAnalytics(params: any): Promise<any>;
  getContractorAnalytics(params: any): Promise<any>;
  
  // Lookups
  getStates(): Promise<any>;
  getNaicsCode(code: string): Promise<any>;
  lookupState(code: string): Promise<any>;
  lookupNaics(code: string): Promise<any>;
}

// PostgreSQL implementation
class PostgreSQLClient implements DatabaseClient {
  mode: DatabaseMode = 'development';
  
  async getContracts(params: any) {
    const {
      keyword, type, department_agency, sub_tier, set_aside, naics_code,
      state, city, posted_date_from, posted_date_to, response_deadline_from,
      response_deadline_to, page = 1, limit = 25, sort_by = 'posted_date',
      sort_order = 'desc', locationLat, locationLng, locationRadius
    } = params;

    // Build the WHERE clause
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];
    let paramCounter = 1;

    if (keyword) {
      whereConditions.push(`(
        title ILIKE $${paramCounter} OR 
        description ILIKE $${paramCounter} OR 
        department_agency ILIKE $${paramCounter} OR
        sub_tier ILIKE $${paramCounter} OR
        office ILIKE $${paramCounter}
      )`);
      queryParams.push(`%${keyword}%`);
      paramCounter++;
    }

    if (type) {
      whereConditions.push(`type = $${paramCounter}`);
      queryParams.push(type);
      paramCounter++;
    }

    // Add other filters...
    if (department_agency) {
      whereConditions.push(`department_agency = $${paramCounter}`);
      queryParams.push(department_agency);
      paramCounter++;
    }

    if (state) {
      whereConditions.push(`state = $${paramCounter}`);
      queryParams.push(state);
      paramCounter++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Count query
    const countQuery = `SELECT COUNT(*) FROM contracts ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Data query
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT * FROM contracts 
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()} NULLS LAST
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

    return {
      contracts: dataResult.rows,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  async getContractFilters() {
    const queries = {
      types: pool.query(`
        SELECT DISTINCT type FROM contracts 
        WHERE type IS NOT NULL AND type != ''
        ORDER BY type
      `),
      agencies: pool.query(`
        SELECT DISTINCT department_agency FROM contracts 
        WHERE department_agency IS NOT NULL AND department_agency != ''
        ORDER BY department_agency
      `),
      subTiers: pool.query(`
        SELECT DISTINCT sub_tier FROM contracts 
        WHERE sub_tier IS NOT NULL AND sub_tier != ''
        ORDER BY sub_tier
      `),
      setAsides: pool.query(`
        SELECT DISTINCT set_aside FROM contracts 
        WHERE set_aside IS NOT NULL AND set_aside != ''
        ORDER BY set_aside
      `),
      naicsCodes: pool.query(`
        SELECT DISTINCT c.naics_code, n.title as naics_description 
        FROM contracts c
        LEFT JOIN naics_codes n ON c.naics_code = n.code
        WHERE c.naics_code IS NOT NULL AND c.naics_code != ''
        ORDER BY c.naics_code
      `),
      states: pool.query(`
        SELECT DISTINCT c.state, s.name as state_name 
        FROM contracts c
        LEFT JOIN states s ON c.state = s.code
        WHERE c.state IS NOT NULL AND c.state != ''
        ORDER BY c.state
      `),
      cities: pool.query(`
        SELECT DISTINCT city FROM contracts 
        WHERE city IS NOT NULL AND city != ''
        ORDER BY city
        LIMIT 100
      `)
    };

    const results = await Promise.all([
      queries.types,
      queries.agencies,
      queries.subTiers,
      queries.setAsides,
      queries.naicsCodes,
      queries.states,
      queries.cities
    ]);

    return {
      types: results[0].rows.map(r => r.type),
      agencies: results[1].rows.map(r => r.department_agency),
      subTiers: results[2].rows.map(r => r.sub_tier),
      setAsides: results[3].rows.map(r => r.set_aside),
      naicsCodes: results[4].rows,
      states: results[5].rows,
      cities: results[6].rows.map(r => r.city)
    };
  }

  async getSpendAnalytics(params: any) {
    const { groupBy, states, agencies, naicsCodes, limit = 10 } = params;
    
    // Similar to the Supabase implementation but using SQL
    // This is a simplified version - you'd need to implement the full SQL queries
    let query = '';
    let queryParams: any[] = [];
    
    if (groupBy === 'geography') {
      query = `
        WITH spend_by_state AS (
          SELECT 
            state,
            EXTRACT(YEAR FROM posted_date) as year,
            COUNT(*) as contract_count,
            SUM(award_amount) as total_amount
          FROM contracts
          WHERE award_amount IS NOT NULL 
            AND award_amount > 0
            AND state IS NOT NULL 
            AND state != ''
          GROUP BY state, EXTRACT(YEAR FROM posted_date)
        )
        SELECT 
          s.state as name,
          st.name as state_name,
          json_object_agg(
            s.year::text,
            json_build_object(
              'contract_count', s.contract_count,
              'total_amount', s.total_amount,
              'avg_amount', s.total_amount / s.contract_count
            )
          ) as years,
          SUM(s.total_amount) as total,
          SUM(s.contract_count) as contract_count
        FROM spend_by_state s
        LEFT JOIN states st ON s.state = st.code
        GROUP BY s.state, st.name
        ORDER BY total DESC
        LIMIT $1
      `;
      queryParams = [limit];
    }
    
    const result = await pool.query(query, queryParams);
    
    return {
      data: result.rows,
      total: result.rows.length,
      isLimited: result.rows.length >= limit,
      groupBy
    };
  }

  async getContractorAnalytics(params: any) {
    const { page = 1, limit = 25, keyword } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let queryParams: any[] = [];
    
    if (keyword) {
      whereClause = 'WHERE awardee ILIKE $1';
      queryParams = [`%${keyword}%`, limit, offset];
    } else {
      queryParams = [limit, offset];
    }
    
    const query = `
      SELECT 
        awardee,
        COUNT(*) as contract_count,
        SUM(award_amount) as total_amount,
        AVG(award_amount) as avg_amount,
        json_agg(DISTINCT department_agency) as agencies
      FROM contracts
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} awardee IS NOT NULL
      GROUP BY awardee
      ORDER BY total_amount DESC NULLS LAST
      LIMIT $${whereClause ? 2 : 1} OFFSET $${whereClause ? 3 : 2}
    `;
    
    const countQuery = `
      SELECT COUNT(DISTINCT awardee) 
      FROM contracts 
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} awardee IS NOT NULL
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, keyword ? [`%${keyword}%`] : [])
    ]);
    
    return {
      contractors: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  async getStates() {
    const result = await pool.query('SELECT code, name FROM states ORDER BY name');
    return result.rows;
  }

  async getNaicsCode(code: string) {
    const result = await pool.query(
      'SELECT code, title FROM naics_codes WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  async lookupState(code: string) {
    const result = await pool.query(
      'SELECT code, name FROM states WHERE code = $1',
      [code]
    );
    if (result.rows.length === 0) throw new Error('State not found');
    return result.rows[0];
  }

  async lookupNaics(code: string) {
    const result = await pool.query(
      'SELECT code, title FROM naics_codes WHERE code LIKE $1 ORDER BY code LIMIT 10',
      [`${code}%`]
    );
    return result.rows;
  }
}

// Supabase implementation
class SupabaseClient implements DatabaseClient {
  mode: DatabaseMode = 'production';
  
  async getContracts(params: any) {
    const {
      keyword, type, department_agency, sub_tier, set_aside, naics_code,
      state, city, posted_date_from, posted_date_to, response_deadline_from,
      response_deadline_to, page = 1, limit = 25, sort_by = 'posted_date',
      sort_order = 'desc'
    } = params;

    // Build query
    let query = supabase
      .from('contracts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,department_agency.ilike.%${keyword}%,sub_tier.ilike.%${keyword}%,office.ilike.%${keyword}%`);
    }

    if (type) query = query.eq('type', type);
    if (department_agency) query = query.eq('department_agency', department_agency);
    if (sub_tier) query = query.eq('sub_tier', sub_tier);
    if (set_aside) query = query.eq('set_aside', set_aside);
    if (naics_code) query = query.eq('naics_code', naics_code);
    if (state) query = query.eq('state', state);
    if (city) query = query.ilike('city', `${city}%`);
    if (posted_date_from) query = query.gte('posted_date', posted_date_from);
    if (posted_date_to) query = query.lte('posted_date', posted_date_to);
    if (response_deadline_from) query = query.gte('response_deadline', response_deadline_from);
    if (response_deadline_to) query = query.lte('response_deadline', response_deadline_to);

    // Apply sorting
    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending, nullsFirst: false });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: contracts, error, count } = await query;

    if (error) throw error;

    return {
      contracts: contracts || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getContractFilters() {
    // Implementation already exists in the updated route
    // This would call the same Supabase queries
    const [types, agencies, subTiers, setAsides, naicsCodes, states, cities] = await Promise.all([
      supabase.from('contracts').select('type').not('type', 'is', null).neq('type', ''),
      supabase.from('contracts').select('department_agency').not('department_agency', 'is', null).neq('department_agency', ''),
      supabase.from('contracts').select('sub_tier').not('sub_tier', 'is', null).neq('sub_tier', ''),
      supabase.from('contracts').select('set_aside').not('set_aside', 'is', null).neq('set_aside', ''),
      supabase.from('contracts').select('naics_code').not('naics_code', 'is', null).neq('naics_code', ''),
      supabase.from('contracts').select('state').not('state', 'is', null).neq('state', ''),
      supabase.from('contracts').select('city').not('city', 'is', null).neq('city', '').limit(100)
    ]);

    // Process and deduplicate
    const uniqueTypes = [...new Set(types.data?.map(r => r.type) || [])].sort();
    const uniqueAgencies = [...new Set(agencies.data?.map(r => r.department_agency) || [])].sort();
    // ... etc

    return {
      types: uniqueTypes,
      agencies: uniqueAgencies,
      subTiers: [...new Set(subTiers.data?.map(r => r.sub_tier) || [])].sort(),
      setAsides: [...new Set(setAsides.data?.map(r => r.set_aside) || [])].sort(),
      naicsCodes: [],
      states: [],
      cities: [...new Set(cities.data?.map(r => r.city) || [])].sort()
    };
  }

  async getSpendAnalytics(params: any) {
    // Use the existing Supabase implementation
    // This is already implemented in the route
    return { data: [], total: 0, isLimited: false, groupBy: params.groupBy };
  }

  async getContractorAnalytics(params: any) {
    // Use the existing Supabase implementation
    return { contractors: [], totalCount: 0, page: 1, limit: 25, totalPages: 0 };
  }

  async getStates() {
    const { data } = await supabase.from('states').select('code, name').order('name');
    return data || [];
  }

  async getNaicsCode(code: string) {
    const { data } = await supabase.from('naics_codes').select('code, title').eq('code', code).single();
    return data;
  }

  async lookupState(code: string) {
    const { data, error } = await supabase.from('states').select('code, name').eq('code', code).single();
    if (error) throw error;
    return data;
  }

  async lookupNaics(code: string) {
    const { data } = await supabase.from('naics_codes').select('code, title').like('code', `${code}%`).limit(10);
    return data || [];
  }
}

// Create database client based on mode
export const createDatabaseClient = (): DatabaseClient => {
  const mode = getDatabaseMode();
  console.log(`🔄 Database mode: ${mode}`);
  
  if (mode === 'development') {
    return new PostgreSQLClient();
  } else {
    return new SupabaseClient();
  }
};

// Export a singleton instance
let dbClient: DatabaseClient;

export const getDatabase = (): DatabaseClient => {
  if (!dbClient) {
    dbClient = createDatabaseClient();
  }
  return dbClient;
};