# Data Directory

This directory contains the data files needed for the GovChime application.

## Required Files

1. **FY2020_archived_opportunities.csv** - Government contract opportunities data
   - Download from: [Your data source]
   - Contains: Contract records with details like title, agency, amount, etc.

2. **6-digit_2022_Codes.xlsx** - NAICS (North American Industry Classification System) codes
   - Download from: [Your data source]
   - Contains: Industry classification codes and descriptions

## Note

These files are not included in the repository due to their size. You'll need to obtain them separately and place them in this directory before running the import scripts.

The import script (`scripts/import_data.py`) expects these files to be present in this directory.