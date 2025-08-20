# AAASC Website Deployment Guide

This guide explains how to deploy the AAASC website to a cPanel hosting environment.

## Prerequisites
- cPanel access with Node.js support
- Node.js 18.x or higher
- NPM or Yarn package manager

## Deployment Files

### 1. `server.js`
The main entry point for the Node.js application in production. Handles:
- HTTP server setup
- Request routing
- Error handling
- Process management

### 2. `.cpanel.yml`
cPanel deployment configuration that automates:
- Node.js version selection
- Dependency installation
- Build process
- Application startup

## Deployment Steps

### 1. Upload Files
1. Compress your project files (excluding `node_modules` and `.next` folders) into a ZIP file
2. Log in to cPanel
3. Open "File Manager"
4. Navigate to your target directory (usually `public_html`)
5. Upload the ZIP file
6. Extract the contents

### 2. Set Up Node.js Application
1. In cPanel, find "Setup Node.js App" (under "Software" or similar)
2. Click "Create Application"
   - Node.js version: 18.x or higher
   - Application mode: Production
   - Application root: Your folder (e.g., `public_html/aaasc_website`)
   - Application URL: Your domain
   - Application startup file: `server.js`
3. Click "Create"

### 3. Install Dependencies
1. In the Node.js application settings, find "NPM Install"
2. Click "Run NPM Install"

### 4. Build the Application
1. In Node.js settings, go to "Run Script"
2. Enter: `run cpanel-build`
3. Click "Run"

### 5. Start the Application
1. In Node.js settings, click "Start Application"
2. Check if the application is running

## Environment Variables
Make sure to set these environment variables in your cPanel Node.js application settings:

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
# Add any other environment variables your app needs
```

## Troubleshooting

### Common Issues
1. **Port in use**: Ensure no other application is using the same port
2. **Memory issues**: The build script includes `--max_old_space_size=4096` to help with memory constraints
3. **File permissions**: Ensure the Node.js user has proper read/write permissions
4. **Build errors**: Check the build logs in cPanel's "Error Log" section

### Logs
- Application logs: Check cPanel's "Error Log"
- Node.js logs: Available in the Node.js application settings

## Maintenance

### Updating the Application
1. Upload new files (overwrite existing)
2. Run `npm install` if dependencies changed
3. Rebuild the application
4. Restart the Node.js application

### Monitoring
- Check application status in cPanel's Node.js manager
- Monitor resource usage in cPanel's "Resource Usage" section

## Support
For any deployment issues, please contact your system administrator or refer to the project documentation.
