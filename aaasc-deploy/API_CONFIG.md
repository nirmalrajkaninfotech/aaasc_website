# API Configuration

## Base URL Configuration

The application now uses a centralized configuration for the API base URL. The default production URL is set to `https://aasc.veetusaapadu.in`.

### Configuration Files

- **`src/config.ts`** - Contains the `API_BASE_URL` constant
- **Environment Variable** - `NEXT_PUBLIC_API_URL` can be set to override the default

### How to Configure

1. **For Production**: The default URL `https://aasc.veetusaapadu.in` will be used automatically
2. **For Local Development**: Set the environment variable in your `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. **For Custom Domains**: Set the environment variable to your desired domain:
   ```
   NEXT_PUBLIC_API_URL=https://yourdomain.com
   ```

### Files Updated

The following files have been updated to use the centralized configuration:
- `src/app/page.tsx`
- `src/app/about/page.tsx`
- `src/app/achievements/page.tsx`
- `src/app/placements/page.tsx`
- `src/app/facilities/page.tsx`
- `src/app/facilities/[id]/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/collage/[id]/page.tsx`
- `src/app/iqac/page.tsx`
- `src/app/alumni-association/page.tsx`

### Benefits

- **Centralized Configuration**: All API calls use the same base URL
- **Easy Environment Switching**: Simple environment variable to switch between local and production
- **Consistent Fallback**: Default production URL ensures the app works even without environment variables
- **Maintainable**: Single place to update the base URL for all API calls
