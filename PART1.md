Project Description

The project is a well-defined and achievable SaaS task management application. It focuses on allowing users to organize projects and tasks efficiently. The scope is realistic for the course timeline while still covering all required functionalities.

The application implements full CRUD operations:
	•	Create tasks and projects
	•	Read and display task/project data
	•	Update task details (e.g., status, due date)
	•	Delete tasks and projects

This ensures the project meets the core requirements of a modern web application.



Database Design

The database is designed using a relational structure with three main entities: User, Project, and Task. Each table includes clearly defined primary keys and appropriate foreign key relationships.

Key design considerations:
	•	The User table includes a role field to support role-based access control
	•	Relationships ensure data integrity (e.g., tasks belong to projects, projects belong to users)
	•	The schema supports scalability and future feature expansion

Overall, the database design accurately models the application’s data and supports all required operations.



Role Definition

The application defines two distinct user roles with clear permissions:

Admin:
	•	Full CRUD access to all resources (users, projects, tasks)
	•	Ability to manage users and system data

User:
	•	Can create, read, update, and delete their own content
	•	Cannot modify or access other users’ private data

This clear separation of responsibilities ensures proper implementation of role-based access control.



Planning Thoroughness

The project includes a comprehensive plan covering both frontend and backend structure:
	•	A complete list of pages (Home, Login, Register, Dashboard, Project Details, Admin Panel)
	•	Clearly defined API endpoints for all CRUD operations
	•	Explicit mapping between pages and required endpoints
	•	Authentication and authorization requirements specified for each endpoint

Additionally, role restrictions are clearly identified, ensuring that access control is consistently enforced across the application.



UX States Planning

All data-fetching pages include proper UX state handling:
	•	Loading state: Displays a spinner or skeleton UI while data is being fetched
	•	Error state: Shows a user-friendly error message with a retry option
	•	Empty state: Provides meaningful feedback when no data is available

For user actions (such as creating or updating data), the UI includes loading indicators and error notifications (e.g., toast messages), ensuring a smooth and responsive user experience.