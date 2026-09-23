# MoveMate – Real-Time Campus Shuttle Tracking System

## 1. Project Overview

**MoveMate** is a real-time campus shuttle tracking system designed to help students conveniently locate and track campus shuttles as they move around the university campus.

Students often have difficulty knowing where a shuttle is, when it will arrive at a particular stop, or whether they should continue waiting or make alternative transportation arrangements. MoveMate aims to solve this problem by providing students with a simple and user-friendly platform where they can view available campus shuttles and monitor their movements in real time.

The system will provide a digital solution for campus transportation by displaying shuttle locations, routes, designated stops, and other important transportation information.

The main goal of MoveMate is to make campus transportation **more predictable, convenient, accessible, and efficient for students**.

---

## 2. Problem Statement

Campus transportation can sometimes be difficult to predict. Students may spend a considerable amount of time waiting at shuttle stops without knowing where the shuttle currently is or how long it may take to arrive.

Some of the challenges students may face include:

* Not knowing the current location of a shuttle.
* Waiting for long periods without knowing the estimated arrival time.
* Not knowing which shuttle is currently operating on a particular route.
* Difficulty identifying available shuttle routes and stops.
* Lack of real-time information about campus transportation.
* Students arriving late for lectures or other activities because they cannot accurately estimate shuttle arrival times.

MoveMate is intended to address these problems by creating a centralized platform where students can access useful shuttle information.

---

# 3. Aim of the Project

The main aim of MoveMate is to develop a real-time shuttle tracking system that enables students to monitor campus shuttle locations and movement.

The system will provide students with transportation information in a convenient and understandable way, allowing them to make better decisions about when and where to catch a shuttle.

---

# 4. Project Objectives

The objectives of MoveMate are to:

1. Develop a responsive web application for campus shuttle tracking.
2. Allow students to view available campus shuttle routes.
3. Display shuttle locations on a map.
4. Allow students to track shuttle movement in real time.
5. Provide information about shuttle stops.
6. Provide estimated shuttle arrival information where possible.
7. Allow students to create accounts and log into the system.
8. Provide a simple and user-friendly interface.
9. Provide contact and support information for users.
10. Create a system that can be expanded in the future to support more campus transportation features.

---

# 5. Target Users

The primary users of MoveMate will be students who depend on campus shuttle services.

Other possible users include:

### Students

Students will be able to:

* View shuttle locations.
* View shuttle routes.
* Identify nearby shuttle stops.
* Track shuttle movement.
* Check available transportation information.
* Create and manage their accounts.

### Shuttle Drivers

In future versions of the system, drivers may be provided with a dedicated interface through which their shuttle's location can be transmitted to the system.

### Transport Administrators

Transport administrators may eventually be able to:

* Add and manage shuttle vehicles.
* Create and update shuttle routes.
* Manage shuttle stops.
* Monitor active shuttles.
* Manage drivers.
* View transportation activity.

---

# 6. Main Features

## 6.1 Home/Landing Page

The landing page will introduce users to MoveMate and explain the purpose of the system.

The page will contain:

* MoveMate logo/name.
* Navigation bar.
* Introduction to the system.
* Short explanation of the problem MoveMate solves.
* Call-to-action buttons.
* Information about how the system works.
* Featured shuttle tracking functionality.
* Footer containing important links and contact information.

The landing page should immediately communicate the purpose of MoveMate to a new visitor.

---

## 6.2 User Registration / Sign Up

New users will be able to create an account.

The sign-up form may contain:

* Full name.
* Email address.
* Password.
* Password confirmation.

User registration will allow the system to identify users and provide personalized functionality where necessary.

---

## 6.3 Login Page

Existing users will be able to securely log into their MoveMate account.

The login page will contain:

* Email field.
* Password field.
* Login button.
* Link to the sign-up page.

Authentication may later be connected to a backend authentication service.

---

# 7. Shuttle Tracking

The core feature of MoveMate will be the shuttle tracking functionality.

The system is expected to display the current location of active shuttles on a digital map.

A student should be able to:

