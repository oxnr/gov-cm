#!/usr/bin/env python3
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

SUPABASE_DB_URL = os.getenv('SUPABASE_DB_URL')

if not SUPABASE_DB_URL:
    print("Error: SUPABASE_DB_URL not set")
    exit(1)

print(f"Connecting to database...")
try:
    conn = psycopg2.connect(SUPABASE_DB_URL)
    print("Connected successfully!")
    
    # Test query
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM states")
    count = cur.fetchone()[0]
    print(f"Number of states in database: {count}")
    
    # Check if contracts table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = 'contracts'
        )
    """)
    exists = cur.fetchone()[0]
    print(f"Contracts table exists: {exists}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")