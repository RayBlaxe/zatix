# ZaTix Crew Mobile App - Development Prompt

## 🎯 Project Context

You are developing **ZaTix Crew**, a React Native mobile application for event crew members to validate tickets via QR code scanning. This app is part of the larger ZaTix event management ecosystem but serves a specific user base (crew members) with focused functionality.

## 📋 Development Guidelines

### Project Setup
```bash
# Create new React Native TypeScript project
npx react-native init ZaTixCrew --template react-native-template-typescript

# Essential dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-qrcode-scanner react-native-camera
npm install axios @react-native-async-storage/async-storage
npm install react-native-flash-message react-native-vector-icons
```

### Architecture Pattern
Follow **Feature-Based Architecture**:
```
src/
├── components/         # Reusable UI components
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── services/         # API and business logic
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── constants/        # App constants and config
```

## 🔗 API Integration

### Authentication Endpoint
```typescript
// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: "Bearer";
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[];
    };
  };
}

// Default crew credentials for testing
const TEST_CREDENTIALS = {
  email: "crew.keren@zatix.id",
  password: "password123"
};
```

### Validation Endpoint
```typescript
// POST /e-tickets/validate
interface ValidationRequest {
  ticket_code: string;
}

interface ValidationResponse {
  success: boolean;
  message: string;
  data: {
    ticket_code: string;
    event_id: number;
    event_name: string;
    validated_at: string;
    validated_by: {
      id: number;
      name: string;
    };
  };
}
```

## 🏗️ Core Components to Build

### 1. Authentication Service
```typescript
// src/services/AuthService.ts
class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse>
  async logout(): Promise<void>
  async getStoredToken(): Promise<string | null>
  async storeToken(token: string): Promise<void>
}
```

### 2. QR Scanner Component
```typescript
// src/components/QRScanner.tsx
interface QRScannerProps {
  onScan: (code: string) => void;
  onError: (error: string) => void;
  isActive: boolean;
}
```

### 3. Validation Service
```typescript
// src/services/ValidationService.ts
class ValidationService {
  async validateTicket(code: string): Promise<ValidationResponse>
  async getValidationHistory(): Promise<ValidationResponse[]>
}
```

### 4. Main Screens
```typescript
// Required screens:
- LoginScreen
- ScannerScreen (main screen with QR scanner)
- ManualEntryScreen
- ValidationResultScreen
- SettingsScreen
```

## 🎨 UI/UX Implementation Guide

### Design System
```typescript
// src/constants/theme.ts
export const COLORS = {
  primary: '#1e40af',
  success: '#16a34a',
  error: '#dc2626',
  warning: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

### Scanner Screen Layout
```typescript
// Key components for scanner screen:
- Camera view with QR overlay
- Event info header
- Validation counter
- Manual entry button
- Settings/logout button
```

## 🔧 Business Logic Implementation

### Validation Rules
```typescript
// src/utils/validationRules.ts
export const ValidationRules = {
  // Ticket can only be validated once
  isAlreadyValidated: (ticket: any) => boolean,
  
  // Crew can only validate assigned events
  isEventAssigned: (eventId: number, crewEvents: number[]) => boolean,
  
  // Validation only during event time
  isWithinEventTime: (eventDate: string) => boolean,
  
  // Only crew role can access
  hasCrewRole: (userRoles: string[]) => boolean,
};
```

### Offline Support
```typescript
// src/services/OfflineQueue.ts
class OfflineQueue {
  async queueValidation(ticketCode: string): Promise<void>
  async processQueue(): Promise<void>
  async getQueuedItems(): Promise<any[]>
}
```

## 📱 Platform-Specific Considerations

### Android Configuration
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS Configuration
```xml
<!-- ios/ZaTixCrew/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes for ticket validation</string>
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// src/__tests__/services/ValidationService.test.ts
describe('ValidationService', () => {
  test('should validate ticket successfully', async () => {
    // Test validation logic
  });
  
  test('should handle validation errors', async () => {
    // Test error scenarios
  });
});
```

### Component Tests
```typescript
// src/__tests__/components/QRScanner.test.tsx
describe('QRScanner', () => {
  test('should trigger onScan when QR code detected', () => {
    // Test QR scanning functionality
  });
});
```

## 🚀 Performance Optimization

### Best Practices
- **Lazy loading** for screens not immediately needed
- **Image optimization** for icons and backgrounds
- **Memory management** for camera resources
- **Network request optimization** with caching
- **Bundle size optimization** with code splitting

### Camera Performance
```typescript
// Optimize camera usage
const cameraConfig = {
  quality: 0.7, // Balance quality vs performance
  fixOrientation: true,
  flashMode: 'auto',
  focus: 'on',
};
```

## 🔐 Security Implementation

### Token Management
```typescript
// src/services/SecureStorage.ts
import { Keychain } from 'react-native-keychain';

class SecureStorage {
  async storeToken(token: string): Promise<void> {
    await Keychain.setInternetCredentials('zatix_crew', 'token', token);
  }
  
  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getInternetCredentials('zatix_crew');
    return credentials ? credentials.password : null;
  }
}
```

### Input Validation
```typescript
// src/utils/inputValidation.ts
export const validateTicketCode = (code: string): boolean => {
  // Validate ticket code format (e.g., ZTX-XXXXXXXXXX)
  const ticketPattern = /^ZTX-[A-Z0-9]{12}$/;
  return ticketPattern.test(code);
};
```

## 📊 Analytics & Monitoring

### Error Tracking
```typescript
// src/services/ErrorTracking.ts
class ErrorTracking {
  logError(error: Error, context: string): void
  logValidationEvent(ticketCode: string, success: boolean): void
  logUserAction(action: string, data?: any): void
}
```

### Performance Monitoring
```typescript
// Track key metrics:
- App startup time
- QR scan recognition time
- API response times
- Validation success rate
```

## 🚢 Deployment Checklist

### Pre-Deployment
- [ ] Complete testing on physical devices
- [ ] Optimize bundle size
- [ ] Configure production API endpoints
- [ ] Set up crash reporting
- [ ] Prepare app store assets

### App Store Preparation
- [ ] App icons (various sizes)
- [ ] Screenshots for different devices
- [ ] App description and keywords
- [ ] Privacy policy
- [ ] Terms of service

## 💡 Development Tips

1. **Start with authentication** - Get login working first
2. **Mock API responses** - Work offline during development
3. **Test on real devices** - Camera functionality varies by device
4. **Handle permissions gracefully** - Provide clear messaging
5. **Optimize for different screen sizes** - Test on various devices
6. **Plan for network issues** - Implement retry logic and offline queue

## 🔄 Development Workflow

1. **Setup & Foundation** (Week 1-2)
2. **Core Features** (Week 3-4) 
3. **Polish & Testing** (Week 5-6)
4. **Deployment** (Week 7-8)

Each phase should include thorough testing and documentation updates.

---

**This prompt provides the foundation for developing the ZaTix Crew mobile app. Follow the guidelines, implement the specified features, and maintain high code quality throughout the development process.**