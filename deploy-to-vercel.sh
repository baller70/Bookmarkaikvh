#!/bin/bash

# 🚀 Vercel Deployment Script for BookmarkHub
# This script prepares and deploys the application to Vercel

set -e  # Exit on any error

echo "🚀 BookmarkHub Vercel Deployment Script"
echo "========================================"

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

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    print_error "This script must be run from the repository root directory"
    exit 1
fi

print_status "Starting deployment preparation..."

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm not found. Installing..."
    npm install -g pnpm
fi

print_success "Prerequisites checked"

# Step 2: Clean and install dependencies
print_status "Installing dependencies..."
cd apps/web
pnpm install --frozen-lockfile
cd ../..

print_success "Dependencies installed"

# Step 3: Run pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if build works
print_status "Testing build process..."
cd apps/web
if pnpm build; then
    print_success "Build test passed"
else
    print_error "Build test failed. Please fix build errors before deploying."
    exit 1
fi
cd ../..

# Step 4: Check environment variables
print_status "Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    print_warning "No .env.local file found. Make sure to set environment variables in Vercel dashboard."
else
    print_success "Local environment file found"
fi

# Step 5: Verify Vercel configuration
print_status "Verifying Vercel configuration..."

if [ -f "vercel.json" ]; then
    print_success "vercel.json found"
else
    print_warning "No vercel.json found. Using default Vercel settings."
fi

# Step 6: Check for common deployment issues
print_status "Checking for common deployment issues..."

# Check for hardcoded localhost URLs
if grep -r "localhost:3000" apps/web/src/ apps/web/app/ 2>/dev/null | grep -v ".next" | grep -v "node_modules"; then
    print_warning "Found hardcoded localhost URLs. These should be replaced with environment variables."
fi

# Check for console.log statements (optional cleanup)
log_count=$(grep -r "console\.log" apps/web/src/ apps/web/app/ 2>/dev/null | grep -v ".next" | grep -v "node_modules" | wc -l || echo "0")
if [ "$log_count" -gt 0 ]; then
    print_warning "Found $log_count console.log statements. Consider removing them for production."
fi

print_success "Pre-deployment checks completed"

# Step 7: Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if already linked to a Vercel project
if [ ! -d ".vercel" ]; then
    print_status "Linking to Vercel project..."
    vercel link --yes
fi

# Deploy to production
print_status "Deploying to production..."
if vercel --prod --yes; then
    print_success "🎉 Deployment successful!"
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls --meta | grep "https://" | head -1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "🌐 Your app is live at: $DEPLOYMENT_URL"
        
        # Set custom domain if specified
        CUSTOM_DOMAIN="bookmarkhub-web.vercel.app"
        print_status "Setting up custom domain: $CUSTOM_DOMAIN"
        vercel domains add "$CUSTOM_DOMAIN" --yes || print_warning "Custom domain setup may need manual configuration"
    fi
    
    # Run post-deployment checks
    print_status "Running post-deployment checks..."
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        # Check if the site is accessible
        if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200"; then
            print_success "✅ Site is accessible and responding"
        else
            print_warning "⚠️ Site might not be fully accessible yet. Please check manually."
        fi
        
        # Check API endpoints
        if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health" | grep -q "200"; then
            print_success "✅ API endpoints are working"
        else
            print_warning "⚠️ API endpoints might need attention"
        fi
    fi
    
else
    print_error "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

# Step 8: Final instructions
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
print_success "Your BookmarkHub application has been deployed to Vercel!"
echo ""
echo "📋 Next Steps:"
echo "1. 🌐 Visit your live site and test all functionality"
echo "2. 🔧 Configure environment variables in Vercel dashboard if needed"
echo "3. 📊 Set up monitoring and analytics"
echo "4. 🔒 Verify SSL certificate is working"
echo "5. 📱 Test mobile responsiveness"
echo "6. 🔍 Test search functionality"
echo "7. 📑 Test bookmark creation and management"
echo ""
echo "🔗 Useful Links:"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • Project Settings: https://vercel.com/dashboard/settings"
echo "   • Domain Settings: https://vercel.com/dashboard/domains"
echo ""
print_success "Happy bookmarking! 🔖"
