# GLOW (Team name: Microsofties)

## Iteration 3 - Review & Retrospect

 * When: Sunday, July 6th, 2025
 * Where: 18 Gaslight Cres., Toronto (residence of the team members)

## Process - Reflection

#### Decisions that turned out well
List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

- In-person Scrum meetings: Regular in-person meetings (especially at 18 Gaslight) helped resolve blockers faster and build team cohesion. This led to more productive and open sessions.
- Rotating Peer Code Reviews: Rotating reviewers ensured that everyone engaged with different parts of the codebase and prevented knowledge silos. It also improved overall code quality by exposing each piece to more eyes.


#### Decisions that did not turn out as well as we hoped
Having flexible deadlines for everyone. This led to some work getting completed very quick and some had more delay than usual.


#### Planned changes


## Product - Review

#### Goals and/or tasks that were met/completed:
### Add Point Functionality  
![image](<https://github.com/user-attachments/assets/7e18c026-155c-43c0-a211-5b816f5cf518>)  
*We created a protected "Add Point" page that is only accessible to authenticated users. New beach locations and temperature data can be submitted and stored in MongoDB.*

---

### Side Panel with Beach Data  
![image](<https://github.com/user-attachments/assets/f15dfd99-b0af-4df0-a9d1-db15a948d8ea>)  
*A responsive side panel was added to display a full list of available beaches along with their live water temperatures. This panel dynamically updates based on fetched data.*

---

### Temperature Unit Toggle  
![image](<https://github.com/user-attachments/assets/09ba6836-85f6-4f21-896f-0d5ab8b37d3c>)  
*Users can now toggle between Celsius and Fahrenheit for water temperatures. This improves accessibility for users from different regions.*

---

### Color Coded Map Points  
![image](<https://github.com/user-attachments/assets/09ba6836-85f6-4f21-896f-0d5ab8b37d3c>)  
*Points on the map are now color-coded based on water temperature ranges, giving users quick visual cues about beach conditions.*

---

### Search Bar with Autofill  
![image](<https://github.com/user-attachments/assets/dfee3862-a8df-41d5-81f0-23dfcbb649b6>)  
*A working search bar was implemented that offers autofill suggestions as users type beach names. This speeds up navigation and enhances user experience.*

---

- **Made the sign up working in the backend so now the user data can be created and saved.
- **Add Point Page:** Built and connected a secure form for logged-in users to add beach points. Input is validated and stored in MongoDB.
- **Side Panel with Real-Time Data:** Implemented a scrollable, collapsible sidebar listing all available beaches and their temperature readings.
- **Color-Coded Visuals:** Enhanced map usability by visually encoding water temperature using a color scale.
- **Temperature Toggle Feature:** Developed a simple toggle switch for temperature units, with state syncing across the interface.
- **Improved Navigation:** Added a smart search bar that suggests beach names based on partial input, supporting faster interaction.

---


#### Goals and/or tasks that were planned but not met/completed:
Storing user generated points: We were not able to complete this due to some mongodb internal server issues that we have to resolve first.
Adding more functionality to the side panel: This was not completed because the side panel was fetching data twice at first so we had to focus on fixing that first.


## Meeting Highlights

Going into the next iteration, our main insights are:

* Managing Jira more efficiently and regularly. Currently we are not mainting jira regularly and that makes our progress graphs less uniform.
* Currently we are managing github well and using it well but we will be aiming to use github along side jira.
* Our work is being done on a regular basis and we will be aiming to update it regularly from now on as well.