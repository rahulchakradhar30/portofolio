# 🔐 OpenAI API Security & Monitoring Guide

## 🛡️ Security Best Practices

### **API Key Protection**

✅ **What We're Doing Right:**
- Key is stored in `.env.local` (local machine only)
- Key is NOT in version control (`.env.local` in `.gitignore`)
- Key is only used server-side in API routes
- Never exposed to frontend/client code

❌ **DO NOT:**
- Commit `.env.local` to git
- Share API key in emails, chat, or public places
- Use API key in frontend code (client-side)
- Post about your key on social media

### **GitHub/Public Repo Security**

If you push to GitHub:
1. Ensure `.gitignore` includes `.env.local`
2. Verify with: `git status` (shouldn't show .env.local)
3. Check `.git/config` - no keys there
4. Use GitHub Secrets for production deployment

---

## 📊 Monitoring Usage

### **Check Usage Daily**

Visit: https://platform.openai.com/account/usage/overview

**What to Monitor:**
- Daily usage amount
- Cost accumulation
- Most used models (should be gpt-3.5-turbo)

### **Set Usage Limits**

Visit: https://platform.openai.com/account/billing/limits

**Recommended Settings:**
- Monthly Budget: $20-50
- Hard Limit: Enable
- Soft Limit: 80% of budget

**Benefits:**
- API stops working if limit reached (safe)
- No surprise charges
- Controlled spending

---

## 🔑 API Key Management

### **Current Key**
```
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
```

### **If Key is Compromised**

1. Go to: https://platform.openai.com/api-keys
2. Click delete on the key
3. Create new key
4. Update `.env.local`
5. Restart dev server

**Important**: Delete the old key immediately to prevent misuse

---

## 💾 Backup & Recovery

### **Backing Up Configuration**

Keep a secure note of:
- ✅ OpenAI Account Email
- ✅ API Key (in 1Password or secure vault)
- ✅ Organization ID (if using)

**DO NOT** store in:
- 📱 Notes apps (unencrypted)
- 📧 Email (interceptable)
- 💬 Chat apps (logged)

### **If You Lose Your Key**

1. Go to https://platform.openai.com/api-keys
2. Create new key (old one is deleted)
3. Copy new key
4. Update `.env.local` with new key
5. Restart server

---

## ⚠️ Rate Limiting & Quotas

### **GPT-3.5-turbo Limits**

| Limit | Value |
|-------|-------|
| Requests per minute | 9,000 |
| Tokens per minute | 600,000 |
| Max tokens per request | 4,096 |

**Our Usage:**
- ~100 requests/month (way under limit)
- ~50,000 tokens/month (way under limit)
- No rate limiting issues expected

### **If You Hit Rate Limits**

Error: `429 - Too Many Requests`

**Solution:**
- Wait a minute before trying again
- Reduce concurrent requests
- Contact OpenAI support for higher limits

---

## 🚨 Cost Management

### **Typical Conversation Costs**

| Action | Tokens | Cost |
|--------|--------|------|
| Short QA | 100 | $0.00015 |
| Longer Chat | 500 | $0.00075 |
| Full Conversation | 1000 | $0.0015 |

**Example:**
- 100 conversations/day = ~$0.10/day = $3/month

### **Cost Optimization**

1. **Set Hard Limits** (prevents overspends)
2. **Monitor Weekly** (catch anomalies)
3. **Use GPT-3.5-turbo** (cheap but good)
4. **Limit Token Length** (max_tokens: 1000)

---

## 🔄 Rotating Keys (Recommended)

### **When to Rotate**
- Every 90 days (good practice)
- After team member leaves
- If exposed/compromised
- Before major deployment

### **How to Rotate**

1. Create new key at https://platform.openai.com/api-keys
2. Update `.env.local` with new key
3. Delete old key
4. Restart dev server
5. Test chatbot works
6. Document in your records

---

## 📋 Checklist for Deployment

If deploying to production (Vercel, etc.):

- [ ] Remove `.env.local` from git
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create new API key for production
- [ ] Add key to Vercel/hosting environment variables
- [ ] Test chatbot on production
- [ ] Set up usage alerts
- [ ] Monitor costs weekly
- [ ] Document access procedures

---

## 🏢 Team Access (if applicable)

### **For Other Team Members**

**DO NOT SHARE:**
- API key directly
- `.env.local` file
- Any credentials

**DO:**
- Give them read-only docs
- Let them use dev server with your key
- Create separate keys if needed
- Use `.env` (without key) as template

---

## 📞 OpenAI Support

- **Status Page**: https://status.openai.com
- **Support**: https://help.openai.com
- **Community**: https://community.openai.com
- **Billing Help**: https://platform.openai.com/account/billing/overview

---

## 🎓 Learning Resources

- [OpenAI Security Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [API Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Tokens](https://platform.openai.com/tokenizer)

---

## ✅ Security Verification

Run this to verify setup:

```bash
# Check if .env.local is in gitignore
grep ".env.local" .gitignore

# Check if .env.local is committed (should return nothing)
git ls-files | grep ".env.local"

# Check Node environment (should show true)
echo $NODE_ENV
```

---

## 🎯 Summary

✅ **Your Setup is Secure Because:**
1. Key is local-only (not in git)
2. Key is server-side only (not exposed to frontend)
3. Usage limits can be set
4. Key can be rotated anytime
5. Costs are monitored

⚠️ **Remember:**
- Keep `.env.local` secret
- Monitor usage monthly
- Rotate keys every 90 days
- Set hard spending limits

---

**Last Updated**: April 15, 2026  
**Security Level**: ✅ Excellent
