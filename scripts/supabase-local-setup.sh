
#!/bin/bash

# Supabase Local Development Setup Script
set -e

echo "🚀 Setting up Supabase local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Initialize Supabase project (if not already initialized)
if [ ! -f "supabase/config.toml" ]; then
    echo "📝 Initializing Supabase project..."
    supabase init
else
    echo "✅ Supabase project already initialized"
fi

# Start Supabase local development
echo "🏃 Starting Supabase local development environment..."
supabase start

# Run migrations
echo "📊 Running database migrations..."
supabase db reset

# Deploy Edge Functions locally
echo "⚡ Deploying Edge Functions..."
supabase functions deploy predictive-ai-analysis

# Set local secrets
echo "🔐 Setting up local secrets..."
echo "Please set your OpenAI API key:"
read -s -p "OpenAI API Key: " OPENAI_API_KEY
echo ""
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Local Supabase URLs:"
echo "  Studio URL: http://127.0.0.1:54323"
echo "  API URL: http://127.0.0.1:54321"
echo "  DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "🔧 Next steps:"
echo "  1. Update your .env.local file with the local URLs"
echo "  2. Run 'npm run dev' to start your frontend"
echo "  3. Visit Studio URL to explore your database"
echo ""
echo "🛑 To stop: supabase stop"
echo "🔄 To reset database: supabase db reset"
