**Release Plan**

### **Release Name:** Sprint 3

### **Release Objectives**
Goal of the sprint 3 is to implement mobile interface, data integration for the GLOW web application and improving the UI, while adding more user friendly features.

#### SMART goals
* **Implemented a sort function**  
  By Sprint 3, implemented a sort function that provides user to sort beaches based on temperatures, improving user navigation and experience.

* **Improved API data fetching with MongoDB integration**  
  By Sprint 3, developed MongoDB server such that it also fetches the data from the API every 6 hours and store it in the local database resulting in improved loading times and reliability.

* **Updated temperature-based color coding for map points**  
  By Sprint 3, enhanced the map UI by updating the color-coding beach points according to water temperature ranges, enabling users to visually interpret water conditions at a glance.

* **Updated functionality of dynamic side panel to display beach data**  
  By Sprint 3, integrated a side panel that lists all available beaches along with their current water temperatures and clicking on a beach takes you to that point, resulting in improved data visibility and user accessibility.

* **Implemented a mobile interface**  
  By Sprint 3, added a mobile interface that retains all the features of the desktop version while displaying everything in a mobile friendly way.

* **Enabled logged-in users to add water data points**  
  By Sprint 3, developed a working "Add Point" page that allows authenticated users to submit new beach locations and associated data, which are then stored in MongoDB.

* **Implemented historical data graphs**  
  By Sprint 3, developed a working historical data graph that allows users to see the historical temperature data of a beach.

#### **Specific Goals**
1. Finalize and polish the beach sorting functionality to allow sorting by temperature (ascending/descending).
2. Ensure MongoDB server fetches data from OpenWaterApi every 6 hours and stores it reliably in the database.
3. Refine and finalize temperature-based color coding on map points for consistent visual interpretation.
4. Complete the implementation of a dynamic, clickable side panel listing all beaches with real-time temperatures.
5. Implement and test a fully responsive mobile interface that mirrors all desktop functionalities.
6. Ensure the "Add Point" page is functional for authenticated users with proper input validation and backend integration.
7. Implement historical temperature graph for each beach using stored time-series data in MongoDB.
8. Provide a toggle to switch temperature display units between Celsius and Fahrenheit.
9. Improve search functionality to include live, responsive autofill suggestions for beach names.

#### **Metrics for Measurement**
- Number of beach points successfully displayed and sorted in the side panel.
- MongoDB update success rate from OpenWaterApi (target: 100% per 6-hour interval).
- UI response time for search, toggle, and side panel clicks (target: < 500ms).
- Percentage of successful submissions via the “Add Point” page (tracked via server logs).
- Mobile compatibility score (based on responsiveness and usability testing).
- Number of unique users interacting with historical graph and temperature toggle.
- Manual validation of color coding accuracy across all beaches.
- Average response time of the search bar autofill suggestions (target: < 300ms).
- User authentication success rate for valid credentials (target: 100%).

### **Release Scope**

Sprint 3 focuses on enhancing usability and visual interactivity, expanding the platform's mobile responsiveness, and enabling full-circle contribution and exploration of water temperature data via a robust backend and frontend integration.

#### **Included Features**
- Beach sorting functionality by temperature.
- Scheduled data fetching from OpenWaterApi and storage in MongoDB every 6 hours.
- Temperature-based color-coded map points.
- Responsive, mobile-friendly interface with full feature parity.
- Side panel listing beaches and their current temperatures with clickable navigation.
- Search bar with reactive, autofill suggestions.
- Temperature unit toggle (Celsius/Fahrenheit).
- Secure "Add Point" form available to authenticated users.
- Interactive historical temperature graphs per beach.

#### **Excluded Features**
- Admin moderation or review of user-submitted beach entries.
- Password recovery, email verification, or profile management.
- Exporting, downloading, or sharing beach data.
- Advanced analytics (e.g., trend forecasting, anomaly detection).
- Push notifications or alerts.

#### **Bug Fixes**
- Fixed: Sorting behavior was incorrect when temperatures were missing or invalid.
- Fixed: Mobile interface was clipping map view and hiding beach controls.
- Fixed: MongoDB document mismatch during periodic API fetches.
- Fixed: Graph axis misalignment on temperature history charts.
- Fixed: Add Point form failing silently when location was undefined.
- Fixed: Autofill dropdown not closing when clicking outside search bar.

#### **Non-Functional Requirements**
- User data must be securely stored in MongoDB with hashed passwords (bcrypt).
- Backend must fetch and update OpenWaterApi data every 6 hours with logging.
- Average response time across all interactions should not exceed 500ms.
- Application must function seamlessly across Chrome, Firefox, Safari, and mobile browsers.
- Frontend must follow modular and maintainable patterns using React and Next.js.
- Code must be version-controlled using GitHub, with clean branching and commits.
- Deployment must use CI/CD pipelines to maintain consistent and tested builds.

#### **Dependencies and Limitations**
- **Node.js**: JavaScript runtime for backend logic and scheduling.
- **MongoDB**: Stores user data, beach points, temperature logs, and history.
- **OpenWaterApi**: External API to fetch updated beach temperature data.
- **Chart.js / Recharts**: Used for rendering historical temperature graphs.
- **Next.js**: Framework for SSR and routing, optimized for mobile support.
