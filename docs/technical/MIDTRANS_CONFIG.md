# Midtrans Configuration Guide

This document explains how to configure Midtrans payment gateway for the ZaTix platform in both development and production environments.

## Environment Variables

The following environment variables must be configured for Midtrans integration:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MIDTRANS_MERCHANT_ID` | Your Midtrans Merchant ID | `M123456` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client-side key (public) | `SB-Mid-client-xxxx` (sandbox) or `Mid-client-xxxx` (production) |
| `MIDTRANS_SERVER_KEY` | Server-side key (private, never expose to client) | `SB-Mid-server-xxxx` (sandbox) or `Mid-server-xxxx` (production) |
| `MIDTRANS_IS_PRODUCTION` | Environment flag | `false` (sandbox) or `true` (production) |
| `MIDTRANS_IS_SANITIZED` | Enable input sanitization | `true` (recommended) |
| `MIDTRANS_IS_3DS` | Enable 3D Secure for cards | `true` (recommended) |

### Variable Prefixes

- **`NEXT_PUBLIC_`**: Variables with this prefix are exposed to the client-side (browser)
- **No prefix**: Server-side only variables (never sent to browser)

⚠️ **Security Note**: Never expose `MIDTRANS_SERVER_KEY` to the client side. Only use it in server-side code.

## Configuration Files

### Development Environment (`.env.local`)

```env
# Midtrans Sandbox Configuration
MIDTRANS_MERCHANT_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

### Production Environment (`.env.production`)

```env
# Midtrans Production Configuration
MIDTRANS_MERCHANT_ID=M123456
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxx
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

## Getting Midtrans Credentials

### 1. Sandbox (Development)

1. Register at [https://dashboard.sandbox.midtrans.com/](https://dashboard.sandbox.midtrans.com/)
2. Navigate to **Settings** → **Access Keys**
3. Copy:
   - Merchant ID
   - Client Key (starts with `SB-Mid-client-`)
   - Server Key (starts with `SB-Mid-server-`)

### 2. Production

1. Complete merchant registration at [https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)
2. Complete business verification process
3. Once approved, navigate to **Settings** → **Access Keys**
4. Switch to **Production** mode
5. Copy:
   - Merchant ID
   - Client Key (starts with `Mid-client-`)
   - Server Key (starts with `Mid-server-`)

## API Endpoints

The system automatically switches between sandbox and production endpoints based on `MIDTRANS_IS_PRODUCTION`:

- **Sandbox**: `https://api.sandbox.midtrans.com/v2`
- **Production**: `https://api.midtrans.com/v2`

## Implementation Details

### Server-Side Usage

```typescript
import { chargeTransaction, checkPaymentStatus } from '@/lib/midtrans'

// Charge a transaction
const result = await chargeTransaction(chargeData)

// Check payment status
const status = await checkPaymentStatus(orderId)
```

### Client-Side Configuration

```typescript
import { getMidtransConfig } from '@/lib/midtrans'

const config = getMidtransConfig()
console.log(config.isProduction) // false in sandbox, true in production
console.log(config.clientKey) // Client key for Snap.js or Core API
```

## Configuration Options

### `MIDTRANS_IS_SANITIZED`

When set to `true`, Midtrans will sanitize input data to prevent XSS and injection attacks. This is **strongly recommended** for production.

### `MIDTRANS_IS_3DS`

When set to `true`, credit card transactions will require 3D Secure authentication (OTP from bank). This adds an extra layer of security and is **strongly recommended** for production to reduce fraud risk.

## Supported Payment Methods

The current implementation supports:

- ✅ Credit Card (Visa, Mastercard, JCB, Amex)
- ✅ Bank Transfer (BCA, BNI, BRI, Permata)
- ✅ E-Channel (Mandiri Bill Payment)
- ✅ GoPay
- ✅ ShopeePay
- ✅ QRIS

## Testing in Sandbox

Midtrans provides test cards and accounts for sandbox testing:

### Test Credit Cards

| Card Number | Type | 3DS |
|-------------|------|-----|
| `4811 1111 1111 1114` | Visa | Accept |
| `5211 1111 1111 1117` | Mastercard | Accept |
| `4911 1111 1111 1113` | Visa | Deny |

**CVV**: Any 3 digits  
**Expiry**: Any future date  
**OTP**: `112233`

### Test Bank Transfers

All sandbox bank transfers will automatically succeed after a few seconds.

### Test E-Wallets

GoPay and ShopeePay transactions in sandbox can be simulated through the provided deeplink.

## Deployment Checklist

Before deploying to production:

- [ ] Obtain production credentials from Midtrans dashboard
- [ ] Complete business verification with Midtrans
- [ ] Update `.env.production` with production credentials
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Enable `MIDTRANS_IS_SANITIZED=true`
- [ ] Enable `MIDTRANS_IS_3DS=true`
- [ ] Test all payment methods in production environment
- [ ] Configure webhook/notification URL in Midtrans dashboard
- [ ] Verify SSL certificate on your domain
- [ ] Set up monitoring for payment transactions

## Security Best Practices

1. **Never commit** `.env.local` or `.env.production` files to version control
2. **Never expose** `MIDTRANS_SERVER_KEY` to client-side code
3. **Always use** HTTPS in production
4. **Enable** 3D Secure for credit card transactions
5. **Validate** webhook signatures from Midtrans notifications
6. **Implement** proper error handling and logging
7. **Monitor** transactions regularly for suspicious activity
8. **Rotate** API keys periodically

## Troubleshooting

### "Unauthorized" Error

- Check that `MIDTRANS_SERVER_KEY` is correct
- Verify the key matches the environment (sandbox vs production)

### Wrong API Endpoint

- Verify `MIDTRANS_IS_PRODUCTION` is set correctly
- Check that credentials match the environment

### 3DS Not Working

- Ensure `MIDTRANS_IS_3DS=true`
- Use test cards that support 3DS in sandbox
- Verify your domain is whitelisted in Midtrans dashboard

### Payment Notification Not Received

- Configure notification URL in Midtrans dashboard
- Ensure your webhook endpoint is publicly accessible
- Check webhook signature validation

## Support

For issues related to:
- **Midtrans API**: Contact [Midtrans Support](https://support.midtrans.com/)
- **ZaTix Integration**: Check project documentation or contact development team

## References

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans API Reference](https://api-docs.midtrans.com/)
- [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/)
- [Midtrans Production](https://dashboard.midtrans.com/)
