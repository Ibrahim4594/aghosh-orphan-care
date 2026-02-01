# Deployment Guide - Koyeb

This guide will help you deploy the Orphanage Connect application to Koyeb.

## Prerequisites

1. **Koyeb Account** - Sign up at [koyeb.com](https://www.koyeb.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Neon Database** - Your PostgreSQL database (already configured)
4. **Stripe Account** (Optional) - For payment processing
5. **MailerLite Account** (Optional) - For newsletters

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Koyeb deployment"
git push origin main
```

## Step 2: Create a New Koyeb App

1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click **Create App**
3. Choose **GitHub** as the deployment method
4. Select your repository: `Orphanage-Connect`
5. Configure the following:

### Build Settings:
- **Builder**: Docker or Buildpack (choose Buildpack)
- **Build Command**: `npm run build`
- **Run Command**: `npm run start`

### Instance Settings:
- **Instance Type**: Nano (512 MB) or Small (1 GB recommended)
- **Regions**: Choose closest to your users
- **Scaling**: Start with 1 instance

## Step 3: Configure Environment Variables

Add these environment variables in Koyeb:

### Required Variables:
```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your_random_32_character_secret_here
```

### Optional Variables (if using Stripe):
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Optional Variables (if using MailerLite):
```
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=your_group_id
```

### Admin Credentials (Change these!):
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

## Step 4: Configure Health Checks

Koyeb will automatically use the `/health` endpoint for health checks.
The app provides:
- `/health` - Full health check with timestamp
- `/_health` - Simple health check

## Step 5: Deploy

1. Click **Deploy** in Koyeb
2. Wait for the build to complete (3-5 minutes)
3. Your app will be available at: `https://your-app.koyeb.app`

## Step 6: Configure Stripe Webhooks (if using Stripe)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.koyeb.app/api/stripe/webhook`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
4. Copy the webhook signing secret
5. Add it to Koyeb environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 7: Custom Domain (Optional)

1. In Koyeb, go to your app → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Koyeb
4. Enable HTTPS (automatic with Let's Encrypt)

## Monitoring & Logs

- **Logs**: Available in Koyeb Dashboard → Logs
- **Metrics**: CPU, Memory, Network usage in Dashboard
- **Health Checks**: Automatic monitoring of `/health` endpoint

## Troubleshooting

### Build Fails
- Check build logs in Koyeb Dashboard
- Verify `package.json` has correct scripts
- Ensure all dependencies are listed

### App Crashes on Startup
- Check environment variables are set correctly
- Verify DATABASE_URL is correct
- Check logs for specific error messages

### Database Connection Issues
- Ensure DATABASE_URL includes `?sslmode=require`
- Verify Neon database is not paused
- Check IP allowlist in Neon (Koyeb IPs should be allowed)

### High Memory Usage
- Upgrade to Small instance (1 GB RAM)
- Optimize bundle size if needed

## Performance Optimization

### Already Implemented:
✅ Code splitting and lazy loading
✅ Minification and compression
✅ Optimized bundle chunks
✅ Static asset caching
✅ Health check endpoints
✅ Graceful shutdown handling
✅ Error logging and monitoring

### Recommended:
- Enable CDN for static assets
- Use Koyeb's auto-scaling (if traffic increases)
- Monitor performance metrics regularly

## Security Checklist

- [ ] Change admin username and password
- [ ] Use strong SESSION_SECRET (32+ random characters)
- [ ] Enable HTTPS (automatic on Koyeb)
- [ ] Set up Stripe webhook secret
- [ ] Review CORS settings if needed
- [ ] Keep dependencies updated

## Scaling

To handle more traffic:
1. Go to Koyeb Dashboard → Your App → Settings
2. Increase instances (horizontal scaling)
3. Or upgrade instance type (vertical scaling)

## Cost Estimation

Koyeb Pricing (as of 2024):
- **Nano (512 MB)**: ~$4/month
- **Small (1 GB)**: ~$8/month
- **Medium (2 GB)**: ~$16/month

Plus:
- Neon Database: Free tier or ~$19/month for Pro
- Stripe: Pay-as-you-go (2.9% + $0.30 per transaction)
- MailerLite: Free up to 1,000 subscribers

## Support

- Koyeb Docs: https://www.koyeb.com/docs
- Koyeb Status: https://status.koyeb.com
- Community: https://community.koyeb.com

---

**Ready to deploy!** 🚀

If you encounter any issues, check the Koyeb logs first, then review this guide.
