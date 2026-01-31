# HomeVeda Backend - API Reference Guide

## Table of Contents

1. [User Management API](#user-management-api)
2. [Project Management API](#project-management-api)
3. [Catalog API](#catalog-api)
4. [Quotation API](#quotation-api)
5. [Design API](#design-api)
6. [Material API](#material-api)
7. [Initial Lead API](#initial-lead-api)
8. [Inspection API](#inspection-api)

---

## User Management API

### 1. Register User

**Endpoint**: `POST /user`

**Description**: Create a new regular user account

**Authentication**: ❌ Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "address": "123 Main Street, City, State",
  "phone": "9876543210"
}
```

**Response**:
```json
{
  "message": "User registered successfully"
}
```

**Status Code**: 201 Created

**Error Cases**:
- 409: User already exists (duplicate email)
- 500: Server error

---

### 2. Register Admin

**Endpoint**: `POST /user/admin`

**Description**: Create a new admin user account

**Authentication**: ❌ Not required

**Request Body**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword123",
  "phone": "9876543210"
}
```

**Response**:
```json
{
  "message": "Admin user registered successfully"
}
```

**Status Code**: 201 Created

---

### 3. User Login

**Endpoint**: `POST /user/login`

**Description**: Authenticate user and receive JWT token

**Authentication**: ❌ Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code**: 200 OK

**Error Cases**:
- 400: Invalid email or password

---

### 4. Admin Login

**Endpoint**: `POST /user/admin/login`

**Description**: Authenticate admin user and receive JWT token

**Authentication**: ❌ Not required

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Get User Details

**Endpoint**: `GET /user`

**Description**: Retrieve current authenticated user's details

**Authentication**: ✅ Required

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main Street",
  "phone": "9876543210",
  "isAdmin": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 6. Get All Users

**Endpoint**: `GET /user/all`

**Description**: Retrieve all users (admin-only)

**Authentication**: ✅ Required (Admin)

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin User",
    "email": "admin@example.com",
    "isAdmin": true,
    "createdAt": "2024-01-15T11:00:00Z"
  }
]
```

---

### 7. Update User Details

**Endpoint**: `PATCH /user`

**Description**: Update user profile information

**Authentication**: ✅ Required

**Request Body**:
```json
{
  "email": "john@example.com",
  "name": "John Smith",
  "address": "456 Oak Avenue",
  "phone": "8765432109"
}
```

**Response**:
```json
{
  "message": "User updated successfully"
}
```

---

### 8. Change Password

**Endpoint**: `POST /user/change-password`

**Description**: Change user password

**Authentication**: ✅ Required

**Request Body**:
```json
{
  "email": "john@example.com",
  "oldPassword": "securepassword123",
  "newPassword": "newsecurepassword456"
}
```

**Response**:
```json
{
  "message": "Password changed successfully"
}
```

---

### 9. Forgot Password

**Endpoint**: `POST /user/forgot-password`

**Description**: Request password reset link via email

**Authentication**: ❌ Not required

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "message": "Password reset link sent to your email"
}
```

---

### 10. Reset Password

**Endpoint**: `POST /user/reset-password/:token`

**Description**: Reset password using reset token from email

**Authentication**: ❌ Not required

**URL Parameters**:
- `token` - Reset token from email

**Request Body**:
```json
{
  "newPassword": "newsecurepassword456"
}
```

**Response**:
```json
{
  "message": "Password reset successfully"
}
```

---

### 11. Delete User

**Endpoint**: `DELETE /user`

**Description**: Delete user account

**Authentication**: ✅ Required

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "message": "User deleted successfully"
}
```

---

## Project Management API

### 1. Create Project

**Endpoint**: `POST /project`

**Description**: Create a new project

**Authentication**: ✅ Required

**Request Body** (multipart/form-data):
```json
{
  "userEmail": "john@example.com",
  "projectHead": "John Doe",
  "architectName": "Alice Smith",
  "category": "Standard",
  "status": "LEAD",
  "kitchen": {
    "kitchenType": "L-Shape",
    "requiremntsOfCounter": "Island",
    "appliances": ["Oven", "Dishwasher"],
    "loftRequired": true,
    "theme": "Modern",
    "layoutPlan": ["Plan1", "Plan2"]
  },
  "wardrobe": {
    "type": ["Sliding", "Hinged"],
    "additionalRequirements": "Custom sizing",
    "measurements": ["3x2", "4x3"]
  }
}
```

**Files**: Up to 10 files (measurements/documents)

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userEmail": "john@example.com",
  "projectHead": "John Doe",
  "category": "Standard",
  "status": "LEAD",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

**Status Code**: 201 Created

---

### 2. Get Project Details

**Endpoint**: `GET /project/:id`

**Description**: Retrieve specific project details

**Authentication**: ✅ Required

**URL Parameters**:
- `id` - Project UUID

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userEmail": "john@example.com",
  "projectHead": "John Doe",
  "architectName": "Alice Smith",
  "category": "Standard",
  "status": "DESIGN",
  "kitchen": { /* details */ },
  "wardrobe": { /* details */ },
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

**Status Code**: 200 OK

---

### 3. Get User Projects

**Endpoint**: `GET /project/user?userEmail=john@example.com`

**Description**: Get all projects for a specific user

**Authentication**: ✅ Required

**Query Parameters**:
- `userEmail` - User email address

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userEmail": "john@example.com",
    "projectHead": "John Doe",
    "status": "DESIGN"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userEmail": "john@example.com",
    "projectHead": "Jane Smith",
    "status": "QUOTATION"
  }
]
```

---

### 4. Update Project

**Endpoint**: `PATCH /project/:id`

**Description**: Update project details

**Authentication**: ✅ Required

**URL Parameters**:
- `id` - Project UUID

**Request Body**: Same structure as Create Project

**Response**:
```json
{
  "message": "Project updated successfully"
}
```

---

### 5. Delete Project

**Endpoint**: `DELETE /project/:id`

**Description**: Delete a project

**Authentication**: ✅ Required

**URL Parameters**:
- `id` - Project UUID

**Response**:
```json
{
  "message": "Project deleted successfully"
}
```

---

## Catalog API

### 1. Create Catalog Item

**Endpoint**: `POST /catelog`

**Description**: Create a new catalog item

**Authentication**: ✅ Required (Admin)

**Request Body** (multipart/form-data):
```json
{
  "name": "Modern Kitchen Cabinet",
  "description": "High-quality plywood cabinet",
  "workType": "Carcass",
  "category": "Standard",
  "price": 15000,
  "type": "Premium"
}
```

**Files**: 
- `image` - Product image
- `video` - Product video (required for Premium items)

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Modern Kitchen Cabinet",
  "price": 15000,
  "category": "Standard",
  "workType": "Carcass",
  "type": "Premium",
  "imageLink": "https://home-veda-storage.s3.amazonaws.com/...",
  "video": "https://home-veda-storage.s3.amazonaws.com/..."
}
```

**Status Code**: 201 Created

---

### 2. Get All Catalogs

**Endpoint**: `GET /catelog`

**Description**: Retrieve all catalog items

**Authentication**: ✅ Required (Admin)

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Modern Kitchen Cabinet",
    "price": 15000,
    "category": "Standard",
    "workType": "Carcass",
    "type": "Premium"
  }
]
```

---

### 3. Get Catalog by Category

**Endpoint**: `GET /catelog/category/:category`

**Description**: Get all items in a specific category

**Authentication**: ✅ Required (Admin)

**URL Parameters**:
- `category` - One of: Builder, Economy, Standard, VedaX

**Response**: Array of catalog items

---

### 4. Get Catalog by Category and WorkType

**Endpoint**: `GET /catelog/category/:category/workType/:workType`

**Description**: Get items filtered by category and work type

**Authentication**: ✅ Required (Admin)

**URL Parameters**:
- `category` - Builder, Economy, Standard, VedaX
- `workType` - Carcass, Shutters, Visibles, Base And Back, Main Hardware, Other Hardware, Miscellaneous, Countertop, Appliances

**Response**: Array of filtered catalog items

---

### 5. Get Catalog by Name

**Endpoint**: `GET /catelog/:name`

**Description**: Get specific catalog item by name

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Modern Kitchen Cabinet",
  "description": "High-quality plywood cabinet",
  "price": 15000,
  "category": "Standard",
  "workType": "Carcass",
  "type": "Premium",
  "imageLink": "...",
  "video": "..."
}
```

---

### 6. Update Catalog Item

**Endpoint**: `PATCH /catelog/:name`

**Description**: Update catalog item details

**Authentication**: ✅ Required (Admin)

**URL Parameters**:
- `name` - Item name

**Request Body**: Same structure as Create

**Response**:
```json
{
  "message": "Catalog updated successfully"
}
```

---

### 7. Delete Catalog Item

**Endpoint**: `DELETE /catelog/:name`

**Description**: Delete a catalog item

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Catalog deleted successfully"
}
```

---

## Quotation API

### 1. Create Quotation

**Endpoint**: `POST /quotation`

**Description**: Create a new quotation for a project

**Authentication**: ✅ Required (Admin)

**Request Body**:
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "Standard",
  "items": [
    {
      "name": "Modern Kitchen Cabinet",
      "quantity": 5,
      "price": 15000,
      "totalPrice": 75000,
      "workType": "Carcass"
    },
    {
      "name": "Cabinet Hinges",
      "quantity": 20,
      "price": 500,
      "totalPrice": 10000,
      "workType": "Main Hardware"
    }
  ],
  "totals": {
    "grossAmount": 85000,
    "freightInstallationHandling": 5000,
    "discount": 8500,
    "taxPercent": 18,
    "taxAmount": 13770,
    "grandTotal": 95270
  },
  "notes": "Include installation charges"
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [ /* items array */ ],
  "totals": { /* totals */ },
  "createdAt": "2024-01-20T10:00:00Z"
}
```

**Status Code**: 201 Created

---

### 2. Get Quotations

**Endpoint**: `GET /quotation/:projectId`

**Description**: Get all quotations for a project

**Authentication**: ✅ Required

**URL Parameters**:
- `projectId` - Project UUID

**Response**:
```json
{
  "quotations": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "items": [ /* items */ ],
      "totals": { /* totals */ },
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### 3. Update Quotation

**Endpoint**: `PATCH /quotation/:quotationId`

**Description**: Update existing quotation

**Authentication**: ✅ Required (Admin)

**URL Parameters**:
- `quotationId` - Quotation MongoDB ID

**Request Body**: Same structure as Create

**Response**:
```json
{
  "message": "Quotation updated successfully"
}
```

---

### 4. Delete Quotation

**Endpoint**: `DELETE /quotation/:quotationId`

**Description**: Delete a quotation

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Quotation deleted successfully"
}
```

---

## Design API

### 1. Create Design

**Endpoint**: `POST /designs`

**Description**: Create design selections for a project

**Authentication**: ✅ Required (Admin)

**Request Body**:
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "name": "Kitchen Design Option 1",
      "imageLink": "https://...",
      "designLink": "https://..."
    }
  ]
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [ /* items */ ]
}
```

---

### 2. Get Design

**Endpoint**: `GET /designs/:projectId`

**Description**: Get design selections for a project

**Authentication**: ✅ Required (Admin)

**Response**: Design document with items array

---

### 3. Update Design

**Endpoint**: `PATCH /designs/:projectId`

**Description**: Update project design

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Design updated successfully"
}
```

---

### 4. Delete Design

**Endpoint**: `DELETE /designs/:projectId`

**Description**: Delete project design

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Design deleted successfully"
}
```