1. Open MoveMate.
2. Access the shuttle tracking section.
3. View available shuttles.
4. Select a shuttle or route.
5. View its current location.
6. Observe its movement along the designated route.
7. Identify nearby stops.
8. Use the information to decide where and when to wait for the shuttle.

The tracking system is intended to operate in real time when connected to an appropriate location data source.

---

# 8. Real-Time Tracking Concept

The real-time tracking functionality will require a source of location information.

In a complete implementation, each active shuttle could periodically transmit its GPS coordinates to the system.

The general process would be:

**Shuttle GPS → Backend/Database → MoveMate Web Application → Student**

For example:

1. A shuttle moves around campus.
2. A GPS-enabled device provides the shuttle's location.
3. The location information is sent to the backend.
4. The backend stores or updates the shuttle's current coordinates.
5. MoveMate retrieves the latest location.
6. The student's map updates to show the shuttle's current position.

This architecture will allow the project to be expanded from a frontend prototype into a complete real-time transportation system.

---

# 9. About Page

The About page will explain the purpose and motivation behind MoveMate.

It will include:

* What MoveMate is.
* The problem the project addresses.
* The project's objectives.
* How MoveMate can improve campus transportation.
* The project's vision for the future.

The page will help users understand why the system was developed.

---

# 10. Contact Us Page

The Contact Us page will provide a way for users to communicate with the MoveMate team.

It may contain a contact form with:

* Name.
* Email address.
* Subject.
* Message.
* Submit button.

It may also provide additional contact information where applicable.

---

# 11. Navigation Bar

The navigation bar will provide access to the major sections of the application.

Possible navigation links include:

* Home
* Track Shuttle
* About
* Contact
* Login
* Sign Up

After authentication, the navigation can be modified to display user-related options.

The navigation bar will also be responsive so that it works properly on mobile devices.

---

# 12. Footer

The footer will appear at the bottom of the main pages.

It may contain:

* MoveMate name/logo.
* Short description.
* Navigation links.
* Contact information.
* Social media links where applicable.
* Copyright information.

---

# 13. Forms

Forms will be an important part of the MoveMate application.

Forms will be used for:

* User registration.
* User login.
* Contacting the MoveMate team.
* Future feedback functionality.
* Future administrative functions.

Forms should include appropriate validation to ensure that users provide valid information.

---

# 14. Proposed Technology Stack

The initial frontend of MoveMate will be developed using modern web technologies.

### Frontend

* **React.js** – Used to build the user interface.
* **Vite** – Used as the development and build tool.
* **Tailwind CSS** – Used for responsive and modern styling.
* **React Router DOM** – Used for navigation between different pages.
* **JavaScript** – Used for application logic and interactivity.

### Possible Future Backend

A backend will be required for the complete real-time tracking system.

Possible technologies include:

* Firebase
* Node.js
* Express.js
* A real-time database
* GPS/location services

The final backend technology will depend on the requirements of the completed system.

---

# 15. React Router DOM

MoveMate uses **React Router DOM** to manage navigation between different pages within the React application.

React Router DOM allows the application to display different components based on the URL without requiring the entire website to reload.

For example:

* `/` → Home page
* `/about` → About page
* `/contact` → Contact page
* `/login` → Login page
* `/signup` → Sign Up page
* `/track` → Shuttle tracking page

This makes the React application behave like a multi-page website while maintaining the advantages of a single-page application.

---

# 16. Project Structure

The project will be organized into reusable components and pages.

A possible structure is:

```text
move_mate/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   └── Form/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── Login/
│   │   ├── Signup/
│   │   └── TrackShuttle/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── README.md
└── vite.config.js
```

The use of reusable components will make the application easier to maintain and expand.

---

# 17. Expected System Operation

The expected operation of MoveMate can be divided into several stages.

### Stage 1 – Accessing the Website

A student opens the MoveMate website.

The landing page introduces the student to the system and provides access to the main features.

### Stage 2 – Viewing Shuttle Information

The student can access the shuttle tracking section to view available routes, stops, and active shuttles.

### Stage 3 – Tracking a Shuttle

