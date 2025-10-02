# Registration & OTP Verification Flow Analysis

**Date:** January 2025  
**Status:** BACKEND ISSUE IDENTIFIED

## Issue Summary

The registration flow works up until OTP verification, where a **backend error** prevents successful verification.

### Current Flow Status

1. ✅ **Registration (`/register`)**: Works correctly
   - User fills registration form
   - Frontend sends POST to `/api/register`
   - Backend creates user and sends OTP via email
   - Response includes `{ user: { email, name, roles }, otp_code_for_testing }`
   
2. ✅ **Navigation to OTP Page**: Works correctly
   - `pendingVerificationEmail` is stored in localStorage
   - Frontend navigates to `/verify-otp` page
   - Page displays email from context

3. ❌ **OTP Verification (`/verify-otp`)**: FAILS with backend error
   - User enters OTP code received via email
   - Frontend sends POST to `/api/verify-otp` with `{ email, otp_code }`
   - **Backend returns 500 error**: `"No query results for model [App\\Models\\User]."`

## Backend Error Details

```json
{
  "success": false,
  "message": "Failed",
  "errors": "No query results for model [App\\Models\\User]."
}
```

### Root Cause

The Laravel backend's `/verify-otp` endpoint is trying to find a User model by email but fails. This suggests one of:

1. **User not created during registration**: The `/register` endpoint might not be actually creating the user record in the database
2. **Wrong email lookup**: The endpoint might be searching with incorrect criteria
3. **Database transaction issue**: User creation might be rolled back or not committed
4. **Case sensitivity**: Email comparison might be case-sensitive when it shouldn't be

## Expected Backend Behavior

The `/verify-otp` endpoint should:

```php
// Pseudo-code of expected backend logic
1. Receive: { email, otp_code }
2. Find user by email (case-insensitive)
3. Verify OTP matches stored OTP for that user
4. Check OTP not expired
5. Mark user email as verified
6. Generate Sanctum token
7. Return: {
     success: true,
     data: {
       access_token: "...",
       token_type: "Bearer",
       user: {
         id, name, email, roles: ["customer"], 
         email_verified_at, created_at, updated_at
       }
     }
   }
```

## Frontend Improvements Made

To make the frontend more resilient, the following changes were implemented:

### 1. Enhanced Error Handling in `use-auth.tsx`

**File:** `hooks/use-auth.tsx`

- Added comprehensive logging for OTP verification process
- Improved null-checking for `user.roles` to prevent crashes
- Default to `["customer"]` role if roles are missing
- Better error messages with detailed console logging

```typescript
// Before (would crash if user.roles is undefined)
const rawRoles = user.roles || [];
const userRoles = (Array.isArray(rawRoles) ? rawRoles : []).filter(...)

// After (gracefully handles undefined)
const rawRoles = user.roles;
let userRoles: UserRole[] = [];
if (Array.isArray(rawRoles)) {
  userRoles = rawRoles.filter(...) as UserRole[];
}
const finalRoles = userRoles.length > 0 ? userRoles : ["customer"];
```

### 2. Detailed Debugging Logs

Added extensive console logging:
- `[VERIFY-OTP]` prefix for OTP-specific logs
- Request payload logging
- Response structure validation
- Error details with stack traces

### 3. Registration Flow Validation

**File:** `app/register/page.tsx`

- Validates email is properly stored before navigation
- Logs each step of registration process
- Confirms `router.push("/verify-otp")` is called

**File:** `app/verify-otp/page.tsx`

- Validates `pendingVerificationEmail` exists before allowing verification
- Shows debug information panel (remove in production)
- Redirects to login if no pending verification found

## Backend Requirements

The Laravel backend needs to fix the `/verify-otp` endpoint. Here's what needs to be checked:

### 1. User Creation in `/register` Endpoint

```php
// Ensure user is actually created and saved
$user = User::create([
    'name' => $request->name,
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'email_verified_at' => null, // Will be set after OTP verification
]);

// Store OTP (in users table, otp_codes table, or cache)
$user->otp_code = $otpCode;
$user->otp_expires_at = now()->addMinutes(10);
$user->save();
```

### 2. User Lookup in `/verify-otp` Endpoint

```php
// Find user by email (case-insensitive)
$user = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();

if (!$user) {
    return response()->json([
        'success' => false,
        'message' => 'User not found',
        'errors' => 'No user found with this email'
    ], 404);
}

// Verify OTP
if ($user->otp_code !== $request->otp_code) {
    return response()->json([
        'success' => false,
        'message' => 'Invalid OTP',
        'errors' => 'The OTP code is incorrect'
    ], 400);
}

// Mark email as verified
$user->email_verified_at = now();
$user->otp_code = null;
$user->save();

// Generate token
$token = $user->createToken('auth-token')->plainTextToken;

// Load roles relationship
$user->load('roles');

return response()->json([
    'success' => true,
    'data' => [
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->toArray(), // e.g., ["customer"]
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]
    ]
]);
```

### 3. Default Role Assignment

Ensure every new user gets the "customer" role by default:

```php
// In User model or registration logic
$user->assignRole('customer'); // Using Spatie Laravel Permission
// OR
$user->roles()->attach(Role::where('name', 'customer')->first()->id);
```

## Testing Steps

Once backend is fixed:

1. ✅ Register new user
2. ✅ Check email for OTP code
3. ✅ Navigate to `/verify-otp` page
4. ✅ Enter OTP code
5. ✅ Click Verify button
6. ✅ Should redirect to homepage with user logged in
7. ✅ Check `localStorage` for token and user data
8. ✅ Verify user can access customer dashboard

## Console Debugging

When testing, check browser console (F12) for:

```
[VERIFY-OTP] ========== STARTING OTP VERIFICATION ==========
[VERIFY-OTP] Email: user@example.com
[VERIFY-OTP] OTP code: 123456
[VERIFY-OTP] Request payload: { email: "...", otp_code: "..." }
[VERIFY-OTP] Raw API response: { success: false, message: "...", errors: "..." }
```

If you see `success: false` with "No query results", the backend can't find the user.

## Files Modified

- `hooks/use-auth.tsx` - Enhanced error handling and logging
- `app/register/page.tsx` - Already had proper logging
- `app/verify-otp/page.tsx` - Already had debug panel

## Next Steps

1. **Backend Team**: Fix the `/verify-otp` endpoint to properly find users by email
2. **Backend Team**: Ensure `/register` creates user records correctly
3. **Backend Team**: Confirm default "customer" role is assigned
4. **Frontend Team**: Remove debug panels from production once working
5. **Both Teams**: Test complete registration flow end-to-end

## Related Documentation

- `CLAUDE.md` - Project context and history
- `FEATURES.md` - Feature implementation status
- `docs/iterations/` - Iteration tracking
