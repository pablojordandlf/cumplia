#!/bin/bash

# Test script for duplicate_template function
# This script helps debug the duplicate template functionality

echo "🧪 Testing duplicate_template endpoint..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we have required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Missing Supabase environment variables${NC}"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# Get a sample custom template ID
echo -e "${BLUE}📋 Fetching custom templates...${NC}"
TEMPLATES=$(curl -s -X GET \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/risk_templates?is_system=eq.false&limit=1" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json")

echo "Response: $TEMPLATES"
echo ""

# Extract template ID
TEMPLATE_ID=$(echo $TEMPLATES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TEMPLATE_ID" ]; then
    echo -e "${RED}❌ No custom templates found${NC}"
    echo "Please create at least one custom template first"
    exit 1
fi

echo -e "${GREEN}✓ Found template ID: $TEMPLATE_ID${NC}"
echo ""

# Test the duplicate endpoint
echo -e "${BLUE}🔄 Testing duplicate endpoint...${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST \
  "http://localhost:3000/api/v1/risks/templates/${TEMPLATE_ID}/duplicate" \
  -H "Content-Type: application/json")

echo "Response:"
echo $DUPLICATE_RESPONSE | jq . 2>/dev/null || echo $DUPLICATE_RESPONSE
echo ""

# Check if successful
if echo $DUPLICATE_RESPONSE | grep -q '"template"'; then
    echo -e "${GREEN}✅ Duplicate endpoint working!${NC}"
    NEW_ID=$(echo $DUPLICATE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "New template ID: $NEW_ID"
else
    echo -e "${RED}❌ Duplicate endpoint failed${NC}"
    if echo $DUPLICATE_RESPONSE | grep -q '"error"'; then
        ERROR=$(echo $DUPLICATE_RESPONSE | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        echo "Error: $ERROR"
    fi
fi

echo ""
echo -e "${YELLOW}📝 Debugging tips:${NC}"
echo "1. Check browser console (F12) for any JS errors"
echo "2. Check Network tab to see API response"
echo "3. Review server logs: tail -f ~/.openclaw/workspace/cumplia/logs/*.log"
echo "4. Test SQL function directly in Supabase dashboard"
