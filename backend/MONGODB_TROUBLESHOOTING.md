# MongoDB Connection Troubleshooting Checklist

## 1. Check MongoDB Atlas Configuration
- [ ] Login to https://cloud.mongodb.com
- [ ] Go to Network Access > IP Whitelist
- [ ] Verify your IP is in the whitelist (or add 0.0.0.0/0 for testing)
- [ ] Check cluster status is "Active" (not paused)

## 2. Verify Connection String
- [ ] Check .env file has MONGO_URI set
- [ ] Format should be: `mongodb+srv://username:password@hostname/?appName=SecretsClan`
- [ ] User credentials are correct
- [ ] No special URL characters like @ in password are properly encoded

## 3. Test Network Connectivity
```powershell
# Test DNS resolution
nslookup secretsclan.eknf6os.mongodb.net

# Test connection (requires MongoDB CLI)
mongosh "mongodb+srv://secretsuser:password@secretsclan.eknf6os.mongodb.net/?appName=SecretsClan"
```

## 4. Check Application Logs
- [ ] Run `npm run dev` and watch for connection messages
- [ ] Look for exact error message and error code
- [ ] Check if retries are happening (exponential backoff)

## 5. Files Modified
- config/db.js - Added timeout options, retry logic, and better error messages
- server.js - Now waits for DB connection before starting app
- utils/offerScheduler.js - Added delays and error handling

## 6. Port and Firewall
- [ ] Verify port 5000 is not blocked locally
- [ ] Check firewall isn't blocking outbound HTTPS (MongoDB Atlas uses 443)

## 7. Last Resort - Use Localhost MongoDB
- [ ] Install MongoDB locally: https://docs.mongodb.com/manual/installation/
- [ ] Change MONGO_URI to: `mongodb://localhost:27017/secretsclan`
- [ ] Run `mongod` to start local MongoDB server

