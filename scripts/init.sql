-- Create the main contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    notice_id VARCHAR(255) UNIQUE NOT NULL,
    title TEXT,
    solicitation_number VARCHAR(255),
    department_agency VARCHAR(255),
    cgac VARCHAR(50),
    sub_tier VARCHAR(255),
    fpds_code VARCHAR(50),
    office TEXT,
    aac_code VARCHAR(50),
    posted_date TIMESTAMP,
    type VARCHAR(100),
    base_type VARCHAR(100),
    archive_type VARCHAR(50),
    archive_date DATE,
    set_aside_code VARCHAR(50),
    set_aside TEXT,
    response_deadline TIMESTAMP,
    naics_code VARCHAR(50),
    classification_code VARCHAR(50),
    pop_street_address TEXT,
    pop_city VARCHAR(255),
    pop_state VARCHAR(50),
    pop_zip VARCHAR(20),
    pop_country VARCHAR(100),
    active BOOLEAN DEFAULT false,
    award_number VARCHAR(255),
    award_date DATE,
    award_amount DECIMAL(15, 2),
    awardee TEXT,
    primary_contact_title VARCHAR(255),
    primary_contact_fullname TEXT,
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(100),
    primary_contact_fax VARCHAR(100),
    secondary_contact_title VARCHAR(255),
    secondary_contact_fullname TEXT,
    secondary_contact_email VARCHAR(255),
    secondary_contact_phone VARCHAR(100),
    secondary_contact_fax VARCHAR(100),
    organization_type VARCHAR(100),
    state VARCHAR(50),
    city VARCHAR(255),
    zip_code VARCHAR(20),
    country_code VARCHAR(10),
    additional_info_link TEXT,
    link TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_contracts_posted_date ON contracts(posted_date DESC);
CREATE INDEX idx_contracts_type ON contracts(type);
CREATE INDEX idx_contracts_department_agency ON contracts(department_agency);
CREATE INDEX idx_contracts_sub_tier ON contracts(sub_tier);
CREATE INDEX idx_contracts_naics_code ON contracts(naics_code);
CREATE INDEX idx_contracts_set_aside ON contracts(set_aside);
CREATE INDEX idx_contracts_state ON contracts(state);
CREATE INDEX idx_contracts_city ON contracts(city);
CREATE INDEX idx_contracts_award_date ON contracts(award_date);
CREATE INDEX idx_contracts_awardee ON contracts(awardee);
CREATE INDEX idx_contracts_response_deadline ON contracts(response_deadline);

-- Create text search indexes
CREATE INDEX idx_contracts_title_search ON contracts USING gin(to_tsvector('english', title));
CREATE INDEX idx_contracts_description_search ON contracts USING gin(to_tsvector('english', description));

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS agency_spend_analysis AS
SELECT 
    department_agency,
    sub_tier,
    EXTRACT(YEAR FROM award_date) as year,
    COUNT(*) as contract_count,
    SUM(award_amount) as total_amount,
    AVG(award_amount) as avg_amount
FROM contracts
WHERE award_amount IS NOT NULL
GROUP BY department_agency, sub_tier, EXTRACT(YEAR FROM award_date);

CREATE INDEX idx_agency_spend_dept ON agency_spend_analysis(department_agency);
CREATE INDEX idx_agency_spend_year ON agency_spend_analysis(year);

CREATE MATERIALIZED VIEW IF NOT EXISTS contractor_analysis AS
SELECT 
    awardee,
    state,
    city,
    COUNT(*) as award_count,
    SUM(award_amount) as total_awards,
    AVG(award_amount) as avg_award_size,
    MIN(award_date) as first_award,
    MAX(award_date) as last_award
FROM contracts
WHERE awardee IS NOT NULL AND award_amount IS NOT NULL
GROUP BY awardee, state, city;

CREATE INDEX idx_contractor_awardee ON contractor_analysis(awardee);
CREATE INDEX idx_contractor_total ON contractor_analysis(total_awards DESC);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY agency_spend_analysis;
    REFRESH MATERIALIZED VIEW CONCURRENTLY contractor_analysis;
END;
$$ LANGUAGE plpgsql;