export interface Contract {
  id: number;
  notice_id: string;
  title: string;
  solicitation_number: string;
  department_agency: string;
  cgac: string;
  sub_tier: string;
  fpds_code: string;
  office: string;
  aac_code: string;
  posted_date: string;
  type: string;
  base_type: string;
  archive_type: string;
  archive_date: string;
  set_aside_code: string;
  set_aside: string;
  response_deadline: string;
  naics_code: string;
  classification_code: string;
  pop_street_address: string;
  pop_city: string;
  pop_state: string;
  pop_zip: string;
  pop_country: string;
  active: boolean;
  award_number: string;
  award_date: string;
  award_amount: number;
  awardee: string;
  primary_contact_title: string;
  primary_contact_fullname: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  primary_contact_fax: string;
  secondary_contact_title: string;
  secondary_contact_fullname: string;
  secondary_contact_email: string;
  secondary_contact_phone: string;
  secondary_contact_fax: string;
  organization_type: string;
  state: string;
  city: string;
  zip_code: string;
  country_code: string;
  additional_info_link: string;
  link: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ContractFilters {
  keyword?: string;
  type?: string;
  department_agency?: string;
  sub_tier?: string;
  set_aside?: string;
  naics_code?: string;
  state?: string;
  city?: string;
  posted_date_from?: string;
  posted_date_to?: string;
  response_deadline_from?: string;
  response_deadline_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ContractsResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AgencySpendAnalysis {
  department_agency: string;
  sub_tier: string;
  year: number;
  contract_count: number;
  total_amount: number;
  avg_amount: number;
}

export interface ContractorAnalysis {
  awardee: string;
  state: string;
  city: string;
  award_count: number;
  total_awards: number;
  avg_award_size: number;
  first_award: string;
  last_award: string;
}