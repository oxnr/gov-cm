import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Contract = {
  id: number
  notice_id: string
  title: string
  sol_number?: string
  fullparentpathname?: string
  fullparentpathcode?: string
  posted_date?: string
  type?: string
  base_type?: string
  archive_type?: string
  archive_date?: string
  set_aside_description?: string
  set_aside?: string
  response_deadline?: string
  naics_code?: string
  naics_description?: string
  classification_code?: string
  classification_description?: string
  pop_start_date?: string
  pop_end_date?: string
  pop_address?: string
  pop_city?: string
  pop_state?: string
  pop_zip?: string
  pop_country?: string
  active?: boolean
  award_number?: string
  award_amount?: number
  awardee?: string
  awardee_duns?: string
  awardee_location?: string
  awardee_city?: string
  awardee_state?: string
  awardee_zip?: string
  description?: string
  organization_type?: string
  ui_link?: string
  link?: string
  additional_reporting?: string
  fpds_code?: string
  fpds_description?: string
  office_address?: string
  office?: string
  city?: string
  state?: string
  zip?: string
  country_code?: string
  department_agency?: string
  sub_tier?: string
  created_at?: string
  updated_at?: string
}

export type State = {
  code: string
  name: string
  created_at?: string
}

export type NaicsCode = {
  code: string
  title: string
  created_at?: string
}