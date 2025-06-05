# GovChime - Government Contract Intelligence Platform

A modern web application for discovering, analyzing, and tracking government contracts and grants with powerful analytics and real-time market intelligence.

## Features

- **Federal Contracts Browser**: Search and filter through government contracts from SAM.gov
- **Advanced Analytics**: 
  - Spend Analysis by Geography, Agency, and NAICS codes
  - Contractor Performance Analysis
- **Dark Mode Support**: Toggle between light and dark themes
- **Real-time Search**: Fast, responsive search with multiple filter options
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15
- **Container**: Docker

## Prerequisites

- Node.js 18+ 
- Yarn package manager
- Docker Desktop
- PostgreSQL client (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd govchime-app
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Set up the database

Start PostgreSQL using Docker:

```bash
cd scripts
docker-compose up -d
```

### 4. Initialize the database

Run the initialization script:

```bash
docker exec -i govchime_db psql -U govchime -d govchime < init.sql
docker exec -i govchime_db psql -U govchime -d govchime < update_schema.sql
```

### 5. Import data

To import contract data and NAICS codes:

```bash
pip install pandas openpyxl psycopg2-binary
python import_data.py ../data/FY2020_archived_opportunities.csv
```

### 6. Configure environment variables

Create a `.env.local` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=govchime
DB_USER=govchime
DB_PASSWORD=govchime_secure_password

NEXT_PUBLIC_APP_NAME=GovChime
NEXT_PUBLIC_APP_DESCRIPTION=Government Contract Intelligence Platform
```

### 7. Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
govchime-app/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── contracts/    # Contract pages
│   │   ├── analytics/    # Analytics pages
│   │   └── ...
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── scripts/             # Database and maintenance scripts
├── data/                # Data files
└── public/              # Static assets
```

## API Endpoints

- `GET /api/contracts` - Fetch contracts with filters
- `GET /api/contracts/filters` - Get available filter options
- `GET /api/analytics/spend` - Spend analysis data
- `GET /api/analytics/contractors` - Contractor analysis data
- `GET /api/lookup` - Lookup state names and NAICS descriptions

## Database Schema

The main `contracts` table contains all government contract data with indexes for performance. Additional tables include:

- `naics_codes` - NAICS code descriptions
- `states` - State code to name mappings
- Materialized views for analytics performance

## Deployment

For production deployment:

1. Build the application:
   ```bash
   yarn build
   ```

2. Start the production server:
   ```bash
   yarn start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.