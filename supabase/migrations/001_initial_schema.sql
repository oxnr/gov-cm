-- Create states table
CREATE TABLE IF NOT EXISTS states (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create NAICS codes table
CREATE TABLE IF NOT EXISTS naics_codes (
    code VARCHAR(10) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT
);

-- Create main contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    notice_id VARCHAR(255) UNIQUE,
    title TEXT,
    sol_number VARCHAR(255),
    fullparentpathname TEXT,
    fullparentpathcode TEXT,
    posted_date DATE,
    type VARCHAR(50),
    base_type VARCHAR(50),
    archive_type VARCHAR(50),
    archive_date DATE,
    set_aside_description TEXT,
    set_aside VARCHAR(10),
    response_deadline TIMESTAMP,
    naics_code VARCHAR(10),
    naics_description TEXT,
    classification_code VARCHAR(50),
    classification_description TEXT,
    pop_start_date DATE,
    pop_end_date DATE,
    pop_address TEXT,
    pop_city VARCHAR(255),
    pop_state VARCHAR(2),
    pop_zip VARCHAR(10),
    pop_country VARCHAR(3),
    active BOOLEAN,
    award_number VARCHAR(255),
    award_amount DECIMAL(15, 2),
    awardee TEXT,
    awardee_duns VARCHAR(50),
    awardee_location TEXT,
    awardee_city VARCHAR(255),
    awardee_state VARCHAR(2),
    awardee_zip VARCHAR(10),
    description TEXT,
    organization_type VARCHAR(50),
    ui_link TEXT,
    link TEXT,
    additional_reporting TEXT,
    fpds_code TEXT,
    fpds_description TEXT,
    office_address TEXT,
    office VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(2),
    zip VARCHAR(10),
    country_code VARCHAR(3),
    department_agency TEXT,
    sub_tier TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (state) REFERENCES states(code) ON DELETE SET NULL,
    FOREIGN KEY (naics_code) REFERENCES naics_codes(code) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_contracts_posted_date ON contracts(posted_date);
CREATE INDEX idx_contracts_award_amount ON contracts(award_amount);
CREATE INDEX idx_contracts_state ON contracts(state);
CREATE INDEX idx_contracts_naics_code ON contracts(naics_code);
CREATE INDEX idx_contracts_department_agency ON contracts(department_agency);
CREATE INDEX idx_contracts_awardee ON contracts(awardee);
CREATE INDEX idx_contracts_city_state ON contracts(city, state);
CREATE INDEX idx_contracts_response_deadline ON contracts(response_deadline);
CREATE INDEX idx_contracts_type ON contracts(type);
CREATE INDEX idx_contracts_set_aside ON contracts(set_aside);

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_spend_by_state AS
SELECT 
    c.state,
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
    AND c.posted_date IS NOT NULL
GROUP BY c.state, s.name, EXTRACT(YEAR FROM c.posted_date);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_spend_by_agency AS
SELECT 
    department_agency,
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
GROUP BY department_agency, sub_tier, EXTRACT(YEAR FROM posted_date);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_spend_by_naics AS
SELECT 
    c.naics_code,
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
    AND c.posted_date IS NOT NULL
GROUP BY c.naics_code, n.title, EXTRACT(YEAR FROM c.posted_date);

-- Create indexes on materialized views
CREATE INDEX idx_mv_spend_by_state_state ON mv_spend_by_state(state);
CREATE INDEX idx_mv_spend_by_agency_agency ON mv_spend_by_agency(department_agency);
CREATE INDEX idx_mv_spend_by_naics_code ON mv_spend_by_naics(naics_code);