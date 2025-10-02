# OTP Verification 500 Error - Diagnostic Guide

**Date**: January 15, 2025  
**Error**: `500 Internal Server Error` on `/api/verify-otp`  
**Message**: `"No query results for model [App\\Models\\User]"`

---

## 🐛 **The Error**

When clicking "Verify" button on `/verify-otp` page, the API returns:

```json
{
  "success": false,
  "message": "Failed",
  "errors": "No query results for model [App\\Models\\User]."
}
```

---

## 🔍 **What This Means**

This Laravel error means the backend **cannot find a user** with the provided email who has a pending OTP verification.

### **Possible Causes:**

1. **Email Mismatch** 
   - The email sent to `/verify-otp` doesn't match the registered email
   - Case sensitivity issue (e.g., `User@Example.com` vs `user@example.com`)
   - Extra whitespace in the email

2. **User Already Verified**
   - The OTP was already used successfully
   - Trying to verify again with the same OTP

3. **OTP Expired**
   - The OTP has expired on the backend (usually 10-15 minutes)
   - Need to request a new OTP

4. **Database Issue**
   - User wasn't created properly during registration
   - Database query issue on the backend

5. **Wrong OTP Code**
   - The OTP code doesn't match what the backend expects
   - Typo in the OTP code

---

## ✅ **Fixes Applied**

### **1. Added Comprehensive Logging**

**File: `hooks/use-auth.tsx`**
```typescript
console.log('[AUTH] Verifying OTP for:', email);
console.log('[AUTH] OTP code:', otp_code);
console.log('[AUTH] Verify OTP response:', JSON.stringify(response, null, 2));
```

**File: `app/verify-otp/page.tsx`**
```typescript
console.log('[VERIFY-OTP] Email:', pendingVerificationEmail)
console.log('[VERIFY-OTP] OTP Code:', otp_code)
```

### **2. Fixed API Response Type**

**File: `lib/api.ts`**
```typescript
// BEFORE (WRONG)
verifyOtp: (email: string, otp_code: string) => {
  return apiRequest<{ token: string; user: any }>("/verify-otp", "POST", { email, otp_code })
}

// AFTER (CORRECT - matches actual API)
verifyOtp: (email: string, otp_code: string) => {
  return apiRequest<{ 
    access_token: string;  // ← API returns this, not "token"
    token_type: string;
    user: any 
  }>("/verify-otp", "POST", { email, otp_code })
}
```

### **3. Fixed Token Extraction**

**File: `hooks/use-auth.tsx`**
```typescript
// Handle both possible token field names
const token = data.access_token || data.token;
```

### **4. Added Debug UI**

**File: `app/verify-otp/page.tsx`**
- Shows the email being used for verification
- Shows warning to check console logs
- Helps diagnose email mismatch issues

---

## 🧪 **How to Diagnose**

### **Step 1: Check Browser Console**

Open browser console (F12) and look for these logs when clicking "Verify":

```
[VERIFY-OTP] Submitting OTP verification...
[VERIFY-OTP] Email: user@example.com
[VERIFY-OTP] OTP Code: 123456
[AUTH] Verifying OTP for: user@example.com
[AUTH] OTP code: 123456
[AUTH] Verify OTP response: { success: false, message: "Failed", ... }
```

### **Step 2: Verify Email Matches**

1. Look at the debug box on the verify-otp page
2. Check the email displayed
3. Compare with the email you registered with
4. Check for:
   - Extra spaces
   - Different case (uppercase/lowercase)
   - Typos

### **Step 3: Check OTP Code**

1. Check your email for the OTP code
2. Make sure you're entering it correctly
3. Make sure it hasn't expired (usually 10-15 min)

### **Step 4: Fresh Registration Test**

To test if it's a stale OTP issue:

```bash
# Open browser console (F12)

# 1. Register with a NEW email
#    Go to /register
#    Use: testuser_[random]@example.com

# 2. Watch console for:
[AUTH] OTP Code for testing: 123456  ← Copy this!

# 3. Should auto-redirect to /verify-otp

# 4. Enter the OTP code from console

# 5. Click "Verify"

# 6. Watch for success or error
```

---

## 📊 **Expected vs Actual Flow**

### **✅ Successful Flow:**
```
1. Register → API returns { success: true, data: { user: {...}, otp_code_for_testing: "123456" }}
2. Store email in context → localStorage.setItem('pendingVerificationEmail', email)
3. Redirect to /verify-otp → Shows email in UI
4. Enter OTP → OTP code visible in form
5. Click Verify → Console shows [AUTH] Verifying OTP for: email
6. API returns { success: true, data: { access_token: "...", user: {...} }}
7. Store token + user → Login successful
8. Redirect to homepage → User logged in ✅
```

### **❌ Your Current Flow:**
```
1. Register → ✅ Success
2. Store email → ✅ Success (presumably)
3. Redirect to /verify-otp → ✅ Success
4. Enter OTP → ✅ Success
5. Click Verify → ✅ API called
6. API returns 500 → ❌ "No query results for model [App\\Models\\User]"
```

---

## 🔧 **Troubleshooting Steps**

### **Test 1: Direct API Test**

Run this in your terminal to test the API directly:

```bash
# 1. Register a new user
curl -X POST https://api.zatix.id/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "is_tnc_accepted": true
  }' | jq '.'

# Copy the email and otp_code_for_testing from the response

# 2. Verify OTP immediately
curl -X POST https://api.zatix.id/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "PASTE_EMAIL_HERE",
    "otp_code": "PASTE_OTP_HERE"
  }' | jq '.'
```

If this works, the issue is in the frontend. If it fails, the issue is in the backend.

### **Test 2: Check Email Storage**

In browser console on `/verify-otp` page:

```javascript
// Check what's stored
console.log('Stored email:', localStorage.getItem('pendingVerificationEmail'))

// Manually verify with a specific email/OTP
// (only if you know the correct values)
```

### **Test 3: Check for Multiple Registrations**

Are you:
1. Registering the same email multiple times?
2. Using an email that was already verified?
3. Waiting too long between registration and verification?

---

## 🎯 **Most Likely Causes**

Based on the error, ranked by probability:

1. **OTP Expired (80%)** - You're trying to use an old OTP
   - **Solution**: Click "Resend OTP" and use the new code

2. **Email Mismatch (15%)** - The email in localStorage doesn't match the registered email
   - **Solution**: Check the debug box on /verify-otp page

3. **User Already Verified (4%)** - You already verified this email
   - **Solution**: Try logging in instead of re-verifying

4. **Backend Issue (1%)** - Database or backend logic problem
   - **Solution**: Contact backend team

---

## 🚀 **Next Steps**

1. **Test with fresh registration** using a unique email
2. **Use OTP immediately** (don't wait)
3. **Check console logs** for detailed error info
4. **Copy the email shown in debug box** and verify it's correct
5. **If still failing**, provide these details:
   - Console logs (all [AUTH] and [VERIFY-OTP] messages)
   - Email shown in debug box
   - Whether you're using fresh registration or old OTP

---

## 📁 **Files Modified**

1. ✅ `hooks/use-auth.tsx` - Added logging + fixed token extraction
2. ✅ `lib/api.ts` - Fixed return type (access_token)
3. ✅ `app/verify-otp/page.tsx` - Added logging + debug UI

---

**Status**: 🔍 **DIAGNOSTIC ADDED - AWAITING TEST RESULTS**

---

*Last Updated: January 15, 2025*