The student selects a shuttle or route.

The system displays the shuttle's latest location on a map.

### Stage 4 – Monitoring Movement

The student can monitor the shuttle as its location changes.

### Stage 5 – Making a Transportation Decision

Using the information provided by MoveMate, the student can determine whether to wait for the shuttle at a particular stop or make another transportation decision.

---

# 18. Future Improvements

MoveMate is designed to be expandable.

Possible future features include:

### Push Notifications

Students could receive notifications when a shuttle is approaching their selected stop.

### Estimated Time of Arrival

The system could calculate an estimated arrival time based on:

* Current shuttle location.
* Distance to the stop.
* Route.
* Historical travel time.
* Traffic or campus conditions.

### Multiple Shuttle Tracking

Students could view multiple active shuttles simultaneously.

### Route Information

The application could display complete shuttle routes and stops.

### Driver Interface

Drivers could have an interface for activating their shuttle tracking session.

### Administrator Dashboard

Transport administrators could manage:

* Drivers.
* Shuttles.
* Routes.
* Stops.
* Users.

### Feedback and Reporting

Students could report transportation issues and provide feedback.

### Shuttle Capacity Information

Future versions could potentially provide information about whether a shuttle is full or has available space.

---

# 19. Security Considerations

Security will be considered as the project develops.

Possible security measures include:

* Secure user authentication.
* Password protection.
* Form validation.
* Protected user information.
* Appropriate database security rules.
* Authorization for administrative features.
* Secure communication between the frontend and backend.

Sensitive information should not be exposed publicly.

---

# 20. Responsive Design

MoveMate will be designed to work across different screen sizes.

The application should provide a good experience on:

* Mobile phones.
* Tablets.
* Laptops.
* Desktop computers.

Responsive design is particularly important because students will most likely access the shuttle tracking system from their mobile phones while moving around campus.

---

# 21. Project Feasibility

MoveMate is technically feasible because modern web technologies can communicate with real-time databases and location services.

The initial version will focus on building the frontend interface and demonstrating the main user experience.

The project can then be extended by connecting the frontend to a backend service capable of receiving and updating shuttle location data.

A GPS-enabled device associated with each shuttle would provide location coordinates. These coordinates could then be sent to the backend at regular intervals.

The frontend would retrieve the updated information and display the shuttle's location to students.

This allows the project to be developed progressively rather than requiring the entire system to be completed at once.

---

# 22. Development Approach

The project will be developed in stages.

### Phase 1 – Project Setup

* Create the React project using Vite.
* Install required dependencies.
* Configure Tailwind CSS.
* Configure React Router DOM.
* Set up Git and GitHub.

### Phase 2 – User Interface

Develop:

* Landing page.
* Navigation bar.
* Footer.
* Login page.
* Sign-up page.
* About page.
* Contact page.

### Phase 3 – Shuttle Tracking Interface

Develop:

* Tracking page.
* Shuttle display.
* Route display.
* Map interface.
* Shuttle markers.

### Phase 4 – Backend Integration

Connect the application to a backend and database.

Implement:

* User authentication.
* Shuttle information.
* Route information.
* Shuttle location updates.

### Phase 5 – Real-Time Functionality

Implement the communication required to update shuttle locations in real time.

### Phase 6 – Testing and Improvement

Test:

* Navigation.
* Forms.
* Authentication.
* Responsive design.
* Shuttle tracking.
* Database communication.
* Error handling.

---

# 23. Expected Benefits

MoveMate is expected to provide several benefits to students and campus transportation management.

### For Students

* Less uncertainty while waiting for shuttles.
* Easier access to shuttle information.
* Better transportation planning.
* Reduced unnecessary waiting.
* Convenient access through mobile devices.

### For Transportation Management

* Better visibility of active shuttles.
* Potentially improved monitoring of shuttle operations.
* Centralized transportation information.
* Possibility of analyzing shuttle activity in the future.

---

# 24. Conclusion

MoveMate is a proposed real-time campus shuttle tracking system designed to improve the way students interact with campus transportation.

