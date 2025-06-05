#!/usr/bin/env python3
"""
Import government contracts data to Supabase
"""
import os
import sys
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase connection string format:
# postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_DB_URL = os.getenv('SUPABASE_DB_URL')

if not SUPABASE_DB_URL:
    print("Error: SUPABASE_DB_URL environment variable not set")
    print("Get your database URL from: https://app.supabase.com/project/[your-project]/settings/database")
    sys.exit(1)

def clean_value(value):
    """Clean and prepare values for database insertion"""
    if pd.isna(value) or value == '' or value == 'NA':
        return None
    if isinstance(value, str):
        value = value.strip()
        if value.upper() in ['NULL', 'NONE', 'N/A', 'NA', '']:
            return None
    return value

def parse_date(date_str):
    """Parse date string to date object"""
    if not date_str or pd.isna(date_str):
        return None
    try:
        # Try common date formats
        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%Y/%m/%d', '%d-%m-%Y']:
            try:
                return datetime.strptime(str(date_str).strip(), fmt).date()
            except:
                continue
        return None
    except:
        return None

def parse_datetime(datetime_str):
    """Parse datetime string to datetime object"""
    if not datetime_str or pd.isna(datetime_str):
        return None
    try:
        # Try to parse ISO format first
        return datetime.fromisoformat(str(datetime_str).strip().replace('Z', '+00:00'))
    except:
        try:
            # Try other common formats
            return datetime.strptime(str(datetime_str).strip(), '%Y-%m-%d %H:%M:%S')
        except:
            return None

def parse_decimal(value):
    """Parse decimal/money values"""
    if not value or pd.isna(value):
        return None
    try:
        # Remove currency symbols and commas
        cleaned = str(value).replace('$', '').replace(',', '').strip()
        if cleaned == '' or cleaned.upper() in ['NULL', 'NONE', 'N/A', 'NA']:
            return None
        return float(cleaned)
    except:
        return None

