# Vercel Deployment Guide for ibtikarCline

This guide will help you deploy your Next.js application to Vercel.

## Prerequisites

1. **GitHub Repository**: Ensure your project is pushed to a GitHub repository
2. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
3. **Environment Variables**: Prepare your production environment variables

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure all your files are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository (`ibtikarCline`)
4. Vercel will automatically detect it's a Next.js project

### 3. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

**Required Environment Variables:**

| Variable          | Value                                                                                  | Description                |
| ----------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| `MONGODB_URI`     | `mongodb+srv://vatimahamdy:7Yatbadi@cluster0.y5xbwdp.mongodb.net/reference-management` | MongoDB connection string  |
| `NEXTAUTH_SECRET` | `my-super-secret-nextauth-key-for-jwt-signing-2024`                                    | NextAuth.js secret key     |
| `NEXTAUTH_URL`    | `https://your-app-name.vercel.app`                                                     | Your Vercel deployment URL |

**Important Notes:**

- Replace `your-app-name` with your actual Vercel app name
- For production, consider generating a new, more secure `NEXTAUTH_SECRET`

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

## Configuration Files

The following files have been created/updated for optimal Vercel deployment:

### `vercel.json`

- Configures Vercel-specific settings
- Sets function timeout to 30 seconds
- Defines environment variable references

### `next.config.js`

- Updated with Vercel-friendly configurations
- Added CORS headers for API routes
- Optimized for serverless deployment

## Post-Deployment Steps

### 1. Update NEXTAUTH_URL

After deployment, update the `NEXTAUTH_URL` environment variable in Vercel dashboard:

- Go to your project settings in Vercel
- Navigate to "Environment Variables"
- Update `NEXTAUTH_URL` to your actual deployment URL

### 2. Test Your Application

Visit your deployed application and test:

- ✅ Homepage loads correctly
- ✅ Authentication works (login/signup)
- ✅ Database operations function
- ✅ Language switching (French/Arabic)
- ✅ All pages are accessible

### 3. Custom Domain (Optional)

To use a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Common Issues

**Build Failures:**

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript/ESLint errors are handled

**Database Connection Issues:**

- Verify MongoDB URI is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check if IP whitelist includes Vercel's IPs

**Authentication Issues:**

- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set correctly
- Check if callback URLs are configured properly

**Environment Variables:**

- Double-check all required environment variables are set
- Ensure no trailing spaces in variable values
- Verify variable names match exactly

### Performance Optimization

- **Images**: Use Next.js Image component for optimized loading
- **Static Files**: Keep static assets in the `public` folder
- **API Routes**: Optimize database queries for serverless functions
- **Caching**: Implement proper caching strategies

## Monitoring

After deployment, monitor your application:

- **Vercel Analytics**: Built-in analytics for performance monitoring
- **Error Tracking**: Check Vercel function logs for errors
- **Performance**: Use Vercel's Web Vitals monitoring

## Automatic Deployments

Vercel automatically deploys when you push to your main branch:

- **Preview Deployments**: Created for pull requests
- **Production Deployments**: Triggered by pushes to main branch
- **Rollbacks**: Easy rollback to previous deployments

## Security Considerations

For production deployment:

1. Generate a new, secure `NEXTAUTH_SECRET`
2. Restrict MongoDB access to specific IPs if possible
3. Enable Vercel's security headers
4. Implement proper input validation
5. Use HTTPS for all communications

## Support

If you encounter issues:

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review build logs in Vercel dashboard
- Check GitHub Issues for common problems
- Contact Vercel support for deployment-specific issues

---

**Your application is now ready for deployment on Vercel!**
