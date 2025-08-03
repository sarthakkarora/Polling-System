#!/bin/bash

# OceanPoll Platform Deployment Script
# This script deploys the OceanPoll Interactive Learning Platform to Render

echo "🌊 OceanPoll Platform Deployment Script"
echo "======================================"

# Check if required environment variables are set
if [ -z "$RENDER_TOKEN" ]; then
    echo "❌ Error: RENDER_TOKEN environment variable is not set"
    echo "Please set your Render API token:"
    echo "export RENDER_TOKEN=your_render_token_here"
    exit 1
fi

if [ -z "$RENDER_SERVICE_ID" ]; then
    echo "❌ Error: RENDER_SERVICE_ID environment variable is not set"
    echo "Please set your Render service ID:"
    echo "export RENDER_SERVICE_ID=your_service_id_here"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Consider committing them before deployment."
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Build the project
print_status "Building OceanPoll Platform..."

# Install dependencies
print_status "Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the client
print_status "Building client application..."
cd client
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build client application"
    exit 1
fi

cd ..

print_success "Build completed successfully!"

# Deploy to Render
print_status "Deploying to Render..."

# Create deployment payload
DEPLOYMENT_PAYLOAD=$(cat <<EOF
{
  "branch": "$CURRENT_BRANCH",
  "commitSha": "$(git rev-parse HEAD)",
  "message": "OceanPoll Platform Deployment - $(date)"
}
EOF
)

# Trigger deployment
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DEPLOYMENT_PAYLOAD" \
  "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys")

# Check if deployment was triggered successfully
if echo "$RESPONSE" | grep -q '"id"'; then
    DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Deployment triggered successfully!"
    print_status "Deployment ID: $DEPLOY_ID"
    print_status "You can monitor the deployment at: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
else
    print_error "Failed to trigger deployment"
    print_error "Response: $RESPONSE"
    exit 1
fi

# Wait for deployment to complete
print_status "Waiting for deployment to complete..."
sleep 10

# Check deployment status
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    STATUS_RESPONSE=$(curl -s -X GET \
      -H "Authorization: Bearer $RENDER_TOKEN" \
      "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys/$DEPLOY_ID")
    
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    case $STATUS in
        "live")
            print_success "Deployment completed successfully!"
            print_status "Your OceanPoll Platform is now live!"
            break
            ;;
        "failed")
            print_error "Deployment failed!"
            print_error "Check the logs at: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
            exit 1
            ;;
        "canceled")
            print_error "Deployment was canceled!"
            exit 1
            ;;
        *)
            print_status "Deployment status: $STATUS (Attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS)"
            sleep 30
            ATTEMPT=$((ATTEMPT + 1))
            ;;
    esac
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_warning "Deployment is taking longer than expected."
    print_status "You can monitor the deployment at: https://dashboard.render.com/web/$RENDER_SERVICE_ID"
fi

print_success "🌊 OceanPoll Platform deployment script completed!"
print_status "Your interactive learning platform is ready for use!" 