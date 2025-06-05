#!/usr/bin/env python3
import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv('SUPABASE_DB_URL')

print("Importing NAICS codes...")
conn = psycopg2.connect(SUPABASE_DB_URL)

try:
    # First, let's just insert some common NAICS codes that appear in the contracts
    naics_codes = [
        ('531120', 'Lessors of Nonresidential Buildings (except Miniwarehouses)'),
        ('541512', 'Computer Systems Design Services'),
        ('541511', 'Custom Computer Programming Services'),
        ('541519', 'Other Computer Related Services'),
        ('541330', 'Engineering Services'),
        ('541611', 'Administrative Management and General Management Consulting Services'),
        ('541990', 'All Other Professional, Scientific, and Technical Services'),
        ('236220', 'Commercial and Institutional Building Construction'),
        ('238210', 'Electrical Contractors and Other Wiring Installation Contractors'),
        ('561210', 'Facilities Support Services'),
    ]
    
    cur = conn.cursor()
    for code, title in naics_codes:
        cur.execute("""
            INSERT INTO naics_codes (code, title)
            VALUES (%s, %s)
            ON CONFLICT (code) DO UPDATE
            SET title = EXCLUDED.title
        """, (code, title))
    
    # Also handle the numeric format from CSV
    # The CSV has NAICS codes as floats like 531120.0
    for code, title in naics_codes:
        numeric_code = f"{code}.0"
        cur.execute("""
            INSERT INTO naics_codes (code, title)
            VALUES (%s, %s)
            ON CONFLICT (code) DO UPDATE
            SET title = EXCLUDED.title
        """, (numeric_code, title))
    
    conn.commit()
    
    # Check count
    cur.execute("SELECT COUNT(*) FROM naics_codes")
    count = cur.fetchone()[0]
    print(f"NAICS codes in database: {count}")
    
    cur.close()
    conn.close()
    print("Done!")
    
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()