The project will begin as a React-based web application containing the main user interfaces, including the home page, login page, sign-up page, about page, contact page, navigation bar, footer, and forms.

The project will then be expanded toward its main objective: allowing students to view and monitor the locations of campus shuttles in real time.

By combining React, Vite, Tailwind CSS, React Router DOM, and a suitable backend and real-time data service, MoveMate can evolve into a practical transportation solution for university campuses.

The long-term vision is to provide students with reliable transportation information at their fingertips, helping them spend less time waiting and make better decisions about their movement around campus.



1. Passing Data with `useNavigate`
In React Router (v6+), you can pass custom data dynamically when navigating between routes using the state
option inside the useNavigate hook. To retrieve the data on the destination component, use the useLocation
hook.
Code Example:
Source Component ( Home.jsx ):
import { useNavigate } from 'react-router-dom';
function Home() {
const navigate = useNavigate();
const handleNavigate = () => {
// Pass custom data inside the 'state' key
navigate('/profile', { state: { userId: 101, username: 'Alex' } });
};
return <button onClick={handleNavigate}>Go to Profile</button>;
}
Destination Component ( Profile.jsx ):
import { useLocation } from 'react-router-dom';
function Profile() {
const location = useLocation();
// Access data from location.state (use fallback to avoid errors)
const { userId, username } = location.state || {};
return (
<div>
<h1>User Profile</h1>
<p>User ID: {userId}</p>
<p>Username: {username}</p>
</div>
);
}

Page 1 of 4

2. How a Component Changes State
State represents internal data managed inside a component that changes over time. Whenever state updates,
React automatically triggers a re-render to reflect the updated state in the UI.
In functional components, state is created using the useState hook. State should never be updated directly
(e.g., count = 5 ); it must always be changed using its dedicated setter function.
Code Example:
import { useState } from 'react';
function Counter() {
// Declare state variable (count) and setter function (setCount)
const [count, setCount] = useState(0);
const increment = () => {
// Change state using setter function
setCount(count + 1);
};
return (
<div>
<p>Current Count: {count}</p>
<button onClick={increment}>Increment</button>
</div>
);
}

Page 2 of 4

3. Mounting and Unmounting (Shows and Goes Away)
Mounting: The phase when a component is created and inserted into the browser DOM for the first time.
Unmounting: The phase when a component is removed from the browser DOM.
Side effects (e.g., event listeners, timers, API calls) and cleanups are managed using the useEffect hook.
Returning a function from useEffect specifies the cleanup logic that executes when the component unmounts.
Code Example:
import { useState, useEffect } from 'react';
function Timer() {
useEffect(() => {
// Code runs on MOUNT
console.log('Component mounted: Timer started.');
const timerId = setInterval(() => {
console.log('Tick...');
}, 1000);
// Cleanup function runs on UNMOUNT
return () => {
console.log('Component unmounted: Timer stopped.');
clearInterval(timerId);
};
}, []); // Empty dependency array ensures this runs once
return <div>Timer is active</div>;
}
•
•

Page 3 of 4

4. Things That Trigger Re-Renders
A re-render occurs when React calls your component function again to compute the updated HTML layout. The
three main triggers are:
Trigger A: State Change
Updating local state via a setter function causes that component to re-render.
const [isOn, setIsOn] = useState(false);
// Calling setIsOn triggers a re-render
return <button onClick={() => setIsOn(!isOn)}>{isOn ? 'ON' : 'OFF'}</button>;
Trigger B: Props Change
When a parent component passes new prop values to a child, the child re-renders to display updated data.
function StatusDisplay({ status }) {
// Re-renders whenever the 'status' prop changes
return <p>Status: {status}</p>;
}
Trigger C: Parent Component Re-Render
When a parent component re-renders, all child components re-render automatically by default.
function Parent() {
const [count, setCount] = useState(0);
return (
<div>
<button onClick={() => setCount(count + 1)}>Count: {count}</button>
<ChildComponent /> <-- Re-renders when Parent re-renders
</div
);
}
Email: admin@movemate.local
Pa:Admin@12345