**Release Plan**

### **Release Name:** Sprint 2

### **Release Objectives**
Goal of the sprint 2 is to polish the core functionality and data integration for the GLOW web application while adding more user friendly features.

#### SMART goals
* **Implemented a search bar with autofill suggestions**  
  By Sprint 2, implemented a responsive search bar on the homepage that provides autofill suggestions for available beaches, improving user navigation and experience.

* **Developed a working login and sign-up page with MongoDB integration**  
  By Sprint 2, created and deployed secure login and sign-up pages that store and retrieve user credentials in MongoDB to enable authenticated access to user-only features.

* **Added temperature-based color coding for map points**  
  By Sprint 2, enhanced the map UI by color-coding beach points according to water temperature ranges, enabling users to visually interpret water conditions at a glance.

* **Created a dynamic side panel to display beach data**  
  By Sprint 2, integrated a collapsible side panel that lists all available beaches along with their current water temperatures to improve data visibility and user accessibility.

* **Implemented a temperature unit toggle**  
  By Sprint 2, added a toggle button that allows users to switch between Celsius and Fahrenheit units, catering to regional preferences.

* **Enabled logged-in users to add beach points**  
  By Sprint 2, developed a working "Add Point" page that allows authenticated users to submit new beach locations and associated data, which are then stored in MongoDB.

#### **Specific Goals**
1. Implement a responsive, user-friendly search bar that provides live autofill suggestions as the user types beach names.
2. Create a secure user authentication system with login and sign-up functionality, integrating MongoDB to store and manage user data.
3. Visually enhance the map by using a color-coding system to represent different water temperature ranges for all beach points.
4. Build an interactive side panel that lists all available beaches and their current water temperatures, updating dynamically with data changes.
5. Provide a user interface toggle allowing users to switch between Celsius and Fahrenheit units for temperature display.
6. Design and implement a secure "Add Point" page, accessible only to logged-in users, to submit and store new beach data in the database.

#### **Metrics for Measurement**
* Number of beaches successfully displayed in the side panel and on the map.
* Average response time of the search bar autofill suggestions (target: < 300ms).
* User authentication success rate (target: 100% for valid credentials).
* Count of new beach points added by logged-in users.
* Percentage of users who interact with the temperature toggle (tracked via event logs).
* Color-coding accuracy of water temperature markers (manually validated).

### **Release Scope**
This release (Sprint 2) focuses on establishing the core functionality of the application, enabling users to search for, view, and contribute water temperature data for Great Lakes beaches. It includes foundational UI/UX components, basic interactivity, and secure user authentication.

#### **Included Features**
* Search bar with real-time autofill suggestions for beach names.
* Login and sign-up functionality with secure credential storage in MongoDB.
* Temperature-based color coding for map points.
* Side panel listing all available beaches and their current water temperatures.
* Temperature toggle switch between Celsius and Fahrenheit.
* “Add Point” page allowing authenticated users to submit new beach entries.

#### **Excluded Features**
* Admin moderation of user-submitted beach data.
* Historical water temperature graphs or data trends.
* User profile customization or password recovery.
* Mobile-optimized layout (in-progress for Sprint 3).

#### **Bug Fixes**
* Fixed: Beach points not appearing on map due to incorrect coordinate parsing.
* Fixed: Autofill not triggering on lowercase search input.
* Fixed: MongoDB schema mismatch causing login failures.
* Fixed: Temperature toggle not updating color coding immediately.
* Fixed: Side panel scroll issue when the beach list exceeded viewport height.

#### **Non-Functional Requirements**
* All user data must be securely stored in MongoDB using hashed credentials.
* App must respond to user actions (e.g., search, toggle) within 500ms.
* Web application must be functional across modern browsers (Chrome, Firefox, Safari).
* Codebase should follow modular and maintainable structure using React and Next.js.
* Deployment must use version-controlled environment with GitHub and Vercel (or equivalent).

#### **Dependencies and Limitations**

* Node.js : Our runtime environment that allows JS to run outside a browser.
* MongoDB : This is our Database for all data-points, user data, and other information relevant to this project.
* ⁠OpenWaterApi: You will need a key for this to Fetch Beach Data and temperature
