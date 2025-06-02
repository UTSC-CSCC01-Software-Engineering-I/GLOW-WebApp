[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/RwYFkG2A)
# GLOW by Microsofties

## Project Overview

GLOW is a web application developed by the Microsofties team for CSCC01. This project is built using Next.js, a React-based framework that provides server-side rendering and modern web development capabilities.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installation

### Prerequisites
- Install Node.js from https://nodejs.org/ (choose the LTS version)
- Ensure you have Git installed for version control

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd c01s25-project-microsofties
   ```

2. **Navigate to the application directory:**
   ```bash
   cd glow-microsofties
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **View the application:**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

### Commit Guidelines

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

### Project Management

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


