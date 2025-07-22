// Midtrans integration utilities for ticket payment

export interface MidtransSnapToken {
  token: string
  redirect_url: string
}

export interface MidtransTransaction {
  transaction_id: string
  order_id: string
  payment_type: string
  transaction_status: string
  transaction_time: string
  settlement_time?: string
  gross_amount: string
}

// Client-side Midtrans Snap integration
declare global {
  interface Window {
    snap: {
      pay: (snapToken: string, options?: {
        onSuccess?: (result: any) => void
        onPending?: (result: any) => void
        onError?: (result: any) => void
        onClose?: () => void
      }) => void
      embed: (snapToken: string, options: {
        embedId: string
        onSuccess?: (result: any) => void
        onPending?: (result: any) => void
        onError?: (result: any) => void
      }) => void
    }
  }
}

export const loadMidtransScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.snap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js' // Use sandbox for development
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Midtrans script'))
    
    document.head.appendChild(script)
  })
}

export const openMidtransPayment = async (
  snapToken: string,
  callbacks?: {
    onSuccess?: (result: any) => void
    onPending?: (result: any) => void
    onError?: (result: any) => void
    onClose?: () => void
  }
): Promise<void> => {
  try {
    await loadMidtransScript()
    
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log('Payment success:', result)
        callbacks?.onSuccess?.(result)
      },
      onPending: (result) => {
        console.log('Payment pending:', result)
        callbacks?.onPending?.(result)
      },
      onError: (result) => {
        console.log('Payment error:', result)
        callbacks?.onError?.(result)
      },
      onClose: () => {
        console.log('Payment popup closed')
        callbacks?.onClose?.()
      }
    })
  } catch (error) {
    console.error('Error opening Midtrans payment:', error)
    throw error
  }
}

export const embedMidtransPayment = async (
  snapToken: string,
  embedId: string,
  callbacks?: {
    onSuccess?: (result: any) => void
    onPending?: (result: any) => void
    onError?: (result: any) => void
  }
): Promise<void> => {
  try {
    await loadMidtransScript()
    
    window.snap.embed(snapToken, {
      embedId,
      onSuccess: (result) => {
        console.log('Payment success:', result)
        callbacks?.onSuccess?.(result)
      },
      onPending: (result) => {
        console.log('Payment pending:', result)
        callbacks?.onPending?.(result)
      },
      onError: (result) => {
        console.log('Payment error:', result)
        callbacks?.onError?.(result)
      }
    })
  } catch (error) {
    console.error('Error embedding Midtrans payment:', error)
    throw error
  }
}

// Helper function to format amount for Midtrans (in cents)
export const formatAmountForMidtrans = (amount: number): number => {
  return Math.round(amount) // Midtrans expects amount in IDR, not cents
}

// Payment status mapping
export const mapMidtransStatus = (status: string): 'pending' | 'success' | 'failed' => {
  switch (status) {
    case 'capture':
    case 'settlement':
      return 'success'
    case 'pending':
      return 'pending'
    case 'deny':
    case 'cancel':
    case 'expire':
    case 'failure':
      return 'failed'
    default:
      return 'pending'
  }
}