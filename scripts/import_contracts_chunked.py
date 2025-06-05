#!/usr/bin/env python3
"""
Import contracts in chunks to handle large CSV files efficiently
"""
import os
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv('SUPABASE_DB_URL')
if not SUPABASE_DB_URL:
    print("Error: SUPABASE_DB_URL not set")
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
        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%Y/%m/%d', '%d-%m-%Y']:
            try:
                return datetime.strptime(str(date_str).strip(), fmt).date()
            except:
                continue
        return None
    except:
        return None

def parse_decimal(val):
    """Parse decimal values"""
    if pd.isna(val) or val == '':
        return None
    try:
        # Remove currency symbols and commas
        if isinstance(val, str):
            val = val.replace('$', '').replace(',', '').strip()
        return float(val) if val else None
    except:
        return None

def main():
    print("Connecting to database...")
    conn = psycopg2.connect(SUPABASE_DB_URL)
    print("Connected!")
    
    csv_file = 'data/FY2020_archived_opportunities.csv'
    
    # First, get a sample to see columns
    print("Reading sample to analyze columns...")
    for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
        try:
            df_sample = pd.read_csv(csv_file, nrows=5, encoding=encoding)
            print(f"Using encoding: {encoding}")
            print(f"Columns: {list(df_sample.columns)}")
            break
        except:
            continue
    
    # Process in chunks
    chunk_size = 1000
    total_imported = 0
    
    print(f"Processing CSV in chunks of {chunk_size}...")
    
    # We'll insert NAICS codes on the fly during import
    
    try:
        for chunk_num, chunk in enumerate(pd.read_csv(csv_file, chunksize=chunk_size, encoding=encoding)):
            print(f"Processing chunk {chunk_num + 1} ({len(chunk)} records)...")
            
            records = []
            for idx, row in chunk.iterrows():
                # Map columns based on actual CSV column names
                record = (
                    clean_value(row.get('NoticeId')),  # notice_id
                    clean_value(row.get('Title')),  # title
                    clean_value(row.get('Sol#')),  # sol_number
                    clean_value(row.get('Department/Ind.Agency')),  # fullparentpathname
                    clean_value(row.get('CGAC')),  # fullparentpathcode
                    parse_date(row.get('PostedDate')),  # posted_date
                    clean_value(row.get('Type')),  # type
                    clean_value(row.get('BaseType')),  # base_type
                    clean_value(row.get('ArchiveType')),  # archive_type
                    parse_date(row.get('ArchiveDate')),  # archive_date
                    clean_value(row.get('SetASide')),  # set_aside_description
                    clean_value(row.get('SetASideCode')),  # set_aside
                    parse_date(row.get('ResponseDeadLine')),  # response_deadline
                    str(int(float(row.get('NaicsCode')))) if pd.notna(row.get('NaicsCode')) and row.get('NaicsCode') else None,  # naics_code
                    None,  # naics_description (not in CSV)
                    clean_value(row.get('ClassificationCode')),  # classification_code
                    None,  # classification_description (not in CSV)
                    None,  # pop_start_date (not in CSV)
                    None,  # pop_end_date (not in CSV)
                    clean_value(row.get('PopStreetAddress')),  # pop_address
                    clean_value(row.get('PopCity')),  # pop_city
                    clean_value(row.get('PopState')),  # pop_state
                    clean_value(row.get('PopZip')),  # pop_zip
                    clean_value(row.get('PopCountry')),  # pop_country
                    clean_value(row.get('Active')) == 'Yes' if row.get('Active') else False,  # active
                    clean_value(row.get('AwardNumber')),  # award_number
                    parse_decimal(row.get('Award$')),  # award_amount
                    clean_value(row.get('Awardee')),  # awardee
                    None,  # awardee_duns (not in CSV)
                    None,  # awardee_location (not in CSV)
                    None,  # awardee_city (not in CSV)
                    None,  # awardee_state (not in CSV)
                    None,  # awardee_zip (not in CSV)
                    clean_value(row.get('Description')),  # description
                    clean_value(row.get('OrganizationType')),  # organization_type
                    None,  # ui_link (not in CSV)
                    clean_value(row.get('Link')),  # link
                    clean_value(row.get('AdditionalInfoLink')),  # additional_reporting
                    clean_value(row.get('FPDS Code')),  # fpds_code
                    None,  # fpds_description (not in CSV)
                    None,  # office_address (not in CSV)
                    clean_value(row.get('Office')),  # office
                    clean_value(row.get('City')),  # city
                    clean_value(row.get('State')),  # state
                    clean_value(row.get('ZipCode')),  # zip
                    clean_value(row.get('CountryCode')),  # country_code
                    clean_value(row.get('Department/Ind.Agency')),  # department_agency
                    clean_value(row.get('Sub-Tier'))  # sub_tier
                )
                
                # Skip if no notice_id
                if record[0]:
                    records.append(record)
            
            # Bulk insert
            if records:
                cur = conn.cursor()
                
                # First, ensure all NAICS codes exist
                naics_codes = set()
                states = set()
                for record in records:
                    if record[13]:  # naics_code is at index 13
                        naics_codes.add(record[13])
                    if record[44]:  # state is at index 44
                        states.add(record[44])
                    if record[21]:  # pop_state is at index 21
                        states.add(record[21])
                
                for code in naics_codes:
                    cur.execute("""
                        INSERT INTO naics_codes (code, title)
                        VALUES (%s, %s)
                        ON CONFLICT (code) DO NOTHING
                    """, (code, f"NAICS Code {code}"))
                
                # Insert any missing states
                for state in states:
                    if state and len(state) == 2:  # Valid state code
                        cur.execute("""
                            INSERT INTO states (code, name)
                            VALUES (%s, %s)
                            ON CONFLICT (code) DO NOTHING
                        """, (state, state))  # Use code as name for now
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
                
                execute_batch(cur, insert_query, records, page_size=100)
                conn.commit()
                cur.close()
                
                total_imported += len(records)
                print(f"  Imported {len(records)} records. Total: {total_imported}")
            
            # Stop after 10 chunks for testing
            if chunk_num >= 9:
                print("Stopping after 10 chunks for testing...")
                break
    
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    
    # Check final count
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM contracts")
    count = cur.fetchone()[0]
    print(f"\nFinal count in database: {count}")
    
    cur.close()
    conn.close()
    print("Done!")

if __name__ == "__main__":
    main()