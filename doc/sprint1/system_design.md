# System Design Document

## Project: GLOW (Great Lakes Observations of Water Temperatures)
### Version: 1.0
### Date: June 15, 2025
### Sprint: 1

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [CRC Cards for Sprint 1 Features](#crc-cards-for-sprint-1-features)
4. [System Interactions and Assumptions](#system-interactions-and-assumptions)
5. [Technology Stack](#technology-stack)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Security Considerations](#security-considerations)

---

## System Overview

GLOW is a full-stack web application designed to crowdsource, visualize, and analyze nearshore water temperature data across the Great Lakes region. The system follows a modern three-tier architecture with a React-based frontend, Express.js backend, and MongoDB database.

### Key Features for Sprint 1:
- User registration and authentication
- Interactive map-based data visualization
- Water temperature data upload and retrieval
- Mobile-responsive design
- Basic data filtering by time range

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Web Browser   │  │  Mobile Safari  │  │  Mobile Chrome  │  │
│  │   (Desktop)     │  │    (iOS)        │  │   (Android)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                           HTTPS/REST API
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       PRESENTATION TIER                         │
├─────────────────────────────────────────────────────────────────┤
│                        Next.js Frontend                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   React Pages   │  │   Components    │  │   API Client    │  │
│  │                 │  │                 │  │                 │  │
│  │ • LoginForm     │  │ • MapComponent  │  │ • api.js        │  │
│  │ • MapView       │  │ • HUD Components│  │ • HTTP Client   │  │
│  │ • Dashboard     │  │ • FloatingMenu  │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                           HTTP/JSON
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER                         │
├─────────────────────────────────────────────────────────────────┤
│                       Express.js Backend                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Controllers   │  │   Middleware    │  │     Routes      │  │
│  │                 │  │                 │  │                 │  │
│  │ • UserController│  │ • authMiddleware│  │ • authRoutes    │  │
│  │ • WaterData     │  │ • CORS          │  │ • waterDataRoute│  │
│  │   Controller    │  │ • Validation    │  │ • API Routes    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                           Mongoose ODM
                                │
┌─────────────────────────────────────────────────────────────────┐
│                           DATA TIER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   MongoDB       │  │  External APIs  │  │   File System   │  │
│  │                 │  │                 │  │                 │  │
│  │ • Users         │  │ • OpenWater API │  │ • Static Assets │  │
│  │ • Temperature   │  │ • Weather APIs  │  │ • Logs          │  │
│  │   Readings      │  │                 │  │                 │  │
│  │ • Locations     │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Selection Reasoning

**Three-Tier Architecture** was chosen for the following reasons:

1. **Separation of Concerns**: Clear separation between presentation, business logic, and data layers
2. **Scalability**: Each tier can be scaled independently based on demand
3. **Maintainability**: Changes in one tier have minimal impact on others
4. **Technology Flexibility**: Different technologies can be used for each tier
5. **Team Development**: Different team members can work on different tiers simultaneously

**MVC Pattern** within the application tier provides:
- **Model**: Data representation and business logic (Mongoose models)
- **View**: User interface components (React components)
- **Controller**: Request handling and response generation (Express controllers)

---

## CRC Cards for Sprint 1 Features

### 1. User Class

| **Class Name:** | User |
|-----------------|------|
| **Parent Class:** | None |
| **Subclasses:** | None (potential: AdminUser, RegularUser in future sprints) |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Store user authentication data | • UserController |
| • Validate user input (email, password) | • AuthMiddleware |
| • Hash and verify passwords | • MongoDB |
| • Track user session information | • JWT Token Service |
| • Maintain user profile data | |
| • Handle user registration and login | |

---

### 2. UserController Class

| **Class Name:** | UserController |
|-----------------|----------------|
| **Parent Class:** | None |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Handle user registration requests | • User (Model) |
| • Handle user login requests | • AuthMiddleware |
| • Generate JWT tokens | • Express Validator |
| • Validate user input | • BCrypt |
| • Handle password hashing | • JWT Library |
| • Manage user sessions | |
| • Return appropriate HTTP responses | |

---

### 3. MapComponent Class

| **Class Name:** | MapComponent |
|-----------------|--------------|
| **Parent Class:** | React.Component |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Render interactive map interface | • Leaflet Library |
| • Display water temperature data points | • API Client |
| • Handle map interactions (zoom, pan, click) | • TemperatureDataService |
| • Manage map themes (light/dark mode) | • HUD Components |
| • Load and display tile layers | • FloatingMenu |
| • Handle geolocation requests | |
| • Render temperature markers with color coding | |

---

### 4. WaterDataController Class

| **Class Name:** | WaterDataController |
|-----------------|---------------------|
| **Parent Class:** | None |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Handle temperature data upload requests | • TemperatureReading (Model) |
| • Fetch water temperature data | • External APIs |
| • Filter data by date range | • AuthMiddleware |
| • Validate temperature data | • Location Service |
| • Handle data export requests | • File System |
| • Aggregate temperature statistics | |

---

### 5. TemperatureReading Class

| **Class Name:** | TemperatureReading |
|-----------------|-------------------|
| **Parent Class:** | None |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Store temperature measurement data | • User (Model) |
| • Validate temperature values | • Location (Model) |
| • Store geographic coordinates | • WaterDataController |
| • Track measurement timestamp | • MongoDB |
| • Associate readings with users | |
| • Handle unit conversions (C/F) | |

---

### 6. AuthMiddleware Class

| **Class Name:** | AuthMiddleware |
|-----------------|----------------|
| **Parent Class:** | None |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Verify JWT tokens | • UserController |
| • Protect authenticated routes | • JWT Library |
| • Extract user information from tokens | • Express.js |
| • Handle authentication errors | |
| • Manage token expiration | |

---

### 7. LoginForm Class

| **Class Name:** | LoginForm |
|-----------------|-----------|
| **Parent Class:** | React.Component |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Render login/registration interface | • API Client |
| • Handle form validation | • UserController |
| • Manage form state | • React State |
| • Submit authentication requests | • Local Storage |
| • Display error messages | |
| • Handle successful authentication | |

---

### 8. APIClient Class

| **Class Name:** | APIClient |
|-----------------|-----------|
| **Parent Class:** | None |
| **Subclasses:** | None |

| **Responsibilities** | **Collaborators** |
|---------------------|-------------------|
| • Make HTTP requests to backend | • UserController |
| • Handle API authentication | • WaterDataController |
| • Parse JSON responses | • Error Handler |
| • Manage API endpoints | • Local Storage |
| • Handle request/response errors | |
| • Manage request headers | |

---

## System Interactions and Assumptions

### Operating System Requirements
- **Server Environment**: Linux (Ubuntu 20.04+) or Windows Server
- **Development Environment**: Windows, macOS, or Linux
- **Client Environment**: Any modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Database System
- **Primary Database**: MongoDB 5.0+
- **Connection**: Mongoose ODM for schema validation and queries
- **Hosting**: MongoDB Atlas (cloud) or local MongoDB instance
- **Backup Strategy**: Automated daily backups with 30-day retention

### External Dependencies
- **Mapping Service**: Leaflet.js with OpenStreetMap tiles
- **Dark Theme Tiles**: MapTiler API
- **Water Data**: OpenWater API integration
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: BCrypt hashing

### Compiler/Runtime Assumptions
- **Node.js**: Version 18.0+ (LTS)
- **NPM**: Version 8.0+
- **Browser Compatibility**: ES6+ support required
- **Build Tools**: Next.js built-in compiler, Webpack

### Network Assumptions
- **Internet Connectivity**: Required for map tiles and external APIs
- **HTTPS**: All production traffic encrypted
- **API Rate Limits**: OpenWater API limits respected
- **Mobile Data**: Optimized for mobile data usage

### Performance Assumptions
- **Response Time**: API responses under 2 seconds
- **Concurrent Users**: Support for 100+ simultaneous users
- **Data Volume**: Handle 10,000+ temperature readings
- **Map Performance**: Smooth interaction on mobile devices

---

## Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.3.3 | React framework with SSR/SSG |
| React | 18.3.1 | UI component library |
| Leaflet | 1.9.4 | Interactive maps |
| TailwindCSS | 4.x | Utility-first CSS framework |
| ESLint | 9.x | Code linting and formatting |

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18.2 | Web application framework |
| MongoDB | 5.0+ | NoSQL database |
| Mongoose | 7.5.0 | MongoDB object modeling |
| JWT | 9.0.2 | Authentication tokens |
| BCrypt | 5.1.1 | Password hashing |
| CORS | 2.8.5 | Cross-origin resource sharing |

### Development Tools
| Tool | Purpose |
|------|---------|
| Nodemon | Backend hot reloading |
| Jest | Unit testing framework |
| Git | Version control |
| VS Code | Development environment |

---

## Database Design

### User Collection Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, validated),
  password: String (bcrypt hashed),
  firstName: String (max 50 chars),
  lastName: String (max 50 chars),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### TemperatureReading Collection Schema (Planned)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  temperature: Number (required),
  unit: String (enum: ['C', 'F']),
  location: {
    type: String (default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  locationName: String,
  timestamp: Date (default: now),
  verified: Boolean (default: false),
  source: String (enum: ['user', 'api', 'bulk']),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- **User Collection**: `username`, `email`
- **TemperatureReading Collection**: `location` (2dsphere), `timestamp`, `userId`

---

## API Design

### Authentication Endpoints
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | User registration | `{username, email, password, firstName, lastName}` |
| POST | `/api/auth/login` | User login | `{username/email, password}` |
| GET | `/api/auth/profile` | Get user profile | Headers: `Authorization: Bearer <token>` |
| PUT | `/api/auth/profile` | Update user profile | `{firstName, lastName}` |

### Water Data Endpoints (Planned)
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/water-data` | Get temperature readings | `?lat=&lng=&radius=&startDate=&endDate=` |
| POST | `/api/water-data` | Submit temperature reading | `{temperature, unit, coordinates, locationName}` |
| GET | `/api/water-data/export` | Export data as CSV/JSON | `?format=&startDate=&endDate=` |

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": "Error description",
  "details": [...] // validation errors if applicable
}
```

---

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 24-hour expiration
- **Password Security**: BCrypt with 12 salt rounds
- **Route Protection**: Middleware-based authentication for protected endpoints
- **Input Validation**: Express-validator for all user inputs

### Data Security
- **HTTPS Only**: All production traffic encrypted
- **CORS Configuration**: Restricted to allowed origins
- **SQL Injection Prevention**: Mongoose ODM provides built-in protection
- **XSS Prevention**: Input sanitization and CSP headers

### Privacy Considerations
- **Location Data**: User consent required for geolocation
- **Data Retention**: Configurable data retention policies
- **User Rights**: Account deletion and data export capabilities
- **GDPR Compliance**: Privacy policy and data handling procedures

### Infrastructure Security
- **Environment Variables**: Sensitive data stored in environment variables
- **Database Security**: MongoDB authentication and network restrictions
- **Rate Limiting**: API rate limiting to prevent abuse
- **Logging**: Security event logging for monitoring

---

## Conclusion

This system design document outlines the architecture for GLOW's Sprint 1 implementation, focusing on core functionality including user authentication, map-based visualization, and the foundation for water temperature data management. The modular architecture ensures scalability and maintainability while the chosen technology stack provides modern development practices and robust performance.

The CRC cards demonstrate clear separation of responsibilities between classes, enabling parallel development and easier testing. The three-tier architecture provides flexibility for future enhancements while maintaining system integrity and performance.

Future sprints will expand upon this foundation to include advanced features such as data analytics, bulk uploads, gamification elements, and enhanced mobile optimizations.