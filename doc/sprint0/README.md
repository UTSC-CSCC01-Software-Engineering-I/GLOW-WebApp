[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/RwYFkG2A)
# GLOW by Microsofties

## Project Overview

GLOW is a full-stack web application developed by the Microsofties team for CSCC01. This project demonstrates a complete **Model-View-Controller (MVC)** architecture with modern web technologies.

## Technical Architecture

### MVC Pattern Implementation

Our application follows the **Model-View-Controller (MVC)** architectural pattern to ensure separation of concerns and maintainable code:

#### **Model (Data Layer)**
- **Location**: `backend/src/models/`
- **Technology**: MongoDB with Mongoose ODM
- **Purpose**: Defines data structure, validation rules, and database interactions
- **Example**: `User.js` - Handles user authentication, profile management, and data validation

#### **View (Presentation Layer)**
- **Location**: `frontend/src/` (Frontend)
- **Technology**: Next.js with React components
- **Purpose**: User interface, client-side rendering, and user interactions
- **Features**: Responsive design, dynamic content, form handling

#### **Controller (Business Logic)**
- **Location**: `backend/src/controllers/`
- **Technology**: Express.js with middleware
- **Purpose**: Handles HTTP requests, processes business logic, and coordinates between Model and View
- **Example**: `UserController.js` - Manages user registration, login, profile updates

### Frontend-Backend Connectivity

#### **Frontend (Next.js)**
- **Framework**: Next.js 15.3.3 with React 19
- **Styling**: Tailwind CSS for modern, responsive design
- **API Integration**: Custom API utility functions for seamless backend communication
- **Location**: `frontend/`

#### **Backend (Express.js)**
- **Framework**: Express.js with RESTful API design
- **Database**: MongoDB with Mongoose for data modeling
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions
- **Middleware**: CORS, validation, error handling, and authentication middleware
- **Location**: `backend/`

#### **API Communication**
- **Protocol**: RESTful HTTP APIs
- **Data Format**: JSON
- **Authentication**: Bearer token authentication
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
│       │   └── userController.js    # Business logic (C in MVC)
│       ├── routes/
│       │   └── authRoutes.js        # API route definitions
│       └── middleware/
│           └── authMiddleware.js    # Authentication middleware
└── frontend/                        # Frontend application (Next.js)
    ├── package.json                 # Frontend dependencies
    ├── src/
    │   ├── app/
    │   │   ├── page.js              # Main page (V in MVC)
    │   │   └── layout.js            # App layout
    │   ├── components/
    │   │   └── auth/
    │   │       └── LoginForm.js     # Login component (V in MVC)
    │   └── lib/
    │       └── api.js               # API communication utilities
    └── public/                      # Static assets
```

## Installation & Setup

### Prerequisites
- **Node.js** (LTS version) - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
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

### Testing the MVC Connectivity

1. **Start both servers** (backend on port 5000, frontend on port 3000)
2. **Open browser** to `http://localhost:3000`
3. **Use the login form** on the homepage to test frontend-backend communication
4. **Check backend health** at `http://localhost:5000/api/health`

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
```

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


