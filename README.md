[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/RwYFkG2A)
# GLOW by Microsofties
## Landing Page


## Project Overview

GLOW is a full-stack web application developed by the Microsofties team for CSCC01. This project is an **interactive water data visualization platform** that displays real-time water temperature and quality data on an interactive map interface. The application demonstrates a complete **Model-View-Controller (MVC)** architecture with modern web technologies.

## Key Features

### 🗺️ **Interactive Map Interface** 
- Real-time water temperature markers with custom pinpoint-style displays
- Dynamic light/dark theme switching for map tiles
- Custom HUD (Heads-Up Display) components for enhanced user experience
- Responsive design for desktop and mobile devices

### 📊 **Water Data Visualization**
- Integration with OpenWater API for live water quality data
- Temperature markers with speech bubble-style backgrounds
- Interactive popups with detailed location information
- Real-time data fetching and display

### 🎨 **Modern UI Components**
- Floating menu system with customizable positioning
- Multiple HUD components (Login, Navigation, Data Points, Settings)
- Theme-aware styling with automatic dark/light mode detection
- Loading screens with branded animations

## Technical Architecture

### MVC Pattern Implementation

Our application follows the **Model-View-Controller (MVC)** architectural pattern to ensure separation of concerns and maintainable code:

#### **Model (Data Layer)**
- **Location**: `backend/src/models/`
- **Technology**: MongoDB with Mongoose ODM + External API Integration
- **Purpose**: Defines data structure, validation rules, and database interactions
- **Data Sources**: 
  - User data and authentication (MongoDB)
  - Water quality data (OpenWater API integration)
- **Example**: `User.js` - Handles user authentication, profile management, and data validation

#### **View (Presentation Layer)**
- **Location**: `frontend/src/` (Frontend)
- **Technology**: Next.js with React components, Leaflet.js for mapping
- **Purpose**: Interactive user interface with map visualization and HUD components
- **Key Components**:
  - `MapComponent.jsx` - Interactive Leaflet map with water data markers
  - `MapView.jsx` - Main map container with dynamic loading
  - `HUD*.jsx` - Various heads-up display components (Login, Settings, Navigation)
  - `FloatingMenu.jsx` - Reusable floating menu system
- **Features**: Responsive design, dynamic theming, real-time data visualization

#### **Controller (Business Logic)**
- **Location**: `backend/src/controllers/`
- **Technology**: Express.js with middleware + External API orchestration
- **Purpose**: Handles HTTP requests, processes business logic, and coordinates between Model, View, and external APIs
- **Examples**: 
  - `userController.js` - Manages user registration, login, profile updates
  - `waterDataController.js` - Fetches and processes water quality data from external APIs

### Frontend-Backend Connectivity

#### **Frontend (Next.js)**
- **Framework**: Next.js 15.3.3 with React 19
- **Mapping**: Leaflet.js for interactive map functionality
- **Styling**: Custom CSS with theme-aware components
- **Key Libraries**: 
  - Leaflet.js for interactive maps
  - Dynamic imports for SSR compatibility
  - Custom HUD component system
- **API Integration**: Custom API utility functions for seamless backend communication
- **Location**: `frontend/`

#### **Backend (Express.js)**
- **Framework**: Express.js with RESTful API design
- **Database**: MongoDB with Mongoose for user data modeling
- **External APIs**: OpenWater API integration for real-time water data
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions
- **Middleware**: CORS, validation, error handling, and authentication middleware
- **Location**: `backend/`

#### **API Communication**
- **Protocol**: RESTful HTTP APIs + External API integration
- **Data Sources**: 
  - Internal: User authentication, preferences (MongoDB)
  - External: Water quality data (OpenWater API)
- **Data Format**: JSON
- **Authentication**: Bearer token authentication for user endpoints
- **Endpoints**: Organized in routes directory with proper validation

## Directory Structure

```
c01s25-project-microsofties/
├── README.md                          # This file
├── team.md                           # Team information
├── doc/                              # Project documentation
│   └── sprint0/                      # Sprint 0 deliverables
├── backend/                         # Backend server (Express.js)
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment configuration template
│   └── src/
│       ├── app.js                   # Main server file
│       ├── config/
│       │   └── database.js          # Database connection
│       ├── models/
│       │   └── User.js              # User data model (M in MVC)
│       ├── controllers/
│       │   ├── userController.js    # User business logic (C in MVC)
│       │   └── waterDataController.js # Water data API controller (C in MVC)
│       ├── routes/
│       │   ├── authRoutes.js        # Authentication API routes
│       │   └── waterDataRoute.js    # Water data API routes
│       └── middleware/
│           └── authMiddleware.js    # Authentication middleware
└── frontend/                        # Frontend application (Next.js)
    ├── package.json                 # Frontend dependencies
    ├── src/
    │   ├── app/
    │   │   ├── page.js              # Main page (V in MVC)
    │   │   ├── layout.js            # App layout
    │   │   └── default/
    │   │       └── page.js          # Default route page
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── LoginForm.js     # Login component (V in MVC)
    │   │   ├── MapComponent.jsx     # Main map component with Leaflet
    │   │   ├── MapView.jsx          # Map container with dynamic loading
    │   │   ├── FloatingMenu.jsx     # Reusable floating menu system
    │   │   ├── HUDright.jsx         # Right-side HUD with theme toggle
    │   │   ├── HUDlogin.jsx         # Login HUD component
    │   │   ├── HUDleft.jsx          # Left-side HUD component
    │   │   ├── HUDleftPoints.jsx    # Points display HUD
    │   │   ├── HUDadd.jsx           # Add data HUD component
    │   │   └── HUDloading.jsx       # Loading screen component
    │   ├── styles/
    │   │   └── MapView.css          # Map and marker styling
    │   └── lib/
    │       └── api.js               # API communication utilities
    └── public/                      # Static assets
```