---

## Material API

### 1. Create Material

**Endpoint**: `POST /materials`

**Description**: Add material selections for a project

**Authentication**: ✅ Required (Admin)

**Request Body**:
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "materials": [
    {
      "name": "White Oak Veneer",
      "color": "White",
      "imageLink": "https://..."
    }
  ]
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "materials": [ /* materials */ ]
}
```

---

### 2. Get Material

**Endpoint**: `GET /materials/:projectId`

**Description**: Get material selections for a project

**Authentication**: ✅ Required (Admin)

**Response**: Material document with materials array

---

### 3. Update Material

**Endpoint**: `PATCH /materials/:projectId`

**Description**: Update project materials

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Material updated successfully"
}
```

---

### 4. Delete Material

**Endpoint**: `DELETE /materials/:projectId`

**Description**: Delete project materials

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Material deleted successfully"
}
```

---

## Initial Lead API

### 1. Create Lead

**Endpoint**: `POST /initiallead`

**Description**: Create initial customer lead

**Authentication**: ✅ Required (Admin)

**Request Body**:
```json
{
  "id": "LEAD001",
  "name": "Customer Name",
  "address": "123 Main Street",
  "contactNumber": "9876543210",
  "architectStatus": "Account Not Created",
  "category": ["Standard", "Premium"],
  "requirements": ["Kitchen", "Wardrobe"]
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439019",
  "id": "LEAD001",
  "name": "Customer Name",
  "status": "success"
}
```

---

### 2. Get All Leads

**Endpoint**: `GET /initiallead`

**Description**: Get all customer leads

**Authentication**: ✅ Required (Admin)

**Response**: Array of lead documents

---

### 3. Update Lead

**Endpoint**: `PATCH /initiallead/:id`

**Description**: Update lead information

**Authentication**: ✅ Required (Admin)

**URL Parameters**:
- `id` - Lead ID

**Response**:
```json
{
  "message": "Lead updated successfully"
}
```

---

### 4. Delete Lead

**Endpoint**: `DELETE /initiallead/:id`

**Description**: Delete a lead

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Lead deleted successfully"
}
```

