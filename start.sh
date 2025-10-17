#!/bin/bash

# OBO-Berk Startup Script
# Simplifies starting the application in different modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     OBO-Berk (โอโบ-เบิก)              ║${NC}"
echo -e "${BLUE}║  Expense Tracking System - Obodroid   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to show menu
show_menu() {
    echo -e "${YELLOW}Please select an option:${NC}"
    echo ""
    echo "1) 🚀 Start Production (http://localhost)"
    echo "2) 💻 Start Development (http://localhost:5173)"
    echo "3) 📊 View Logs"
    echo "4) 🛑 Stop Services"
    echo "5) 🧹 Clean Everything"
    echo "6) 💾 Backup Data"
    echo "7) 📋 Show Running Containers"
    echo "8) 🔧 Rebuild Images"
    echo "9) ❓ Help"
    echo "0) 🚪 Exit"
    echo ""
    echo -n "Enter choice [0-9]: "
}

# Function to start production
start_production() {
    echo -e "${GREEN}Starting production environment...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}✓ Application started successfully!${NC}"
    echo ""
    echo -e "Access the application at:"
    echo -e "  Frontend:    ${BLUE}http://localhost${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:5000/api${NC}"
    echo ""
    echo "To view logs, run: docker-compose logs -f"
}

# Function to start development
start_development() {
    echo -e "${GREEN}Starting development environment...${NC}"
    echo -e "${YELLOW}Note: This will run in foreground with live logs${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    sleep 2
    docker-compose -f docker-compose.dev.yml up
}

# Function to view logs
view_logs() {
    echo -e "${GREEN}Viewing logs (Press Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Function to clean everything
clean_everything() {
    echo -e "${RED}⚠️  WARNING: This will remove all containers, volumes, and images!${NC}"
    echo -n "Are you sure? (yes/no): "
    read -r confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Cleaning up...${NC}"
        docker-compose down -v --rmi all
        echo -e "${GREEN}✓ Cleanup complete${NC}"
    else
        echo "Cancelled"
    fi
}

# Function to backup data
backup_data() {
    echo -e "${GREEN}Creating backup...${NC}"
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # Backup MongoDB
    docker-compose exec -T mongodb mongodump --db obo-berk --archive > "$BACKUP_DIR/mongodb.archive" 2>/dev/null || {
        echo -e "${RED}Failed to backup MongoDB. Is it running?${NC}"
        return 1
    }

    # Backup uploads
    docker cp obo-berk-backend:/app/uploads "$BACKUP_DIR/uploads" 2>/dev/null || {
        echo -e "${YELLOW}Warning: Could not backup uploads directory${NC}"
    }

    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
}

# Function to show running containers
show_containers() {
    echo -e "${GREEN}Running containers:${NC}"
    docker-compose ps
}

# Function to rebuild images
rebuild_images() {
    echo -e "${YELLOW}Rebuilding images without cache...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✓ Images rebuilt${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}OBO-Berk Help${NC}"
    echo ""
    echo "Quick Start:"
    echo "  ./start.sh          - Interactive menu"
    echo "  ./start.sh prod     - Start production"
    echo "  ./start.sh dev      - Start development"
    echo "  ./start.sh logs     - View logs"
    echo "  ./start.sh stop     - Stop services"
    echo ""
    echo "For detailed documentation, see:"
    echo "  - README.md for general information"
    echo "  - DOCKER.md for Docker-specific instructions"
    echo ""
}

# Main script logic
case "${1:-menu}" in
    prod|production)
        start_production
        ;;
    dev|development)
        start_development
        ;;
    logs)
        view_logs
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_everything
        ;;
    backup)
        backup_data
        ;;
    ps|status)
        show_containers
        ;;
    rebuild)
        rebuild_images
        ;;
    help|--help|-h)
        show_help
        ;;
    menu)
        # Interactive menu
        while true; do
            show_menu
            read -r choice
            echo ""
            case $choice in
                1) start_production; break ;;
                2) start_development; break ;;
                3) view_logs; break ;;
                4) stop_services; break ;;
                5) clean_everything; break ;;
                6) backup_data ;;
                7) show_containers ;;
                8) rebuild_images ;;
                9) show_help ;;
                0) echo "Goodbye!"; exit 0 ;;
                *) echo -e "${RED}Invalid option${NC}" ;;
            esac
            echo ""
            echo -n "Press Enter to continue..."
            read -r
            clear
        done
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