## Installation & Setup

### Prerequisites
- **Node.js** (LTS version) - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **OpenWater API Key** - Required for water data functionality
- **Git** - For version control

### Quick Start (Development Environment)

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd c01s25-project-microsofties
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file with your database connection and JWT secret

# Start backend development server
npm run dev
```
**Backend will run on**: `http://localhost:5000`

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```
**Frontend will run on**: `http://localhost:3000`

#### 4. Database Setup
- **Option 1**: Install MongoDB locally and ensure it's running on default port (27017)
- **Option 2**: Use MongoDB Atlas (cloud) and update the `MONGODB_URI` in your `.env` file

### Testing the Application Features

1. **Start both servers** (backend on port 5000, frontend on port 3000)
2. **Open browser** to `http://localhost:3000`
3. **Interactive Map Features**:
   - View real-time water temperature markers on the map
   - Click markers to see detailed information popups
   - Use theme toggle button (☀️/🌙) in the top-right HUD to switch between light/dark map themes
   - Test responsive design on different screen sizes
4. **API Integration**:
   - Check backend health at `http://localhost:5000/api/health`
   - Test water data endpoint at `http://localhost:5000/api/water-data`
5. **User Authentication** (if implemented):
   - Use the login components to test frontend-backend user authentication

### Environment Variables

Create a `.env` file in `backend/` based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/glow_dev

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS
FRONTEND_URL=http://localhost:3000

# External APIs
OPENWATER_API_KEY=your_openwater_api_key_here
```

## Application Architecture & Data Flow

### Water Data Visualization Flow

1. **Frontend Request**: User loads the map interface
2. **Backend API Call**: Frontend requests water data from `/api/water-data`
3. **External API Integration**: Backend fetches real-time data from OpenWater API
4. **Data Processing**: Backend processes and formats the water quality data
5. **Map Rendering**: Frontend receives data and renders custom markers on Leaflet map
6. **Interactive Display**: Users can interact with markers to view detailed information

### Theme System

- **Automatic Detection**: System detects user's preferred color scheme (light/dark)
- **Manual Toggle**: Users can manually switch themes using the HUD button
- **Map Integration**: Theme changes affect both UI components and map tile layers
- **Persistent State**: Theme preference maintained across user sessions

## Contribution Guidelines

### Version Control Strategy

We use **GitHub** for version control with a structured branching strategy to ensure code quality and team collaboration.

### Branching Strategy

Our project follows a **Git Flow-inspired** workflow with the following branch structure:

#### Main Branches:
- **`main`**: Production-ready code. **No one directly pushes to this branch.** Any PR to main requires consultation with all teammates.
- **`develop`**: Integration branch for features. You can merge directly if there are no conflicts, otherwise discuss in the group chat.

#### Feature Branches:
- **Format**: `feat/<teammate_name>/<feature_name>`
- **Example**: `feat/john/user-authentication`
- Each team member creates their own feature branch when working on new functionality.

#### Hotfix Branches:
- **Format**: `hotfix/<description>`
- Created when bugs are found in `develop` or `main` branches that need immediate fixes.

### Pull Request Workflow

1. **Create Feature Branch**: Start from `develop` and create your feature branch
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/<your_name>/<feature_name>
   ```

2. **Work on Feature**: Make your changes and commit regularly with meaningful messages

3. **Create Pull Request**: 
   - Create a PR from your feature branch into `develop`
   - **DO NOT merge the PR yourself**
   - Add a clear description of what the feature does
   - Request review from teammates

4. **Code Review**: Wait for team review and address any feedback

5. **Merge**: 
   - If no conflicts exist, you may merge directly into `develop`
   - If conflicts exist, discuss in the group chat before merging

## Commit Guidelines

- **Commit frequently** with meaningful messages
- Each commit should represent a logical unit of work
- Use clear, descriptive commit messages that explain what and why
- Examples of good commit messages:
  - `Add user login functionality`
  - `Fix navigation menu styling issue`
  - `Update API endpoint for user data`

### What to Commit / Not to Commit

#### ✅ DO Commit:
- Source code files
- Configuration files
- Documentation updates
- Package.json and package-lock.json

#### ❌ DON'T Commit:
- `node_modules/` directory
- `.env` files with sensitive information
- IDE-specific files (.vscode/, .idea/)
- Build artifacts
- Personal configuration files

## Project Management

#### Ticketing Tool: **Jira**
- All team members must update their progress on Jira
- Update tickets for:
  - Feature progress and status changes
  - Pull request creation and completion
  - New branch creation
  - Bug reports and fixes

#### Communication
- Use the group chat for:
  - Merge conflict discussions
  - Branch strategy questions
  - General project updates
- Update Jira tickets regularly to keep the team informed

### Getting Started with Contributions (for teammates)

1. **Set up your development environment** following the installation instructions above
2. **Create your feature branch** using the naming convention
3. **Update your Jira ticket** to "In Progress"
4. **Make your changes** with frequent, meaningful commits
5. **Create a pull request** when your feature is complete
6. **Update Jira** with PR information and current status


