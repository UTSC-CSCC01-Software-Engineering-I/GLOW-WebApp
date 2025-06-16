**Release Plan**

### **Release Name:** Sprint 1 - Foundational Interface and Temperature Mapping

### **Release Objectives**
Goal of the sprint 1 is to establish the core functionality and data integration for the GLOW web application.

#### SMART goals
* Build a user friendly landing page and map interface
* Allow users to explore visually the water temperature at the specified ontario beaches.
* Implement user registration and login with working validation, by Sprint 1 demo, with error handling for incorrect input.
* Develop script to parse beach data from a API and load to the map UI within this iteration.

#### **Specific Goals**

* Build a user friendly landing page and map interface.
* Allow users to explore visually the water temperature at the specified ontario beaches.
* Implement user registration and login.
* Create a process for parsing and loading the beach data.

#### **Metrics for Measurement**

Login/registration: Users can register and/or login with error messages.
Beaches load automatically.
Beaches show the temperature data correctly.
Users can scroll and zoom in/out on the map.

### **Release Scope**
* Home Page Mockup (re-design)
    * Modify with UI light/dark mode toggle, and temperature display
* Landing Page
    * Map as landing page with light/dark mode toggle, and temperature display, add point button.
* Beach Temperature Display
    * Points showing temperature data for each beach
* User Authentication
    * Login pages with error checking
* Map Interface
    * Zoom/scroll
* Automated beach loading 
    * Process to parse and load location data

#### **Included Features**

* Display geolocated water temperature
    * Parse and load location data from  API into the system obtained
    * Points showing temperature data for each beach
    * Zoom/scroll on the map
    * Purpose: Users are able to look at the map and see the temperature of the beach they want to go to, to decide if it is good for swimming, and compare with other beaches.


#### **Excluded Features**

* Data uploaded by users: Requires user registration/login 
* Historical comparison: Requires historical data we don't have yet.
* Gamification: Priority 2
* Admin page: Not essential for initial interface

#### **Bug Fixes**

* Fix bug where the backend app does not connect to the database

#### **Non-Functional Requirements**

* Login/Registration: add users to database, feedback
* Ease of use: UI works smoothly

#### **Dependencies and Limitations**

* Node.js : Our runtime environment that allows JS to run outside a browser.
* MongoDB : This is our Database for all data-points, user data, and other information relevant to this project.
* ⁠OpenWaterApi: You will need a key for this to Fetch Beach Data and temperature
