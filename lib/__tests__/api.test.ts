import { authApi, getToken, setToken, removeToken, isCurrentTokenExpired, validateTokenWithAPI } from '../api'
import { LoginResponse } from '@/types/auth/login'

// Mock fetch
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock window and localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

describe('Login API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(localStorage.getItem as jest.Mock).mockClear()
    ;(localStorage.setItem as jest.Mock).mockClear()
    ;(localStorage.removeItem as jest.Mock).mockClear()
    ;(localStorage.clear as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.NEXT_PUBLIC_USE_MOCKS
  })

  describe('authApi.login', () => {
    it('should make correct API call with credentials', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const result = await authApi.login('test@example.com', 'password123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zatix.id/api/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          }),
          credentials: 'include'
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
        data: null
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockResponse,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const result = await authApi.login('test@example.com', 'wrongpassword')

      expect(result).toEqual(mockResponse)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(authApi.login('test@example.com', 'password123')).rejects.toThrow('Network error')
    })

    it('should use mock response when API is unavailable and mocks are enabled', async () => {
      // Set environment variable to enable mocks
      const originalEnv = process.env.NEXT_PUBLIC_USE_MOCKS
      process.env.NEXT_PUBLIC_USE_MOCKS = 'true'

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await authApi.login('superadmin@zatix.com', 'admin123')

      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe('superadmin@zatix.com')
      expect(result.data.access_token).toBeDefined()

      // Clean up
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_USE_MOCKS
      } else {
        process.env.NEXT_PUBLIC_USE_MOCKS = originalEnv
      }
    })
  })

  describe('Token Management', () => {
    describe('setToken', () => {
      it('should store token in localStorage', () => {
        setToken('test-token')

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token')
      })

      it('should store token with expiration', () => {
        const expiresIn = 480 // 8 hours in minutes
        setToken('test-token', expiresIn)

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token')
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'token_expires_at',
          expect.any(String)
        )
      })
    })

    describe('getToken', () => {
      it('should return token if valid', () => {
        const mockToken = 'test-token'
        const futureDate = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
        
        ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'token') return mockToken
          if (key === 'token_expires_at') return futureDate.toISOString()
          return null
        })

        const result = getToken()

        expect(result).toBe(mockToken)
      })

      it('should return null if token is expired', () => {
        const mockToken = 'test-token'
        const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        
        ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'token') return mockToken
          if (key === 'token_expires_at') return pastDate.toISOString()
          return null
        })

        const result = getToken()

        expect(result).toBeNull()
        expect(localStorage.removeItem).toHaveBeenCalledWith('token')
        expect(localStorage.removeItem).toHaveBeenCalledWith('token_expires_at')
      })

      it('should return null if no token exists', () => {
        ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

        const result = getToken()

        expect(result).toBeNull()
      })
    })

    describe('removeToken', () => {
      it('should remove token and related data from localStorage', () => {
        removeToken()

        expect(localStorage.removeItem).toHaveBeenCalledWith('token')
        expect(localStorage.removeItem).toHaveBeenCalledWith('token_expires_at')
        expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      })
    })

    describe('isCurrentTokenExpired', () => {
      it('should return false if token is not expired', () => {
        const futureDate = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
        
        ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'token_expires_at') return futureDate.toISOString()
          return null
        })

        const result = isCurrentTokenExpired()

        expect(result).toBe(false)
      })

      it('should return true if token is expired', () => {
        const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        
        ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'token_expires_at') return pastDate.toISOString()
          return null
        })

        const result = isCurrentTokenExpired()

        expect(result).toBe(true)
      })

      it('should return false if no expiration date stored', () => {
        ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

        const result = isCurrentTokenExpired()

        expect(result).toBe(false)
      })
    })
  })

  describe('validateTokenWithAPI', () => {
    it('should return valid=true for successful API response', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const result = await validateTokenWithAPI('test-token')

      expect(result.valid).toBe(true)
      expect(result.user).toEqual(mockResponse.data)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.zatix.id/api/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      )
    })

    it('should return valid=false for 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const result = await validateTokenWithAPI('invalid-token')

      expect(result.valid).toBe(false)
    })

    it('should return valid=true for other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const result = await validateTokenWithAPI('test-token')

      expect(result.valid).toBe(true)
    })

    it('should fall back to stored expiration on network error', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
      
      ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'token_expires_at') return futureDate.toISOString()
        return null
      })

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await validateTokenWithAPI('test-token')

      expect(result.valid).toBe(true)
    })
  })

  describe('Authentication Events', () => {
    it('should dispatch tokenExpired event when token expires', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      
      ;(localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'token') return 'expired-token'
        if (key === 'token_expires_at') return pastDate.toISOString()
        return null
      })

      const eventSpy = jest.fn()
      window.addEventListener('tokenExpired', eventSpy)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      try {
        await authApi.login('test@example.com', 'password123')
      } catch (error) {
        // Expected to throw due to expired token
      }

      expect(eventSpy).toHaveBeenCalled()
      window.removeEventListener('tokenExpired', eventSpy)
    })

    it('should dispatch authenticationFailed event on 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Unauthorized' }),
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null
        }
      } as Response)

      const eventSpy = jest.fn()
      window.addEventListener('authenticationFailed', eventSpy)

      const result = await authApi.login('test@example.com', 'wrongpassword')

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            status: 401,
            endpoint: '/login'
          })
        })
      )

      window.removeEventListener('authenticationFailed', eventSpy)
    })
  })
})