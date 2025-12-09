# CORS Configuration Fix

## ✅ Changes Made

Added `https://demoaasc.xesstechlink.com` to the allowed CORS origins in the admin server.

### Updated Files:
- `admin-server/src/server.js`

### Added Origins:
- `https://demoaasc.xesstechlink.com`
- `http://demoaasc.xesstechlink.com` (for development/testing)

---

## 🔄 Next Steps

### 1. Restart the Admin Server

After making these changes, you need to restart the admin server:

```bash
cd admin-server
npm start
# or
node src/server.js
```

### 2. Verify CORS is Working

Test from the browser console on `https://demoaasc.xesstechlink.com/`:

```javascript
fetch('https://apiaasc.veetusaapadu.in/api/carousel')
  .then(res => res.json())
  .then(data => console.log('CORS working!', data))
  .catch(err => console.error('CORS error:', err));
```

---

## 📋 Current Allowed Origins

The server now allows CORS requests from:

- `http://localhost:3003`
- `http://localhost:3002`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `https://apiaasc.veetusaapadu.in`
- `https://aaasc.edu.in`
- `https://www.aaasc.edu.in`
- `https://admin.aaasc.edu.in`
- **`https://demoaasc.xesstechlink.com`** ✅ (NEW)
- `http://demoaasc.xesstechlink.com` ✅ (NEW)

---

## 🔧 How CORS Works in This Server

1. **Origin Check**: The server checks if the request origin is in the allowed list
2. **Preflight Requests**: OPTIONS requests are handled explicitly
3. **Credentials**: CORS credentials are enabled for authenticated requests
4. **Headers**: Allows common headers like Content-Type, Authorization, etc.

---

## ⚠️ Troubleshooting

If CORS errors persist:

1. **Check server is restarted** - Changes only take effect after restart
2. **Verify origin format** - Browser sends exact origin (e.g., `https://demoaasc.xesstechlink.com`)
3. **Check browser console** - Look for specific CORS error messages
4. **Test with curl**:
   ```bash
   curl -H "Origin: https://demoaasc.xesstechlink.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://apiaasc.veetusaapadu.in/api/carousel
   ```

---

## 📝 Notes

- The server allows requests with no origin (useful for server-to-server calls)
- Both HTTP and HTTPS versions are allowed for flexibility
- CORS credentials are enabled for cookie-based authentication

---

**After restarting the server, CORS errors from `https://demoaasc.xesstechlink.com/` should be resolved!** ✅

