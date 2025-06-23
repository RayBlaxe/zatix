export * from './login';
export * from './register';

export type UserRole = "customer" | "eo-owner" | "superadmin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentRole: UserRole;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  eoDetails?: {
    name: string;
    logo?: string;
    description: string;
    email: string;
    phone: string;
    address: string;
  };
};

export type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    is_tnc_accepted: boolean
  ) => Promise<void>;
  verifyOtp: (email: string, otp_code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  updateEODetails: (eoDetails: AuthUser["eoDetails"]) => void;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  hasRole: (role: UserRole) => boolean;
  canAccessDashboard: () => boolean;
};