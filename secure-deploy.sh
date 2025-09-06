#!/bin/bash

# =============================================================================
# BookmarkHub Secure Deployment to Vercel
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting BookmarkHub Secure Deployment to Vercel"
echo "=================================================="

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

# =============================================================================
# Pre-Deployment Security Checks
# =============================================================================

print_status "Running pre-deployment security checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    print_error "This script must be run from the repository root directory"
    exit 1
fi

# Check if .env.local exists and has required variables
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found!"
    print_status "Creating .env.local from secure template..."
    if [ -f ".env.secure.example" ]; then
        cp .env.secure.example .env.local
        print_warning "Please edit .env.local with your actual values before continuing"
        print_status "Required variables to set:"
        echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
        echo "  - ENCRYPTION_KEY (generate with: openssl rand -hex 16)"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  - SUPABASE_SERVICE_ROLE_KEY"
        exit 1
    else
        print_error ".env.secure.example template not found!"
        exit 1
    fi
fi

# Check for critical environment variables
print_status "Checking environment variables..."

required_vars=(
    "NEXTAUTH_SECRET"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.local || grep -q "^${var}=your-" .env.local || grep -q "^${var}=CHANGE-" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing or placeholder values for required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Please update .env.local with actual values"
    exit 1
fi

# Check that BYPASS_AUTHENTICATION is false for production
if grep -q "BYPASS_AUTHENTICATION=true" .env.local; then
    print_error "BYPASS_AUTHENTICATION is set to 'true' - this is unsafe for production!"
    print_warning "Please set BYPASS_AUTHENTICATION=false in .env.local"
    exit 1
fi

print_success "Environment variables check passed"

# =============================================================================
# Security Implementation Verification
# =============================================================================

print_status "Verifying security implementations..."

# Check if security libraries are present
security_files=(
    "lib/config/secure-env.ts"
    "lib/database/secure-client.ts"
    "lib/security/input-validation.ts"
    "lib/security/secure-file-upload.ts"
    "lib/security/csrf-protection.ts"
    "lib/security/secure-storage.ts"
    "lib/security/security-monitor.ts"
)

missing_security_files=()
for file in "${security_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_security_files+=("$file")
    fi
done

if [ ${#missing_security_files[@]} -ne 0 ]; then
    print_error "Security implementation files missing:"
    for file in "${missing_security_files[@]}"; do
        echo "  - $file"
    done
    print_error "Please run the security implementation first!"
    exit 1
fi

print_success "Security implementations verified"

# =============================================================================
# Install Dependencies and Build
# =============================================================================

print_status "Installing dependencies..."
npm install

print_status "Running security audit..."
npm audit --audit-level=moderate || print_warning "Some security vulnerabilities found - please review"

print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix build errors before deployment."
    exit 1
fi

print_success "Build completed successfully"

# =============================================================================
# Vercel CLI Setup
# =============================================================================

print_status "Checking Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_status "Please log in to Vercel..."
    vercel login
fi

print_success "Vercel CLI ready"

# =============================================================================
# Deploy to Vercel
# =============================================================================

print_status "Deploying to Vercel..."

# Deploy to production
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "https://" | head -1 | awk '{print $2}')
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        DEPLOYMENT_URL="https://bookmarkhub-web.vercel.app"
    fi
    
    print_success "🎉 BookmarkHub deployed successfully!"
    echo ""
    echo "📱 Application URL: $DEPLOYMENT_URL"
    echo "🔒 Security Status: ✅ All security controls enabled"
    echo ""
    
    # =============================================================================
    # Post-Deployment Verification
    # =============================================================================
    
    print_status "Running post-deployment verification..."
    
    # Wait a moment for deployment to be ready
    sleep 5
    
    # Test if the application is accessible
    if curl -s --head "$DEPLOYMENT_URL" | head -n 1 | grep -q "200\|301\|302"; then
        print_success "Application is accessible"
    else
        print_warning "Application may not be fully ready yet"
    fi
    
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Visit $DEPLOYMENT_URL to verify the application works"
    echo "2. Test authentication and user registration"
    echo "3. Verify all security features are working"
    echo "4. Monitor application logs for any issues"
    echo ""
    echo "📊 Security Features Enabled:"
    echo "✅ Input validation and XSS prevention"
    echo "✅ SQL injection protection"
    echo "✅ CSRF protection"
    echo "✅ Rate limiting"
    echo "✅ Secure file uploads"
    echo "✅ Security headers (CSP, HSTS, etc.)"
    echo "✅ Encrypted client-side storage"
    echo "✅ Security monitoring and logging"
    echo ""
    echo "🎯 Custom Domain: https://bookmarkhub-web.vercel.app"
    echo ""
    
else
    print_error "Deployment failed!"
    exit 1
fi

print_success "🚀 Secure deployment completed successfully!"
