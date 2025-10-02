# Midtrans Quick Reference

## Environment Variables Quick Copy

### Development (Sandbox)
```bash
MIDTRANS_MERCHANT_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-your-key
MIDTRANS_SERVER_KEY=SB-Mid-server-your-key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

### Production
```bash
MIDTRANS_MERCHANT_ID=M123456
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-your-key
MIDTRANS_SERVER_KEY=Mid-server-your-key
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

## Code Usage Examples

### Server-Side (API Routes)
```typescript
import { chargeTransaction, checkPaymentStatus } from '@/lib/midtrans'

// Create a charge
const result = await chargeTransaction(chargeData)

// Check status
const status = await checkPaymentStatus(orderId)
```

### Client-Side (React Components)
```typescript
import { getMidtransConfig } from '@/lib/midtrans'

const config = getMidtransConfig()
console.log(config.isProduction) // false or true
console.log(config.clientKey)    // Client key for Snap.js
```

## Test Cards (Sandbox)

| Card Number | Type | Result |
|-------------|------|--------|
| 4811 1111 1111 1114 | Visa | ✅ Success |
| 5211 1111 1111 1117 | Mastercard | ✅ Success |
| 4911 1111 1111 1113 | Visa | ❌ Denied |

- **CVV**: Any 3 digits
- **Expiry**: Any future date  
- **3DS OTP**: `112233`

## URLs

- **Sandbox Dashboard**: https://dashboard.sandbox.midtrans.com/
- **Production Dashboard**: https://dashboard.midtrans.com/
- **API Documentation**: https://docs.midtrans.com/
- **Full Guide**: See `docs/MIDTRANS_CONFIG.md`

## Checklist for Production

- [ ] Get production credentials
- [ ] Complete business verification
- [ ] Update `.env.production` with real keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Test all payment methods
- [ ] Configure webhook URL
- [ ] Verify SSL certificate
- [ ] Set up monitoring

## Common Issues

### "Unauthorized" Error
→ Check `MIDTRANS_SERVER_KEY` matches environment (sandbox/production)

### Wrong API Endpoint
→ Verify `MIDTRANS_IS_PRODUCTION` is correct

### 3DS Not Working
→ Ensure `MIDTRANS_IS_3DS=true` and use 3DS test cards

## Support
- Midtrans: https://support.midtrans.com/
- Project Docs: `docs/MIDTRANS_CONFIG.md`
