
# Deployment Guide

This guide covers the complete deployment setup for AssetGuardian using Supabase CLI and GitHub Actions.

## Prerequisites

- Node.js 20+
- Docker (for local development)
- Supabase account
- GitHub account
- OpenAI API key

## Local Development Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Start Local Environment

```bash
# Make the setup script executable
chmod +x scripts/supabase-local-setup.sh

# Run the setup script
./scripts/supabase-local-setup.sh
```

This script will:
- Initialize Supabase project
- Start local Supabase stack
- Run database migrations
- Deploy Edge Functions locally
- Set up local secrets

### 3. Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

## Production Setup

### 1. Create Supabase Projects

Create two Supabase projects:
- **Staging**: For testing deployments
- **Production**: For live application

### 2. GitHub Secrets

Add these secrets to your GitHub repository:

#### Required for all environments:
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token

#### Staging secrets:
- `SUPABASE_STAGING_PROJECT_REF` - Staging project reference
- `SUPABASE_STAGING_URL` - Staging project URL
- `SUPABASE_STAGING_ANON_KEY` - Staging anon key
- `OPENAI_API_KEY_STAGING` - OpenAI API key for staging

#### Production secrets:
- `SUPABASE_PROJECT_REF` - Production project reference
- `SUPABASE_URL` - Production project URL
- `SUPABASE_ANON_KEY` - Production anon key
- `OPENAI_API_KEY` - OpenAI API key for production

### 3. Deployment Branches

- `staging` branch → Deploys to staging environment
- `main` branch → Deploys to production environment

## Manual Deployment

### Deploy to Staging

```bash
# Set environment variables
export SUPABASE_ACCESS_TOKEN="your_token"
export SUPABASE_STAGING_PROJECT_REF="your_staging_ref"
export OPENAI_API_KEY_STAGING="your_staging_openai_key"

# Run deployment script
chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh
```

### Deploy to Production

```bash
# Set environment variables
export SUPABASE_ACCESS_TOKEN="your_token"
export SUPABASE_PROJECT_REF="your_production_ref"
export OPENAI_API_KEY="your_production_openai_key"

# Run deployment script
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## Database Schema

The deployment includes these database components:

### Tables
- `sensor_readings` - IoT sensor data
- `equipment_thresholds` - Alert thresholds per equipment
- `predictive_alerts` - AI-generated alerts
- `automated_work_orders` - Auto-generated work orders

### Functions
- `get_sensor_analysis()` - Statistical analysis of sensor data
- `check_threshold_violations()` - Real-time threshold monitoring

### Sample Data
- Equipment thresholds for common HVAC equipment
- 24 hours of sample sensor readings
- Example predictive alerts and work orders

## CI/CD Pipeline

The GitHub Actions workflow includes:

### On Pull Request:
- Type checking
- Build validation
- No deployment

### On Push to Staging:
- Run tests
- Create database backup
- Deploy migrations
- Deploy Edge Functions
- Set secrets
- Build and deploy frontend

### On Push to Main:
- Same as staging but to production
- Additional confirmation steps

### Manual Deployment:
- Choose environment (staging/production)
- Run full deployment pipeline

## Monitoring and Rollback

### Database Backups
- Automatic backups before each deployment
- Stored as workflow artifacts
- Named with timestamp for easy identification

### Rollback Process
If deployment fails:
1. Check the backup files in workflow artifacts
2. Use Supabase dashboard to restore from backup
3. Revert code changes if necessary

### Health Checks
Monitor these endpoints after deployment:
- `/api/health` - Frontend health
- Edge Function logs in Supabase dashboard
- Database connection via Supabase Studio

## Troubleshooting

### Common Issues

1. **Migration Failures**
   - Check database schema conflicts
   - Review migration files for syntax errors
   - Verify foreign key constraints

2. **Edge Function Deployment Issues**
   - Ensure OpenAI API key is set correctly
   - Check function logs in Supabase dashboard
   - Verify TypeScript compilation

3. **Frontend Build Errors**
   - Check environment variable configuration
   - Verify Supabase URL and keys
   - Review TypeScript errors

### Getting Help

- Check Supabase CLI docs: https://supabase.com/docs/reference/cli
- Review GitHub Actions logs for detailed error messages
- Use `supabase status` to check local environment
- Check Edge Function logs: `supabase functions logs`

## Security Considerations

- Never commit API keys to git
- Use environment-specific API keys
- Enable Row Level Security (RLS) on all tables
- Regularly rotate access tokens
- Monitor database access logs
