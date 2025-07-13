import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../use-auth'
import * as apiModule from '@/lib/api'
import type React from 'react'

jest.mock('@/lib/api')

const mockAuthApi = apiModule.authApi as jest.Mocked<typeof apiModule.authApi>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock window events
const mockDispatchEvent = jest.fn()
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
})

describe('useAuth Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear() 
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
    mockDispatchEvent.mockClear()
    // Reset localStorage mock to return null by default
    mockLocalStorage.getItem.mockReturnValue(null)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false) // Will be false after initialization
      expect(result.current.pendingVerificationEmail).toBeNull()
    })

    it('should throw error when used outside AuthProvider', () => {
      // Test that it throws error when used outside provider
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          access_token: 'test-token',
          token_type: 'Bearer',
          expires_in: 480,
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            email_verified_at: '2024-12-31T17:00:00.000000Z',
            roles: ['customer'],
            created_at: '2025-06-23T02:11:31.000000Z',
            updated_at: '2025-06-23T02:11:31.000000Z'
          }
        }
      }

      mockAuthApi.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user).toEqual({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['customer'],
          currentRole: 'customer',
          email_verified_at: '2024-12-31T17:00:00.000000Z',
          created_at: '2025-06-23T02:11:31.000000Z',
          updated_at: '2025-06-23T02:11:31.000000Z',
          eoDetails: undefined
        })
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('test@example.com')
      )
    })

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials'
      }

      mockAuthApi.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await expect(result.current.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle API errors during login', async () => {
      mockAuthApi.login.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await expect(result.current.login('test@example.com', 'password123')).rejects.toThrow('Network error')
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set loading state during login', async () => {
      let resolvePromise: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockAuthApi.login.mockReturnValue(loginPromise)

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login('test@example.com', 'password123')
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!({
          success: true,
          data: {
            access_token: 'test-token',
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              roles: ['customer'],
              email_verified_at: '2024-12-31T17:00:00.000000Z',
              created_at: '2025-06-23T02:11:31.000000Z',
              updated_at: '2025-06-23T02:11:31.000000Z'
            }
          }
        })
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle multiple roles correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'test-token',
          user: {
            id: 1,
            name: 'Super Admin',
            email: 'admin@example.com',
            roles: ['super-admin', 'eo-owner', 'customer'],
            email_verified_at: '2024-12-31T17:00:00.000000Z',
            created_at: '2025-06-23T02:11:31.000000Z',
            updated_at: '2025-06-23T02:11:31.000000Z'
          }
        }
      }

      mockAuthApi.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user?.roles).toEqual(['super-admin', 'eo-owner', 'customer'])
        expect(result.current.user?.currentRole).toBe('customer') // Should default to customer if available
      })
    })
  })

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockAuthApi.logout.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle logout API failure gracefully', async () => {
      mockAuthApi.logout.mockRejectedValue(new Error('Logout failed'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear local state even if API fails
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Role Management', () => {
    beforeEach(() => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'test-token',
          expires_in: 480,
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            roles: ['customer', 'eo-owner'],
            email_verified_at: '2024-12-31T17:00:00.000000Z',
            created_at: '2025-06-23T02:11:31.000000Z',
            updated_at: '2025-06-23T02:11:31.000000Z'
          }
        }
      }

      mockAuthApi.login.mockResolvedValue(mockResponse)
    })

    it('should switch roles correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user?.currentRole).toBe('customer')
      })

      act(() => {
        result.current.switchRole('eo-owner')
      })

      expect(result.current.user?.currentRole).toBe('eo-owner')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('eo-owner')
      )
    })

    it('should not switch to invalid role', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user?.currentRole).toBe('customer')
      })

      act(() => {
        result.current.switchRole('super-admin' as any)
      })

      expect(result.current.user?.currentRole).toBe('customer') // Should remain unchanged
    })

    it('should check roles correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.hasRole('customer')).toBe(true)
        expect(result.current.hasRole('eo-owner')).toBe(true)
        expect(result.current.hasRole('super-admin')).toBe(false)
      })
    })

    it('should check dashboard access correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.canAccessDashboard()).toBe(true) // Has eo-owner role
      })
    })
  })

  describe('Persistent Authentication', () => {
    it('should restore user from localStorage on initialization', async () => {
      const storedUser = {
        id: '1',
        name: 'Stored User',
        email: 'stored@example.com',
        roles: ['customer'],
        currentRole: 'customer',
        email_verified_at: '2024-12-31T17:00:00.000000Z',
        created_at: '2025-06-23T02:11:31.000000Z',
        updated_at: '2025-06-23T02:11:31.000000Z'
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'stored-token'
        if (key === 'user') return JSON.stringify(storedUser)
        if (key === 'token_expires_at') return new Date(Date.now() + 1000 * 60 * 60).toISOString()
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(storedUser)
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'stored-token'
        if (key === 'user') return 'invalid-json'
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle missing roles in stored user', async () => {
      const storedUser = {
        id: '1',
        name: 'Stored User',
        email: 'stored@example.com',
        // Missing roles
        email_verified_at: '2024-12-31T17:00:00.000000Z',
        created_at: '2025-06-23T02:11:31.000000Z',
        updated_at: '2025-06-23T02:11:31.000000Z'
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'stored-token'
        if (key === 'user') return JSON.stringify(storedUser)
        if (key === 'token_expires_at') return new Date(Date.now() + 1000 * 60 * 60).toISOString()
        return null
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user?.roles).toEqual(['customer'])
        expect(result.current.user?.currentRole).toBe('customer')
      })
    })
  })

  describe('OTP Verification', () => {
    it('should handle OTP verification successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'verified-token',
          user: {
            id: 1,
            name: 'Verified User',
            email: 'verified@example.com',
            roles: ['customer'],
            email_verified_at: '2024-12-31T17:00:00.000000Z',
            created_at: '2025-06-23T02:11:31.000000Z',
            updated_at: '2025-06-23T02:11:31.000000Z'
          }
        }
      }

      mockAuthApi.verifyOtp.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.verifyOtp('verified@example.com', '123456')
      })

      await waitFor(() => {
        expect(result.current.user?.email).toBe('verified@example.com')
        expect(result.current.isAuthenticated).toBe(true)
      })
    })
  })

  describe('Update EO Details', () => {
    it('should update EO details correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'test-token',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            roles: ['eo-owner'],
            email_verified_at: '2024-12-31T17:00:00.000000Z',
            created_at: '2025-06-23T02:11:31.000000Z',
            updated_at: '2025-06-23T02:11:31.000000Z'
          }
        }
      }

      mockAuthApi.login.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      const eoDetails = {
        organizationName: 'Test Organization',
        organizationType: 'Company',
        address: '123 Test Street',
        phoneNumber: '+1234567890',
        website: 'https://test.com'
      }

      act(() => {
        result.current.updateEODetails(eoDetails)
      })

      await waitFor(() => {
        expect(result.current.user?.eoDetails).toEqual(eoDetails)
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        expect.stringContaining('Test Organization')
      )
    })
  })
})