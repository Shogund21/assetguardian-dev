
#!/bin/bash

# Deploy to Staging Environment
set -e

echo "🚀 Deploying to Staging Environment..."

# Check if required environment variables are set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_STAGING_PROJECT_REF" ]; then
    echo "❌ SUPABASE_STAGING_PROJECT_REF environment variable is required"
    exit 1
fi

# Create backup
echo "💾 Creating database backup..."
BACKUP_FILE="backup-staging-$(date +%Y%m%d-%H%M%S).sql"
supabase db dump --project-ref $SUPABASE_STAGING_PROJECT_REF > "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Run migrations
echo "📊 Running database migrations..."
supabase db push --project-ref $SUPABASE_STAGING_PROJECT_REF

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
supabase functions deploy predictive-ai-analysis --project-ref $SUPABASE_STAGING_PROJECT_REF

# Set secrets
if [ ! -z "$OPENAI_API_KEY_STAGING" ]; then
    echo "🔐 Setting Edge Function secrets..."
    supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY_STAGING" --project-ref $SUPABASE_STAGING_PROJECT_REF
fi

echo "✅ Staging deployment complete!"
echo "🔗 Staging URL: https://$SUPABASE_STAGING_PROJECT_REF.supabase.co"
