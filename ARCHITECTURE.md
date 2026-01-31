# HomeVeda Backend - Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Models](#data-models)
5. [API Architecture](#api-architecture)
6. [Authentication & Security](#authentication--security)
7. [File Upload & Storage](#file-upload--storage)
8. [Error Handling](#error-handling)
9. [Design Patterns](#design-patterns)

---

## System Overview

HomeVeda is an enterprise-level quotation management system designed for interior design companies. The backend provides a RESTful API for managing projects, catalogs, quotations, designs, materials, and user accounts with role-based access control.

### Core Responsibilities

- **User Management**: Registration, authentication, password reset
- **Project Management**: Lifecycle tracking from lead to handover
- **Catalog Management**: Interior design items with pricing and categorization
- **Quotation Generation**: Dynamic quotation creation and updates
- **Design Tracking**: Design specifications and visual assets
- **Material & Inspection Tracking**: Project material selections and site inspections
- **File Management**: Secure cloud storage via AWS S3

---

## Technology Stack

### Core Framework
- **Express.js** (v5.1.0) - Web framework for RESTful API
- **Node.js** - JavaScript runtime

### Database
- **MongoDB** (v8.18.3) - NoSQL document database
- **Mongoose** - ODM (Object Document Mapper) for schema validation

### Authentication & Security
- **JWT** (jsonwebtoken v9.0.2) - Token-based authentication
- **bcrypt** (v6.0.0) - Password hashing and verification

### File Handling
- **Multer** (v2.0.2) - Middleware for file uploads
- **AWS SDK S3** (v3.911.0) - Cloud storage integration

### Email & Utilities
- **Nodemailer** (v7.0.6) - Email service for password resets
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Morgan** (v1.10.1) - HTTP request logging
- **UUID** (v13.0.0) - Unique identifier generation
- **dotenv** (v17.2.3) - Environment variable management

---

## Project Structure

```
Backend/
├── app.js                          # Main application entry point
├── package.json                    # Dependencies and scripts
├── .env                            # Environment variables (NOT in version control)
├── config/
│   ├── mongo.js                    # MongoDB connection configuration
│   └── aws.js                      # AWS S3 configuration
├── model/                          # Mongoose schemas
│   ├── userModel.js               # User accounts and credentials
│   ├── projectModel.js            # Project lifecycle and specifications
│   ├── catelogModel.js            # Interior design items catalog
│   ├── quotationModel.js          # Quotation details and pricing
│   ├── designModel.js             # Design selections per project
│   ├── materialModel.js           # Material selections per project
│   ├── initalLeadModel.js         # Initial lead/customer information
│   └── inspectionModel.js         # Site inspection tracking
├── controller/                     # Business logic handlers
│   ├── userController.js          # User authentication and management
│   ├── projectController.js       # Project CRUD operations
│   ├── categlogController.js      # Catalog management
│   ├── quotationController.js     # Quotation operations
│   ├── designController.js        # Design management
│   ├── materialController.js      # Material management
│   ├── initialLeadController.js   # Lead management
│   └── projectInspeetionController.js # Inspection tracking
├── routes/                         # API endpoint definitions
│   ├── user.js                    # /user endpoints
│   ├── project.js                 # /project endpoints
│   ├── catelog.js                 # /catelog endpoints
│   ├── quotation.js               # /quotation endpoints
│   ├── design.js                  # /designs endpoints
│   ├── material.js                # /materials endpoints
│   ├── initialLead.js             # /initiallead endpoints
│   └── inspection.js              # /inspections endpoints
├── middleware/                     # Request processing middleware
│   ├── checkAdmin.js              # JWT verification and admin authorization
│   ├── uploadMiddleware.js        # File upload handling for catalog
│   └── uploadMeasurmentMiddleware.js # File upload handling for measurements
├── scripts/
│   └── test-s3.js                 # AWS S3 connection testing utility
└── README.md                       # Quick start guide
```

---

## Data Models

### 1. User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  address: String,
  phone: String,
  isAdmin: Boolean (default: false),
  resetToken: String,
  resetTokenExpiry: Date,
  timestamps: {createdAt, updatedAt}
}
```

**Roles:**
- **Regular User**: Clients who view quotations and track projects
- **Admin User**: Can create/edit catalog, quotations, designs, and materials

---

### 2. Project Model

```javascript
{
  id: UUID (unique project identifier),
  userEmail: String (reference to User.email),
  architectName: String,
  projectHead: String (required),
  category: Enum ["Builder", "Economy", "Standard", "VedaX"],
  status: Enum [
    "LEAD", "DESIGN", "QUOTATION", "10% TOKEN",
    "FINAL MEASUREMENT", "FINAL DRAWINGS", "50% PAYMENT",
    "FACTORY ORDER", "SITE READY CHECK", "FACTORY FULL PAYMENT",
    "DISPATCH", "90% CLIENT PAYMENT", "INSTALLATION",
    "QUALITY CHECK", "HANDOVER", "10% FINAL PAYMENT", "AFTER SALES"
  ],
  kitchen: {kitchenSchema},
  wardrobe: {wardrobeSchema}
}
```

**Kitchen Schema:**
- kitchenType, requiremntsOfCounter, appliances, loftRequired, theme, layoutPlan, additionalRequirements

**Wardrobe Schema:**
- type, additionalRequirements, measurements

---

### 3. Catalog Model

```javascript
{
  name: String (required),
  description: String,
  imageLink: String,
  video: String (required if type="Premium"),
  workType: Enum [
    "Carcass", "Shutters", "Visibles", "Base And Back",
    "Main Hardware", "Other Hardware", "Miscellaneous",
    "Countertop", "Appliances"
  ],
  category: Enum ["Builder", "Economy", "Standard", "VedaX"] (required),
  price: Number (required),
  type: Enum ["Normal", "Premium"] (required),
  displayedToClients: Boolean (default: true),
  timestamps: {createdAt, updatedAt}
}
```

---

### 4. Quotation Model

```javascript
{
  projectId: String (reference to Project.id),
  siteAddress: String,
  category: String,
  items: [
    {
      name: String (required),
      quantity: Number (required),
      price: Number (required),
      totalPrice: Number (required),
      workType: String,
      _id: false
    }
  ],
  totals: {
    grossAmount: Number,
    freightInstallationHandling: Number,
    discount: Number,
    taxPercent: Number,
    taxAmount: Number,
    grandTotal: Number
  },
  notes: String,
  timestamps: {createdAt, updatedAt}
}
```

---

### 5. Design Model

```javascript
{
  projectId: String (reference to Project.id),
  items: [
    {
      name: String,
      imageLink: String,
      designLink: String
    }
  ]
}
```

---

### 6. Material Model

```javascript
{
  projectId: String (reference to Project.id),
  materials: [
    {
      name: String (required),
      color: String,
      imageLink: String
    }
  ]
}
```

---

### 7. Initial Lead Model

```javascript
{
  id: String (required),
  name: String (required),
  address: String (required),
  contactNumber: String (required),
  architectStatus: Enum ["Account Created", "Account Not Created"],
  architectName: String,
  architectContact: String,
  architectAddress: String,
  leadStatus: String,
  requirements: [String],
  category: [String]
}
```

---

### 8. Inspection Model

```javascript
{
  projectId: String (required, reference to Project.id),
  inspectionDate: Date,
  plumbingStatus: Enum ["Pending", "Completed", "In Progress", "Not Required"],
  plumbingVideo: String,
  electricityStatus: Enum ["Pending", "Completed", "In Progress", "Not Required"],
  electricityVideo: String,
  chimneyPointStatus: Enum ["Pending", "Completed", "In Progress", "Not Required"],
  chimneyPointVideo: String,
  falseCeilingStatus: Enum ["Pending", "Completed", "In Progress", "Not Required"],
  falseCeilingVideo: String,
  flooringStatus: Enum ["Pending", "Completed", "In Progress", "Not Required"],
  flooringVideo: String,
  otherVideos: [String]
}
```

---

## API Architecture

### Request/Response Flow

```
Client Request
    ↓
CORS Middleware (Enable cross-origin)
    ↓
Body Parser Middleware (Parse JSON)
    ↓
Morgan Middleware (Log request)
    ↓
Route Handler
    ↓
Authentication Middleware (if required)
    ↓
Authorization Middleware (if admin-only)
    ↓
Business Logic (Controller)
    ↓
Database Operation (Mongoose)
    ↓
Response
```

### Base URL

```
http://localhost:5500
```

### API Endpoints by Resource

| Resource | Method | Endpoint | Auth | Role |
|----------|--------|----------|------|------|
| **User** |
| | POST | `/user` | ❌ | Public |
| | POST | `/user/admin` | ❌ | Public |
| | POST | `/user/login` | ❌ | Public |
| | POST | `/user/admin/login` | ❌ | Public |
| | POST | `/user/change-password` | ✅ | User |
| | POST | `/user/forgot-password` | ❌ | Public |
| | POST | `/user/reset-password/:token` | ❌ | Public |
| | GET | `/user` | ✅ | User |
| | GET | `/user/all` | ✅ | Admin |
| | PATCH | `/user` | ✅ | User |
| | DELETE | `/user` | ✅ | User |
| **Project** |
| | GET | `/project/user` | ✅ | User |
| | GET | `/project/:id` | ✅ | User |
| | POST | `/project` | ✅ | User |
| | PATCH | `/project/:id` | ✅ | User |
| | DELETE | `/project/:id` | ✅ | User |
| **Catalog** |
| | GET | `/catelog` | ✅ | Admin |
| | GET | `/catelog/:name` | ✅ | Admin |
| | GET | `/catelog/category/:category` | ✅ | Admin |
| | GET | `/catelog/category/:category/workType/:workType` | ✅ | Admin |
| | GET | `/catelog/category/:category/type/:type` | ✅ | Admin |
| | POST | `/catelog` | ✅ | Admin |
| | PATCH | `/catelog/:name` | ✅ | Admin |
| | DELETE | `/catelog/:name` | ✅ | Admin |
| **Quotation** |
| | GET | `/quotation/:projectId` | ✅ | User |
| | POST | `/quotation` | ✅ | Admin |
| | PATCH | `/quotation/:quotationId` | ✅ | Admin |
| | DELETE | `/quotation/:quotationId` | ✅ | Admin |
| **Design** |
| | GET | `/designs/:projectId` | ✅ | Admin |
| | POST | `/designs` | ✅ | Admin |
| | PATCH | `/designs/:projectId` | ✅ | Admin |
| | DELETE | `/designs/:projectId` | ✅ | Admin |
| **Material** |
| | GET | `/materials/:projectId` | ✅ | Admin |
| | POST | `/materials` | ✅ | Admin |
| | PATCH | `/materials/:projectId` | ✅ | Admin |
| | DELETE | `/materials/:projectId` | ✅ | Admin |
| **Initial Lead** |
| | GET | `/initiallead` | ✅ | Admin |
| | POST | `/initiallead` | ✅ | Admin |
| | PATCH | `/initiallead/:id` | ✅ | Admin |
| | DELETE | `/initiallead/:id` | ✅ | Admin |
| **Inspection** |
| | GET | `/inspections/:projectId` | ✅ | Admin |
| | POST | `/inspections` | ✅ | Admin |
| | PATCH | `/inspections/:projectId` | ✅ | Admin |
| | DELETE | `/inspections/:projectId` | ✅ | Admin |

---

## Authentication & Security

### JWT Authentication Flow

1. **User Login** → Credentials verified → JWT generated
2. **Client stores JWT** → Included in Authorization header
3. **Server receives request** → Middleware verifies JWT
4. **Token validated** → Request proceeds, else 401/403 error

### JWT Token Structure

```javascript
{
  payload: {
    userId: ObjectId,
    email: String,
    isAdmin: Boolean
  },
  expiresIn: "7 days",
  secret: process.env.JWT_SECRET
}
```

### Authorization Header Format

```
Authorization: Bearer <JWT_TOKEN>
```

### Password Security

- **Hashing Algorithm**: bcrypt with salt rounds = 10
- **Storage**: Never stored as plaintext
- **Reset Flow**: 
  - User requests reset via email
  - Temporary token sent to email
  - Token expires after time limit
  - New password hashed and stored

### Admin-Only Routes

Protected by `checkAdmin` middleware:
- Catalog CRUD operations
- Quotation creation/updates
- Design management
- Material management
- Lead management
- Inspection management

---

## File Upload & Storage

### Upload Middleware

**Two types of file uploads:**

1. **Catalog Upload** (`/catelog` route)
   - Accepts: images, videos
   - Stored in: AWS S3
   - Fields: imageLink, video

2. **Measurement Upload** (`/project` route)
   - Accepts: measurement files, documents
   - Stored in: AWS S3
   - Max files: 10

### AWS S3 Integration

- **Bucket**: `home-veda-storage`
- **Region**: `ap-south-1`
- **Configuration**: `/config/aws.js`
- **Access**: Via AWS SDK v3

### Upload Flow

```
File Upload Request
    ↓
Multer Middleware (validates file type/size)
    ↓
AWS SDK (uploads to S3)
    ↓
Returns S3 file URL
    ↓
URL stored in MongoDB
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email on registration |
| 500 | Server Error | Unhandled exception |

### Error Response Format

```javascript
{
  message: "Descriptive error message",
  error?: "Additional error details"
}
```

### Common Error Scenarios

1. **Missing JWT**: 401 - "Authorization header is missing"
2. **Invalid Token**: 401 - "Invalid token"
3. **Non-Admin Access**: 403 - "Access denied. Admins only."
4. **Duplicate Email**: 409 - "User already exists"
5. **Invalid Credentials**: 400 - "Invalid email or password"

---

## Design Patterns

### 1. MVC (Model-View-Controller)

- **Models**: Mongoose schemas define data structure
- **Controllers**: Business logic and database operations
- **Views**: API responses (JSON)
- **Routes**: URL mappings to controllers

### 2. Middleware Chain

Sequential middleware processing for cross-cutting concerns:
- CORS
- Body Parser
- Morgan Logging
- Authentication
- Authorization

### 3. Repository Pattern

Controllers act as repositories, abstracting database operations from routes.

### 4. Error Handling Pattern

Try-catch blocks in all async operations with appropriate HTTP status codes.

### 5. Async/Await

All async operations use modern async/await syntax instead of callbacks.

---

## Environment Variables

Required `.env` file variables:

```
PORT=5500
MONGO_URL=<mongodb_connection_string>
JWT_SECRET=<secure_random_string>
EMAIL_USER=<sender_email>
EMAIL_PASS=<email_app_password>
CLIENT_URL=http://localhost:3000
AWS_ACCESS_KEY=<aws_access_key>
AWS_SECRET_KEY=<aws_secret_key>
AWS_REGION=ap-south-1
S3_BUCKET=home-veda-storage
```

---

## Performance Considerations

1. **Database Indexing**: Email field indexed for faster lookups
2. **JWT Expiration**: 7-day token validity reduces session overhead
3. **File Storage**: Cloud storage (S3) offloads file handling
4. **Request Logging**: Morgan provides request metrics
5. **CORS**: Optimized for cross-origin requests

---

## Security Best Practices Implemented

✅ Password hashing with bcrypt  
✅ JWT-based stateless authentication  
✅ Admin authorization checks  
✅ Environment variable protection  
✅ CORS configuration  
✅ Email-based password reset with token expiry  
✅ Input validation via Mongoose schemas  

---

## Future Enhancement Recommendations

1. Rate limiting for API endpoints
2. Request validation middleware (joi/yup)
3. API versioning (/v1/, /v2/)
4. Comprehensive logging system
5. Automated testing suite
6. API documentation (Swagger/OpenAPI)
7. Caching layer (Redis)
8. Database connection pooling
9. Backup and disaster recovery procedures
10. Enhanced audit trails