def import_naics_codes(conn):
    """Import NAICS codes from Excel file"""
    print("Importing NAICS codes...")
    
    naics_file = 'data/6-digit_2022_Codes.xlsx'
    if not os.path.exists(naics_file):
        print(f"Warning: NAICS file not found at {naics_file}")
        print("Skipping NAICS codes import")
        return
    
    try:
        df = pd.read_excel(naics_file)
        
        with conn.cursor() as cur:
            for _, row in df.iterrows():
                code = str(row.get('2022 NAICS Code', '')).strip()
                title = clean_value(row.get('2022 NAICS Title', ''))
                
                if code and title:
                    cur.execute("""
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

def import_contracts(conn, limit=None):
    """Import contracts from CSV file"""
    print("Importing contracts...")
    
    csv_file = 'data/FY2020_archived_opportunities.csv'
    if not os.path.exists(csv_file):
        print(f"Error: Contract data file not found at {csv_file}")
        print("Please download the file and place it in the data directory")
        return
    
    # First, let's read a sample to see the columns
    print("Reading CSV file to analyze columns...")
    try:
        # Try different encodings
        for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
            try:
                df_sample = pd.read_csv(csv_file, nrows=5, low_memory=False, encoding=encoding)
                print(f"Successfully read file with encoding: {encoding}")
                print(f"Found {len(df_sample.columns)} columns")
                print("Column names:", list(df_sample.columns))
                
                # Read the full CSV with the working encoding
                print("Reading full CSV file...")
                df = pd.read_csv(csv_file, low_memory=False, encoding=encoding)
                break
            except UnicodeDecodeError:
                continue
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
    print(f"Total records in CSV: {len(df)}")
    
    if limit:
        df = df.head(limit)
        print(f"Limiting import to {limit} records")
    
    # Prepare the insert query
    insert_query = """
        INSERT INTO contracts (
            notice_id, title, sol_number, fullparentpathname, fullparentpathcode,
            posted_date, type, base_type, archive_type, archive_date,
            set_aside_description, set_aside, response_deadline,
            naics_code, naics_description, classification_code, classification_description,
            pop_start_date, pop_end_date, pop_address, pop_city, pop_state, pop_zip, pop_country,
            active, award_number, award_amount, awardee, awardee_duns, awardee_location,
            awardee_city, awardee_state, awardee_zip, description,
            organization_type, ui_link, link, additional_reporting,
            fpds_code, fpds_description, office_address, office,
            city, state, zip, country_code, department_agency, sub_tier
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (notice_id) DO UPDATE SET
            title = EXCLUDED.title,
            award_amount = EXCLUDED.award_amount,
            awardee = EXCLUDED.awardee
    """
    
    successful = 0
    failed = 0
    
    with conn.cursor() as cur:
        for idx, row in df.iterrows():
            try:
                # Map CSV columns to database columns
                # Note: Adjust these mappings based on your actual CSV column names
                values = (
                    clean_value(row.get('noticeId', row.get('notice_id'))),
                    clean_value(row.get('title')),
                    clean_value(row.get('solicitationNumber', row.get('sol_number'))),
                    clean_value(row.get('fullParentPathName')),
                    clean_value(row.get('fullParentPathCode')),
                    parse_date(row.get('postedDate', row.get('posted_date'))),
                    clean_value(row.get('type')),
                    clean_value(row.get('baseType', row.get('base_type'))),
                    clean_value(row.get('archiveType', row.get('archive_type'))),
                    parse_date(row.get('archiveDate', row.get('archive_date'))),
                    clean_value(row.get('setAsideDescription', row.get('set_aside_description'))),
                    clean_value(row.get('setAside', row.get('set_aside'))),
                    parse_datetime(row.get('responseDeadLine', row.get('response_deadline'))),
                    clean_value(row.get('naicsCode', row.get('naics_code'))),
                    clean_value(row.get('naicsDescription', row.get('naics_description'))),
                    clean_value(row.get('classificationCode', row.get('classification_code'))),
                    clean_value(row.get('classificationDescription', row.get('classification_description'))),
                    parse_date(row.get('popStartDate', row.get('pop_start_date'))),
                    parse_date(row.get('popEndDate', row.get('pop_end_date'))),
                    clean_value(row.get('popAddress', row.get('pop_address'))),
                    clean_value(row.get('popCity', row.get('pop_city'))),
                    clean_value(row.get('popState', row.get('pop_state'))),
                    clean_value(row.get('popZip', row.get('pop_zip'))),
                    clean_value(row.get('popCountry', row.get('pop_country'))),
                    row.get('active', '').upper() == 'YES' if row.get('active') else None,
                    clean_value(row.get('awardNumber', row.get('award_number'))),
                    parse_decimal(row.get('awardAmount', row.get('award_amount'))),
                    clean_value(row.get('awardee')),
                    clean_value(row.get('awardeeDuns', row.get('awardee_duns'))),
                    clean_value(row.get('awardeeLocation', row.get('awardee_location'))),
                    clean_value(row.get('awardeeCity', row.get('awardee_city'))),
                    clean_value(row.get('awardeeState', row.get('awardee_state'))),
                    clean_value(row.get('awardeeZip', row.get('awardee_zip'))),
                    clean_value(row.get('description')),
                    clean_value(row.get('organizationType', row.get('organization_type'))),
                    clean_value(row.get('uiLink', row.get('ui_link'))),
                    clean_value(row.get('link')),
                    clean_value(row.get('additionalReporting', row.get('additional_reporting'))),
                    clean_value(row.get('fpdsCode', row.get('fpds_code'))),
                    clean_value(row.get('fpdsDescription', row.get('fpds_description'))),
                    clean_value(row.get('officeAddress', row.get('office_address'))),
                    clean_value(row.get('office')),
                    clean_value(row.get('city')),
                    clean_value(row.get('state')),
                    clean_value(row.get('zip')),
                    clean_value(row.get('countryCode', row.get('country_code'))),
                    clean_value(row.get('departmentName', row.get('department_agency'))),
                    clean_value(row.get('subTier', row.get('sub_tier')))
                )
                
                # Skip if no notice_id
                if not values[0]:
                    continue
                
                cur.execute(insert_query, values)
                successful += 1
                
                if successful % 1000 == 0:
                    conn.commit()
                    print(f"Imported {successful} contracts...")
                    
            except Exception as e:
                failed += 1
                if failed <= 10:  # Only print first 10 errors
                    print(f"Error importing row {idx}: {e}")
                continue
        
        conn.commit()
        print(f"\nImport complete!")
        print(f"Successfully imported: {successful} contracts")
        print(f"Failed: {failed} contracts")

def refresh_materialized_views(conn):
    """Refresh materialized views after data import"""
    print("\nRefreshing materialized views...")
    
    views = [
        'mv_spend_by_state',
        'mv_spend_by_agency', 
        'mv_spend_by_naics'
    ]
    
    with conn.cursor() as cur:
        for view in views:
            print(f"Refreshing {view}...")
            cur.execute(f"REFRESH MATERIALIZED VIEW {view}")
        conn.commit()
    
    print("Materialized views refreshed successfully")

def main():
    """Main import function"""
    print("Connecting to Supabase database...")
    
    try:
        conn = psycopg2.connect(SUPABASE_DB_URL)
        print("Connected successfully!")
        
        # Import NAICS codes first
        import_naics_codes(conn)
        
        # Import contracts
        # Start with a smaller batch for testing
        import_contracts(conn, limit=100)  # Change to None to import all
        
        # Refresh materialized views
        refresh_materialized_views(conn)
        
        # Show some statistics
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) as count FROM contracts")
            total = cur.fetchone()['count']
            print(f"\nTotal contracts in database: {total}")
            
            cur.execute("""
                SELECT COUNT(*) as count 
                FROM contracts 
                WHERE award_amount IS NOT NULL AND award_amount > 0
            """)
            with_amount = cur.fetchone()['count']
            print(f"Contracts with award amounts: {with_amount}")
        
        conn.close()
        print("\nImport completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()