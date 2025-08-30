#!/bin/bash

# Setup Vercel Environment Variables for Supabase
# Run this script after replacing the keys with your actual values

echo "Setting up Vercel environment variables..."

# Replace these with your actual Supabase keys
SUPABASE_URL="https://kljhlubpxxcawacrzaix.supabase.co"
ANON_KEY="your-anon-key-here"  # Replace with actual anon key
SERVICE_ROLE_KEY="your-service-role-key-here"  # Replace with actual service role key

# Set environment variables on Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SERVICE_ROLE_KEY"

# Also set for preview environments
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$SERVICE_ROLE_KEY"

echo "Environment variables set! Redeploy your app for changes to take effect."
echo "Run: vercel --prod"
