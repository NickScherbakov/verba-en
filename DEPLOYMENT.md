# Deployment Guide

This guide will help you deploy your Verba-EN Telegram Mini App to various platforms.

## Prerequisites

Before deploying, make sure you have:
1. Created a Telegram bot via [@BotFather](https://t.me/botfather)
2. Obtained your bot token
3. Uploaded a PDF book to the `/books` directory (or plan to do so after deployment)

## Option 1: Heroku (Recommended for beginners)

### Steps:

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   # Or use package manager:
   # macOS: brew tap heroku/brew && brew install heroku
   # Ubuntu: curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**
   ```bash
   heroku create verba-en-yourname
   ```

4. **Set environment variables**
   ```bash
   heroku config:set BOT_TOKEN="your_bot_token_from_botfather"
   heroku config:set WEB_APP_URL="https://verba-en-yourname.herokuapp.com"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Configure your bot in Telegram**
   - Go to [@BotFather](https://t.me/botfather)
   - Use `/setmenubutton` command
   - Select your bot
   - Set button text: "📚 Open Reader"
   - Set Web App URL: `https://verba-en-yourname.herokuapp.com`

7. **Upload your PDF**
   - Use Heroku CLI to upload: `heroku run bash`
   - Or use a file storage service and modify the code to download from there

## Option 2: Vercel

Vercel is great for static sites, but you'll need to modify the setup for serverless functions.

### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "src/bot.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/src/bot.js" },
       { "src": "/(.*)", "dest": "/public/$1" }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   - Go to Vercel dashboard
   - Add BOT_TOKEN and WEB_APP_URL in Settings > Environment Variables

## Option 3: Railway

Railway is another easy-to-use platform:

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables in the dashboard
5. Deploy automatically on push

## Option 4: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create a new app from GitHub
3. Configure environment variables
4. Select the appropriate plan
5. Deploy

## Option 5: Your Own VPS

If you have your own server:

### Steps:

1. **Connect to your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/NickScherbakov/verba-en.git
   cd verba-en
   ```

4. **Install dependencies**
   ```bash
   npm install --production
   ```

5. **Set environment variables**
   ```bash
   echo 'export BOT_TOKEN="your_token"' >> ~/.bashrc
   echo 'export WEB_APP_URL="https://your-domain.com"' >> ~/.bashrc
   source ~/.bashrc
   ```

6. **Install PM2 for process management**
   ```bash
   npm install -g pm2
   ```

7. **Start the application**
   ```bash
   pm2 start src/bot.js --name verba-en
   pm2 save
   pm2 startup
   ```

8. **Set up Nginx as reverse proxy** (optional but recommended)
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/verba-en
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/verba-en /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment Checklist

After deploying, make sure to:

- [ ] Test the `/start` command in your bot
- [ ] Verify the web app opens correctly
- [ ] Upload a PDF book to the `/books` directory
- [ ] Test all features (navigation, bookmarks, vocabulary)
- [ ] Check that progress is saved correctly
- [ ] Verify the app works on both mobile and desktop Telegram

## Troubleshooting

### Bot not responding
- Check if your bot token is correct
- Verify environment variables are set
- Check server logs for errors

### Web app not loading
- Verify WEB_APP_URL is correct
- Check if the server is running
- Ensure your domain has valid SSL certificate (required by Telegram)

### PDF not processing
- Check if the PDF is in the `/books` directory
- Verify the file is a valid PDF
- Check server logs for processing errors

## Updating Your App

To update the app after making changes:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the application
pm2 restart verba-en  # If using PM2
# Or push to your hosting platform
```

## Monitoring

For production apps, consider setting up monitoring:
- Use PM2's monitoring: `pm2 monit`
- Set up logging: `pm2 logs verba-en`
- Use external monitoring services like UptimeRobot or Pingdom

## Backup

Important data to backup:
- User data (stored in browser localStorage)
- PDF books in `/books` directory
- Environment variables and configuration

## Support

For deployment issues, check:
1. Server logs
2. Environment variable configuration
3. Network and firewall settings
4. SSL certificate validity

Good luck with your deployment! 🚀
