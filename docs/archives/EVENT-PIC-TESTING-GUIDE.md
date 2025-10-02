# Event PIC (Person In Charge) System - Testing Guide

## 🎯 **Overview**

The Event PIC system creates a hierarchical staff management structure where:
- **EO Owners** can create events and assign **Event PICs**
- **Event PICs** can then assign **Crew**, **Cashier**, and **Finance** staff to their events
- Each role has specific permissions and access levels

## 👥 **Role Hierarchy**

```
Super Admin (Platform level)
    ↓
EO Owner (Organization level)
    ↓
Event PIC (Event level) ← **Key Role**
    ↓
├── Crew (Event execution)
├── Cashier (Ticket sales)
└── Finance (Financial operations)
```

## 🚀 **Step-by-Step Testing Process**

### **Step 1: Setup EO Owner Account**

1. **Login as EO Owner**:
   - Go to `/login`
   - Use credentials with `eo-owner` role
   - Or register a new EO account

2. **Verify Dashboard Access**:
   - Navigate to `/dashboard`
   - Confirm you can see the events management section

### **Step 2: Create or Select an Event**

1. **Create New Event** (if needed):
   - Click "Create Event" button
   - Fill in event details
   - Save the event

2. **Select Existing Event**:
   - Go to `/dashboard/events`
   - Click on any existing event

### **Step 3: Access Event Staff Management**

1. **Navigate to Event Details**:
   - From events list, click on an event
   - You'll see the event details page

2. **Open Staff Tab**:
   - Click on the "Staff" tab
   - This shows the `EventStaffManagement` component

### **Step 4: Assign Event PIC**

1. **Add New Staff Member**:
   - Click "Add Staff Member" button
   - Fill in the form:
     - **Name**: Enter staff member name
     - **Email**: Enter email address
     - **Role**: Select "Event PIC" from dropdown

2. **Save Assignment**:
   - Click "Assign Staff"
   - The staff member is now assigned as Event PIC for this event

### **Step 5: Login as Event PIC**

1. **Switch to Event PIC Account**:
   - Logout from EO Owner account
   - Login with the Event PIC credentials
   - Or use role switching if available

2. **Verify Event PIC Dashboard**:
   - Go to `/dashboard`
   - Confirm you can see events assigned to you
   - Navigate to the event you were assigned to

### **Step 6: Event PIC Assigns Sub-Staff**

1. **Access Event Staff Management**:
   - As Event PIC, go to your assigned event
   - Click on the "Staff" tab

2. **Assign Crew Members**:
   - Click "Add Staff Member"
   - Select role: "Crew"
   - Add staff member details

3. **Assign Cashier**:
   - Repeat process with role: "Cashier"

4. **Assign Finance Staff**:
   - Repeat process with role: "Finance"

### **Step 7: Test Role Permissions**

1. **Crew Role Test**:
   - Login as crew member
   - Verify limited access to event operations

2. **Cashier Role Test**:
   - Login as cashier
   - Test ticket sales and payment processing access

3. **Finance Role Test**:
   - Login as finance staff
   - Check financial reporting and settlement access

## 🔑 **Key API Endpoints**

### **Event Staff Management** (Event-specific)
```
GET    /api/events/{eventId}/staffs           # Get event staff
POST   /api/events/{eventId}/staffs           # Assign staff to event
PUT    /api/events/{eventId}/staffs/{staffId} # Update event staff
DELETE /api/events/{eventId}/staffs/{staffId} # Remove staff from event
```

### **Organization Staff Management** (Organization-wide)
```
GET    /api/eo/staffs          # Get organization staff
POST   /api/eo/staffs          # Create organization staff
PUT    /api/eo/staffs/{staffId} # Update organization staff
DELETE /api/eo/staffs/{staffId} # Delete organization staff
```

## 📱 **UI Components Location**

- **Event Staff Management**: `/components/dashboard/event-staff-management.tsx`
- **Organization Staff**: `/app/dashboard/roles/page.tsx`
- **Event Details**: `/components/dashboard/event-details-page.tsx`
- **Testing Page**: `/app/test/event-pic/page.tsx`

## 🧪 **Testing Page Features**

Access the comprehensive testing interface at `/test/event-pic`:

1. **Role Hierarchy Visualization**: See all roles and their permissions
2. **Step-by-Step Guide**: Interactive testing workflow
3. **Quick Test Actions**: Direct links to key features
4. **API Reference**: Complete endpoint documentation

## ✅ **What to Verify**

### **For EO Owners**:
- ✅ Can create events
- ✅ Can assign Event PICs to events
- ✅ Can view all event staff
- ✅ Has access to all event management features

### **For Event PICs**:
- ✅ Can only see assigned events
- ✅ Can assign Crew, Cashier, Finance to their events
- ✅ Cannot assign other Event PICs
- ✅ Has limited access to only assigned events

### **For Sub-Staff (Crew/Cashier/Finance)**:
- ✅ Can only access their assigned events
- ✅ Has role-specific permissions
- ✅ Cannot assign other staff members
- ✅ Limited to their functional area

## 🎨 **Visual Indicators**

- **Event PIC**: 🟡 Amber background in staff lists
- **Finance Staff**: 🟢 Green badges and icons
- **Cashier**: 🟠 Orange badges and icons  
- **Crew**: 🔵 Blue badges and icons

## 🔧 **Troubleshooting**

### **Common Issues**:

1. **Cannot assign Event PIC**: 
   - Ensure you're logged in as EO Owner or Super Admin
   - Check if the event belongs to your organization

2. **Event PIC cannot assign staff**: 
   - Verify the Event PIC is properly assigned to the event
   - Check role permissions in the database

3. **Staff not showing in event**: 
   - Confirm the staff member is assigned to the specific event
   - Check the event-staff relationship in the database

## 📊 **Mock Data for Testing**

The system includes comprehensive mock data:
- Sample events with different statuses
- Pre-configured staff members with various roles
- Realistic permission structures
- Event-staff relationships

## 🌐 **Quick Access Links**

- **Testing Dashboard**: `/test/event-pic`
- **Events Management**: `/dashboard/events`
- **Staff & Roles**: `/dashboard/roles`
- **Create Event**: `/dashboard/events/create`

---

**🎯 Ready to test?** Start by visiting `/test/event-pic` for an interactive testing experience!
