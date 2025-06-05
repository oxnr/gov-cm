#!/usr/bin/env python3
import csv
import psycopg2
from datetime import datetime
import sys
from decimal import Decimal
import re
import pandas as pd
import os

# Database connection parameters
DB_PARAMS = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'govchime'),
    'user': os.getenv('DB_USER', 'govchime'),
    'password': os.getenv('DB_PASSWORD', 'govchime_secure_password')
}

def clean_decimal(value):
    """Clean and convert string to decimal"""
    if not value or value == 'N/A':
        return None
    # Remove any non-numeric characters except decimal point and minus
    cleaned = re.sub(r'[^0-9.-]', '', value)
    try:
        return Decimal(cleaned)
    except:
        return None

def parse_date(date_str):
    """Parse various date formats"""
    if not date_str or date_str == 'N/A':
        return None
    
    # Try different date formats
    formats = [
        '%Y-%m-%d %H:%M:%S.%f%z',
        '%Y-%m-%d %H:%M:%S%z',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d',
        '%m/%d/%Y',
        '%m/%d/%Y %H:%M:%S'
    ]
    
    # Remove timezone suffix variations
    date_str = re.sub(r'([+-]\d{2})$', r'\g<1>00', date_str)
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except:
            continue
    
    return None

def parse_boolean(value):
    """Parse boolean values"""
    if not value:
        return False
    return value.lower() in ['true', 'yes', '1', 't', 'y']

def import_naics_codes(xlsx_file, conn):
    """Import NAICS codes from Excel file"""
    print("Importing NAICS codes...")
    
    try:
        # Read Excel file
        df = pd.read_excel(xlsx_file)
        
        # Create NAICS table if it doesn't exist
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS naics_codes (
                code VARCHAR(10) PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Import codes
        for _, row in df.iterrows():
            code = str(row.get('2022 NAICS Code', ''))
            title = str(row.get('2022 NAICS Title', ''))
            
            if code and title:
                cursor.execute("""
                    INSERT INTO naics_codes (code, title) 
                    VALUES (%s, %s) 
                    ON CONFLICT (code) DO UPDATE 
                    SET title = EXCLUDED.title
                """, (code, title))
        
        conn.commit()
        print(f"Imported {len(df)} NAICS codes")
        
    except Exception as e:
        print(f"Error importing NAICS codes: {e}")
        conn.rollback()

def import_contracts_csv(csv_file, batch_size=1000):
    """Import CSV data into PostgreSQL database"""
    
    conn = None
    cursor = None
    
    try:
        # Connect to database
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # First import NAICS codes if file exists
        naics_file = os.path.join(os.path.dirname(csv_file), '6-digit_2022_Codes.xlsx')
        if os.path.exists(naics_file):
            import_naics_codes(naics_file, conn)
        
        # Open CSV file
        with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            
            insert_query = """
                INSERT INTO contracts (
                    notice_id, title, solicitation_number, department_agency, cgac,
                    sub_tier, fpds_code, office, aac_code, posted_date,
                    type, base_type, archive_type, archive_date, set_aside_code,
                    set_aside, response_deadline, naics_code, classification_code,
                    pop_street_address, pop_city, pop_state, pop_zip, pop_country,
                    active, award_number, award_date, award_amount, awardee,
                    primary_contact_title, primary_contact_fullname, primary_contact_email,
                    primary_contact_phone, primary_contact_fax, secondary_contact_title,
                    secondary_contact_fullname, secondary_contact_email, secondary_contact_phone,
                    secondary_contact_fax, organization_type, state, city, zip_code,
                    country_code, additional_info_link, link, description
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (notice_id) DO NOTHING
            """
            
            batch = []
            total_rows = 0
            inserted_rows = 0
            
            print("Starting data import...")
            
            for row in reader:
                total_rows += 1
                
                # Prepare data tuple
                data = (
                    row.get('NoticeId'),
                    row.get('Title'),
                    row.get('Sol#'),
                    row.get('Department/Ind.Agency'),
                    row.get('CGAC'),
                    row.get('Sub-Tier'),
                    row.get('FPDS Code'),
                    row.get('Office'),
                    row.get('AAC Code'),
                    parse_date(row.get('PostedDate')),
                    row.get('Type'),
                    row.get('BaseType'),
                    row.get('ArchiveType'),
                    parse_date(row.get('ArchiveDate')),
                    row.get('SetASideCode'),
                    row.get('SetASide'),
                    parse_date(row.get('ResponseDeadLine')),
                    row.get('NaicsCode'),
                    row.get('ClassificationCode'),
                    row.get('PopStreetAddress'),
                    row.get('PopCity'),
                    row.get('PopState'),
                    row.get('PopZip'),
                    row.get('PopCountry'),
                    parse_boolean(row.get('Active')),
                    row.get('AwardNumber'),
                    parse_date(row.get('AwardDate')),
                    clean_decimal(row.get('Award$')),
                    row.get('Awardee'),
                    row.get('PrimaryContactTitle'),
                    row.get('PrimaryContactFullname'),
                    row.get('PrimaryContactEmail'),
                    row.get('PrimaryContactPhone'),
                    row.get('PrimaryContactFax'),
                    row.get('SecondaryContactTitle'),
                    row.get('SecondaryContactFullname'),
                    row.get('SecondaryContactEmail'),
                    row.get('SecondaryContactPhone'),
                    row.get('SecondaryContactFax'),
                    row.get('OrganizationType'),
                    row.get('State'),
                    row.get('City'),
                    row.get('ZipCode'),
                    row.get('CountryCode'),
                    row.get('AdditionalInfoLink'),
                    row.get('Link'),
                    row.get('Description')
                )
                
                batch.append(data)
                
                # Execute batch insert
                if len(batch) >= batch_size:
                    cursor.executemany(insert_query, batch)
                    conn.commit()
                    inserted_rows += len(batch)
                    print(f"Processed {total_rows} rows, inserted {inserted_rows}...")
                    batch = []
            
            # Insert remaining records
            if batch:
                cursor.executemany(insert_query, batch)
                conn.commit()
                inserted_rows += len(batch)
            
            print(f"\nImport complete!")
            print(f"Total rows processed: {total_rows}")
            print(f"Total rows inserted: {inserted_rows}")
            
            # Refresh materialized views
            print("\nRefreshing materialized views...")
            cursor.execute("SELECT refresh_materialized_views()")
            conn.commit()
            print("Materialized views refreshed successfully!")
            
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    # Check if pandas is installed
    try:
        import pandas
    except ImportError:
        print("Please install pandas: pip install pandas openpyxl")
        sys.exit(1)
    
    csv_file = sys.argv[1] if len(sys.argv) > 1 else '../data/FY2020_archived_opportunities.csv'
    print(f"Starting import of {csv_file}...")
    import_contracts_csv(csv_file)
    print("Import process completed!")