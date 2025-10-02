# ZaTix Crew Mobile App - Ticket Validation System

## 📱 Project Overview

**Repository**: `zatix-crew-mobile` (separate from main web platform)  
**Platform**: React Native (iOS & Android)  
**Purpose**: Mobile app for crew members to validate event tickets via QR scanning  
**Target Users**: Event crew members with "crew" role

## 🎯 Core Features

### 1. Authentication System
- **Login Screen** with crew credentials
- **Default Test User**:
  ```json
  {
    "email": "crew.keren@zatix.id", 
    "password": "password123"
  }
  ```
- **Token Management** using AsyncStorage
- **Auto-logout** on token expiration

### 2. QR Code Scanner
- **Camera-based scanning** using device camera
- **Manual code entry** as backup option
- **Scanning feedback** (success/error animations)
- **Flashlight toggle** for low-light conditions

### 3. Ticket Validation
- **API Integration**: `POST /e-tickets/validate`
- **Request Format**:
  ```json
  {
    "ticket_code": "ZTX-LIRGSH9MMAUZ"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Ticket validated successfully.",
    "data": {
      "ticket_code": "ZTX-LIRGSH9MMAUZ",
      "event_id": 1,
      "event_name": "Workshop Fotografi: Teknik Dasar",
      "validated_at": "2025-07-18T10:30:34.000000Z",
      "validated_by": {
        "id": 11,
        "name": "Crew EO Keren"
      }
    }
  }
  ```

### 4. Validation Rules & Business Logic
- ✅ **One-time validation**: Tickets can only be validated once
- ✅ **Event-specific**: Crew can only validate tickets for assigned events
- ✅ **Time-limited**: Validation only allowed during event date/time
- ✅ **Role-based**: Only users with "crew" role can access the app

### 5. Real-time Features
- **Live validation stats** for event organizers
- **Push notifications** for validation events
- **Offline queue** for network interruptions

## 🛠️ Technical Requirements

### Development Stack
- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **State Management**: Context API + AsyncStorage
- **HTTP Client**: Axios
- **QR Scanner**: react-native-qrcode-scanner
- **Camera**: react-native-camera or react-native-vision-camera
- **Testing**: Jest + React Native Testing Library

### API Integration
- **Base URL**: `https://api.zatix.id/api`
- **Authentication**: Bearer token in headers
- **Endpoints**:
  - `POST /auth/login` - Crew authentication
  - `POST /e-tickets/validate` - Ticket validation
  - `GET /crew/events` - Get assigned events (if needed)

### Device Requirements
- **Camera access** for QR scanning
- **Network connectivity** for API calls
- **Local storage** for offline queuing
- **Push notifications** capability

## 📱 Screen Structure

### 1. Authentication Flow
```
LoginScreen
├── Email input field
├── Password input field  
├── Login button
└── Error handling
```

### 2. Main Scanner Screen
```
ScannerScreen
├── Camera view with QR overlay
├── Manual entry button
├── Scan results display
├── Event info header
├── Validation stats counter
└── Logout button
```

### 3. Manual Entry Screen
```
ManualEntryScreen
├── Ticket code input field
├── Submit button
├── Recent scans list
└── Back to scanner button
```

### 4. Results Screen
```
ValidationResultScreen
├── Success/Error status
├── Ticket details display
├── Event information
├── Timestamp
└── Continue scanning button
```

## 🎨 UI/UX Requirements

### Design Principles
- **Simple & Clean** interface for easy use in event environments
- **Large touch targets** for handheld device usage
- **High contrast** colors for outdoor visibility
- **Minimal cognitive load** for quick scanning workflow

### Color Scheme
- **Primary**: #1e40af (blue)
- **Success**: #16a34a (green)  
- **Error**: #dc2626 (red)
- **Background**: #f8fafc (light gray)

### Typography
- **Headers**: Bold, large text
- **Body**: Regular, readable font size
- **Status messages**: Clear, contrasting colors

## 🔧 Development Setup

### Prerequisites
```bash
# Node.js 18+
# React Native CLI
# Android Studio (for Android)
# Xcode (for iOS)
```

### Project Initialization
```bash
npx react-native init ZaTixCrew --template react-native-template-typescript
cd ZaTixCrew
npm install axios react-navigation-native react-native-qrcode-scanner
```

### Environment Configuration
```typescript
// config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.zatix.id/api',
  TIMEOUT: 10000,
};

// config/storage.ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@zatix_crew_token',
  USER_DATA: '@zatix_crew_user',
};
```

## 🧪 Testing Requirements

### Unit Tests
- [ ] Authentication flow
- [ ] API service functions
- [ ] QR code parsing
- [ ] Validation logic

### Integration Tests
- [ ] Login → Scanner flow
- [ ] Scanner → Validation flow
- [ ] Manual entry workflow
- [ ] Offline queue functionality

### E2E Tests
- [ ] Complete validation workflow
- [ ] Error handling scenarios
- [ ] Network interruption recovery

## 📋 Implementation Tasks

### Phase 1: Foundation (Week 1-2)
- [ ] Set up React Native project with TypeScript
- [ ] Configure navigation structure
- [ ] Implement authentication screens
- [ ] Set up API service layer
- [ ] Create basic UI components

### Phase 2: Core Features (Week 3-4)
- [ ] Implement QR scanner functionality
- [ ] Add manual entry capability
- [ ] Create validation result screens
- [ ] Implement offline queue system
- [ ] Add error handling and feedback

### Phase 3: Enhancement (Week 5-6)
- [ ] Add push notifications
- [ ] Implement real-time stats
- [ ] Optimize performance
- [ ] Add accessibility features
- [ ] Complete testing suite

### Phase 4: Deployment (Week 7-8)
- [ ] Android build optimization
- [ ] iOS build configuration
- [ ] App store preparation
- [ ] Beta testing with crew members
- [ ] Production deployment

## 📊 Success Metrics

### Technical Metrics
- [ ] < 2 second app startup time
- [ ] < 1 second QR scan recognition
- [ ] 99.5% validation accuracy
- [ ] Offline queue reliability

### User Experience Metrics
- [ ] < 5 second validation workflow
- [ ] Intuitive UI requiring minimal training
- [ ] Reliable performance in various lighting conditions
- [ ] Smooth performance on mid-range devices

## 🚀 Deployment Strategy

### Development Environment
- **Testing**: Local simulators + physical devices
- **Backend**: Development API endpoints
- **Distribution**: Internal testing builds

### Production Environment
- **Android**: Google Play Store (internal testing → production)
- **iOS**: Apple App Store (TestFlight → production)
- **Backend**: Production API with proper error handling
- **Monitoring**: Crash reporting and analytics

## 📝 Documentation Requirements

- [ ] Setup and installation guide
- [ ] API integration documentation
- [ ] User manual for crew members
- [ ] Troubleshooting guide
- [ ] Deployment instructions

## 🔒 Security Considerations

- [ ] Secure token storage using Keychain/Keystore
- [ ] API communication over HTTPS only
- [ ] Input validation for manual entry
- [ ] Secure logging (no sensitive data)
- [ ] Regular security updates

---

**Issue Labels**: `mobile`, `react-native`, `crew-tools`, `qr-scanner`, `high-priority`  
**Milestone**: Iteration 6 - Ticket Validation at Venue  
**Assignee**: Mobile development team  
**Estimated Timeline**: 8 weeks