import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '../page'
import { useAuth } from '@/hooks/use-auth'

jest.mock('@/hooks/use-auth')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('LoginPage', () => {
  const mockLogin = jest.fn()

  beforeEach(() => {

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false,
      register: jest.fn(),
      verifyOtp: jest.fn(),
      resendOtp: jest.fn(),
      forgotPassword: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      switchRole: jest.fn(),
      updateEODetails: jest.fn(),
      pendingVerificationEmail: null,
      setPendingVerificationEmail: jest.fn(),
      hasRole: jest.fn(),
      canAccessDashboard: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
  })

  it('has correct form inputs with proper attributes', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('placeholder', 'name@zatix.com')
    expect(emailInput).toBeRequired()
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toBeRequired()
  })

  it('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('calls login function with correct credentials on form submission', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getAllByRole('button', { name: /sign in/i }).find(btn => btn.getAttribute('type') === 'submit')!
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('redirects to home page after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getAllByRole('button', { name: /sign in/i }).find(btn => btn.getAttribute('type') === 'submit')!
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getAllByRole('button', { name: /sign in/i }).find(btn => btn.getAttribute('type') === 'submit')!
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('displays error message when login fails', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid email or password'
    mockLogin.mockRejectedValue(new Error(errorMessage))
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getAllByRole('button', { name: /sign in/i }).find(btn => btn.getAttribute('type') === 'submit')!
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('has correct navigation links', () => {
    render(<LoginPage />)
    
    const forgotPasswordLink = screen.getByText('Forgot password?')
    const signUpLink = screen.getByText('Sign up')
    
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register')
  })
})