#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to show current mode
show_current_mode() {
    current_mode=$(grep "NEXT_PUBLIC_DATABASE_MODE=" .env.local | cut -d '=' -f2)
    echo -e "${BLUE}Current mode: ${YELLOW}$current_mode${NC}"
}

# Function to switch mode
switch_mode() {
    if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
        echo -e "${BLUE}Switching to Production (Supabase)...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=production/' .env.local
        else
            # Linux
            sed -i 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=production/' .env.local
        fi
        echo -e "${GREEN}✅ Switched to Production mode (Supabase)${NC}"
        echo -e "${YELLOW}⚠️  Remember to restart your dev server!${NC}"
    elif [ "$1" = "dev" ] || [ "$1" = "development" ]; then
        echo -e "${BLUE}Switching to Development (Local PostgreSQL)...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=development/' .env.local
        else
            # Linux
            sed -i 's/NEXT_PUBLIC_DATABASE_MODE=.*/NEXT_PUBLIC_DATABASE_MODE=development/' .env.local
        fi
        echo -e "${GREEN}✅ Switched to Development mode (Local PostgreSQL)${NC}"
        echo -e "${YELLOW}⚠️  Remember to restart your dev server!${NC}"
        
        # Check if PostgreSQL is running (only on macOS with brew)
        if command -v brew &> /dev/null; then
            if brew services list | grep -q "postgresql.*started"; then
                echo -e "${GREEN}✓ PostgreSQL is running${NC}"
            else
                echo -e "${YELLOW}⚠️  PostgreSQL is not running. Start it with: brew services start postgresql${NC}"
            fi
        fi
    elif [ "$1" = "status" ]; then
        show_current_mode
        echo ""
        echo "Database connections:"
        echo -e "${BLUE}Production (Supabase):${NC}"
        echo "  URL: $(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2)"
        echo -e "${BLUE}Development (PostgreSQL):${NC}"
        echo "  Host: $(grep "DB_HOST=" .env.local | cut -d '=' -f2)"
        echo "  Database: $(grep "DB_NAME=" .env.local | cut -d '=' -f2)"
    else
        echo "GovChime Environment Switcher"
        echo ""
        show_current_mode
        echo ""
        echo "Usage: ./switch-env.sh [command]"
        echo ""
        echo "Commands:"
        echo "  prod, production  - Switch to Production mode (Supabase)"
        echo "  dev, development  - Switch to Development mode (Local PostgreSQL)"
        echo "  status           - Show current mode and connection details"
        echo ""
        echo "Examples:"
        echo "  ./switch-env.sh prod    # Use Supabase"
        echo "  ./switch-env.sh dev     # Use local PostgreSQL"
        echo "  ./switch-env.sh status  # Check current mode"
    fi
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found!${NC}"
    echo "Please create .env.local first by copying from env.example"
    exit 1
fi

# Execute the switch
switch_mode $1