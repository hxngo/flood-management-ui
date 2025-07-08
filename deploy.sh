#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

LOG_FILE="app.log"
PORT=3000

echo -e "${GREEN}🚀 Starting deployment process...${NC}"

# Function to check if command was successful
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1 successful${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running from project directory: $(pwd)${NC}"

# Stop existing process
echo -e "${YELLOW}🔍 Checking for existing processes...${NC}"
PID=$(ps aux | grep 'npm run start' | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo -e "${YELLOW}🛑 Stopping existing process (PID: $PID)...${NC}"
    kill $PID
    sleep 3
    # Force kill if still running
    if ps -p $PID > /dev/null; then
        kill -9 $PID
        echo -e "${YELLOW}🔨 Force killed process${NC}"
    fi
else
    echo -e "${GREEN}✅ No existing process found${NC}"
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main
check_success "Git pull"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci
check_success "Dependencies installation"

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build
check_success "Build"

# Start the application with nohup
echo -e "${YELLOW}🚀 Starting application...${NC}"
nohup npm run start > $LOG_FILE 2>&1 &
APP_PID=$!

# Wait a moment and check if process is still running
sleep 3
if ps -p $APP_PID > /dev/null; then
    echo -e "${GREEN}✅ Application started successfully!${NC}"
    echo -e "${GREEN}📋 Process ID: $APP_PID${NC}"
    echo -e "${GREEN}🌐 Application should be available at: http://$(curl -s ifconfig.me):$PORT${NC}"
    echo -e "${GREEN}📝 Logs are being written to: $LOG_FILE${NC}"
    echo -e "${YELLOW}📖 To view logs: tail -f $LOG_FILE${NC}"
    echo -e "${YELLOW}🛑 To stop: kill $APP_PID${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo -e "${RED}📝 Check logs: tail $LOG_FILE${NC}"
    exit 1
fi