---

## Inspection API

### 1. Create Inspection

**Endpoint**: `POST /inspections`

**Description**: Create project inspection record

**Authentication**: ✅ Required (Admin)

**Request Body**:
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "inspectionDate": "2024-02-01T10:00:00Z",
  "plumbingStatus": "Completed",
  "plumbingVideo": "https://...",
  "electricityStatus": "In Progress",
  "electricityVideo": "https://...",
  "chimneyPointStatus": "Pending",
  "falseCeilingStatus": "Completed",
  "flooringStatus": "In Progress",
  "otherVideos": ["https://..."]
}
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "inspectionDate": "2024-02-01T10:00:00Z",
  "status": "success"
}
```

---

### 2. Get Inspection

**Endpoint**: `GET /inspections/:projectId`

**Description**: Get inspection records for a project

**Authentication**: ✅ Required (Admin)

**Response**: Inspection document with all status fields

---

### 3. Update Inspection

**Endpoint**: `PATCH /inspections/:projectId`

**Description**: Update inspection details

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Inspection updated successfully"
}
```

---

### 4. Delete Inspection

**Endpoint**: `DELETE /inspections/:projectId`

**Description**: Delete inspection record

**Authentication**: ✅ Required (Admin)

**Response**:
```json
{
  "message": "Inspection deleted successfully"
}
```

---

## Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Conflict with existing data |
| 500 | Server Error | Internal server error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Descriptive error message",
  "error": "Additional error details (if applicable)"
}
```

---

## Rate Limiting

*Recommended for production:*
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Pagination

*To be implemented:*
- `?page=1&limit=20` for list endpoints
- Response includes `total`, `pages`, `currentPage`

---

## Filtering & Sorting

*To be implemented:*
- `?sort=createdAt&order=desc`
- `?filter[category]=Standard&filter[type]=Premium`
