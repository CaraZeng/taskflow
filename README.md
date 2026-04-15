# CS-5610 Final Project

**Instructor:** Cristian Penarrieta

## Introduction

This final project is a comprehensive assignment designed to assess your mastery of web development concepts covered throughout the course. It is a significant undertaking that will require substantial time and dedication. Please read this document thoroughly before beginning and plan your schedule accordingly to ensure timely completion.

**Group Work:** You may work individually or in groups of up to 2 students.

**Important before beginning:** Regardless of whether you choose to work on the project individually or as part of a group, it is mandatory for everyone to sign up in the [Final Project Signup Sheet](https://docs.google.com/spreadsheets/d/1yYP5Qe6q7JScqJw6nz_YOydKbocOpHnacZ9sQO1o7kY/edit?usp=sharing). This step is crucial to ensure proper organization and tracking of project participants.

## Overall Project Description

You will develop a Software as a Service (SaaS) web application that performs CRUD (Create, Read, Update, Delete) operations. The application must be based on React, Node.js, Prisma, and implement authentication using token cookies as learned in class.

**Project Ideas:** Online store, food ordering system, personal journal, learning management system, social network, etc.

## Project Requirements

### 1. Security & Role-Based Access Control

- **Authentication:** Implement login and registration pages to allow users to create accounts and authenticate.
- **Role-Based Access Control:** Your application must support at least 2 user roles (e.g., admin and regular user):
  - **Admin users** can perform all CRUD operations (including managing other users' content)
  - **Regular users** have limited permissions (e.g., can only edit/delete their own content)
- **Access Control:** Some pages should be accessible to all users, while others should require authentication or specific roles.
- **Non-authenticated Users:** Can access general features (e.g., view products, read reviews).
- **Authenticated Users:** Required for actions needing user identity (e.g., bookmarking, commenting, adding to cart).
- **API Endpoints:** Must use the token cookie approach as taught in class. No other security mechanisms are allowed.

**Reference:** Week 9 Security - `requireAuth` middleware pattern

### 2. Code Project Structure

Organize your project with the following folder structure:

- **client folder:**
  - Contains all client-side code.
  - Must use React; no other frontend frameworks are allowed.
  - Include your unit tests here (see Testing section).
- **api folder:**
  - Contains your API and all CRUD endpoints.
  - Use Node.js and Prisma to connect to your database.
  - The prisma folder will be within the api folder.
- **accessibility_reports folder:**
  - Store your accessibility reports here (see Accessibility section).
- **PART1.md file:**
  - Contains your Part 1 planning deliverables (see Part 1 section).
  - Must be submitted before starting Part 2.
- **README.md file:**
  - Provide a project description and links to your deployed application.
  - Include any special instructions necessary for running or testing your project.

### 3. External API Integration

- **Requirement:** Your React application must integrate with an external Web API for read-only operations.
- **Examples:** Google Maps, IMDb, YouTube, Yelp, Weather Channel, etc.
- A good starting point is RapidAPI
- **Usage:** Fetch data based on user input or interaction (example: get weather data based on location).
- **Note:** Use free tiers only. If you exceed the free tier limits, ensure your code correctly demonstrates the integration.

### 4. User Experience (UX) Requirements

Every page that fetches data must implement proper UX states:

- **Loading State:** Display a loading spinner or skeleton while data is being fetched.
- **Error State:** Show a user-friendly error message with a retry button when requests fail.
- **Empty State:** Display a helpful message when no data exists (e.g., "No items found. Create your first item!").

**Reference:** Week 5 Web APIs - Loading States Pattern

### 5. Optimistic Updates

At least one mutation (create, update, or delete) must use the optimistic update pattern:

- Update the UI immediately before the API response arrives
- Rollback the UI if the API call fails
- Show a toast/notification on error

**Reference:** Quiz 05 - Optimistic Update Pattern

### 6. Pagination, Filtering, and Search

At least one list page must support:

- **Pagination:** Implement limit/offset or cursor-based pagination
- **Filtering:** Support at least one filter parameter (e.g., category, status, date range)
- **Search:** Implement search functionality with debouncing (300ms delay)

**Reference:** Quiz 06 (Prisma pagination) + Quiz 08 (debounced search)

### 7. Form Validation

All forms must implement validation on both sides:

- **Client-side validation:** Display helpful error messages as the user types
- **Server-side validation:** Always validate on the server (never trust the client)
- **Complex validation:** Include at least one complex validation (e.g., password strength, email format, date ranges, unique username check)

**Reference:** Quiz 03 (validation logic) + Week 9 Security

### 8. Dark Mode Toggle

Implement a theme toggle (light/dark) that:

- Uses CSS variables for theme colors
- Persists the user's preference in localStorage
- Respects `prefers-color-scheme` media query on first visit

**Reference:** Quiz 02 (CSS variables) + Quiz 07 (localStorage persistence)

### 9. Accessibility

- **Reports:** Include Lighthouse accessibility reports for three pages.
- **Minimum Score:** Each page must achieve a Lighthouse Accessibility score of 80 or above.
- **Tool:** Use Google Lighthouse
- **Submission:** Save the reports in a readable format (image, PDF, etc.) within the accessibility_reports folder.

**Reference:** Week 12 Accessibility

### 10. Testing

- **Unit Tests:** Implement at least three unit tests.
- Each test must target a different React component.
- Use React Testing Library for your tests.
- **Location:** Place all unit tests within the client folder.

**Reference:** Week 11 Testing

### 11. Responsive Design

- **Requirement:** Your web application must be responsive and usable on desktops, tablets, and phones.
- **Implementation:** Ensure that web pages adapt seamlessly to any browser width.

**Reference:** Week 10 Responsive Design

### 12. Deployment

- **Instructions:** Follow the deployment guidelines provided here
- **Components to Deploy:**
  - Database
  - API Server
  - Client Side
- **Documentation:** Provide deployment links in your README file.

---

## Project Parts

### Part 1: Project Planning

#### Deliverables:

1. **Project Description:**
   - A brief overview (maximum two paragraphs) of your project.
   - Outline intended functionalities and scope.
   - Must include at least one of each CRUD operation.

2. **Database Diagram:**
   - Include all tables with columns, primary keys (PK), and foreign keys (FK).
   - A minimum of three tables is required.
   - **Must include a `role` field** in your User table to support role-based access control.

3. **User Roles Definition:**
   - Define the roles your application will support (minimum 2 roles).
   - For each role, list the permissions/capabilities.
   - Example:
     - **Admin:** Can create, read, update, delete all content; can manage users
     - **User:** Can create own content, read all content, update/delete only own content

4. **Pages and Endpoints:**
   - **List of Pages:** Outline all pages you plan to build (e.g., homepage, profile page, details page).
   - **List of API Endpoints:** Specify all API endpoints you plan to implement.
   - **Endpoint Usage:** For each page, explain which API endpoints will be needed.
   - **Role Requirements:** Indicate which endpoints require authentication and which require specific roles.
   - No need to specify the external API requirements here yet.

5. **UX States Planning:**
   - For each page that fetches data, briefly describe how you will handle:
     - Loading state
     - Error state (with retry)
     - Empty state

#### Submission:

- Create a `PART1.md` file in the root of your project repository containing all the items above.
- Use proper Markdown formatting (headings, lists, tables, code blocks where appropriate).
- For the database diagram, you can include an image or use a text-based diagram (Mermaid, ASCII art, etc.).
- No code is required for this part, only the `PART1.md` file.

#### Grading Criteria (Total: 100 Points):

- **Project Description (15%):** The project is well-defined and achievable.
- **Database Design (25%):** Comprehensive and correctly models the application's data, includes role field.
- **Role Definition (15%):** Clear definition of roles and their permissions.
- **Planning Thoroughness (35%):** Detailed lists of pages and endpoints with role requirements.
- **UX States Planning (10%):** Thoughtful consideration of loading, error, and empty states.

---

### Part 2: Foundation Building

Now that you've defined your project requirements, begin coding the foundational elements.

#### Objectives:

**API Development (api Folder):**

- Set up your three tables using Prisma (User table must include a `role` field).
- Implement the following endpoints:
  - `/ping`: A simple endpoint to test API responsiveness.
  - **1 GET Endpoint:** Lists all items with basic pagination support (limit/offset query parameters).
  - **1 POST Endpoint:** Inserts one item (separate from the register endpoint). This must use the `requireAuth` middleware.
- **Authentication Endpoints:**
  - `/login` - Returns user data including role
  - `/register` - Creates user with default role (e.g., "user")
  - `/logout`
- **Middleware:**
  - `requireAuth`: Checks for the token cookie and returns a 401 error if the token is invalid.
  - `requireRole(role)`: Checks if the authenticated user has the required role, returns 403 if not.
- **Server-side Validation:** Implement validation for the POST endpoint (return 400 for invalid data).

**Client Development (client Folder):**

- **Authentication Pages:**
  - **Register Page:** Connects to the `/register` endpoint with client-side validation.
  - **Login Page:** Accepts email and password, connects to the `/login` endpoint.
- **Functional Pages:**
  - **Homepage:** Public page describing your website with links to login/register. Must include dark mode toggle.
  - **Items List Page:** Displays all items with loading, error, and empty states.
  - **Item Insertion Page:** Allows insertion of a new item with client-side validation.
- **Theme Toggle:** Implement dark mode toggle using CSS variables.
- **Styling:** Basic CSS styling with CSS variables for theming is required at this stage.

#### Grading Criteria (Total: 100 Points):

**API Development:**

- Prisma tables set up correctly with role field (10%)
- Authentication endpoints with role support (10%)
- GET endpoint with pagination (10%)
- POST endpoint with server-side validation (10%)
- `requireAuth` and `requireRole` middleware (10%)

**Client Development:**

- Register page with client-side validation (10%)
- Login page functionality (10%)
- Homepage with dark mode toggle (10%)
- Items list page with loading/error/empty states (10%)
- Item insertion page with validation (10%)

---

### Part 3: Full Functionality and Refinement

This part requires the completion of all functionalities, ensuring the application is fully functional, secure, and user-friendly.

#### Objectives:

- Enhance UI/UX with CSS and Responsive Design (you can use CSS frameworks if you want)
- Implement All Remaining CRUD Operations
- Implement Role-Based Access Control throughout the application
- Implement Optimistic Updates for at least one mutation
- Implement Search with Debouncing and Filtering
- Ensure All API Endpoints are Fully Functional with proper validation
- Integrate External API Data
- Complete Unit Tests
- Finalize Accessibility Compliance
- Deploy the Application

**Video presentation:** Record a 5' presentation of your project running showing all the pages and functionality required. Upload the video to Youtube and put the link in the [Final Project Signup Sheet](https://docs.google.com/spreadsheets/d/1yYP5Qe6q7JScqJw6nz_YOydKbocOpHnacZ9sQO1o7kY/edit?usp=sharing).

#### Grading Criteria (Total: 100 Points):

1. **CSS and User Interface (20%):**
   - Consistent styling across all pages using CSS variables.
   - Dark mode toggle works correctly and persists preference.
   - Responsive design for mobile and desktop devices.

2. **React Components and UX (20%):**
   - All React pages are fully functional.
   - Loading, error, and empty states implemented on all data-fetching pages.
   - At least one mutation uses optimistic updates with rollback on failure.

3. **API Endpoints (15%):**
   - All endpoints are implemented and operational.
   - Data is correctly saved to the database.
   - Server-side data validation on all endpoints.
   - At least one list endpoint supports pagination, filtering, and search.

4. **Role-Based Security (15%):**
   - Client correctly handles authentication using token cookies.
   - At least 2 user roles implemented with different permissions.
   - API endpoints properly check roles using middleware.
   - UI conditionally renders actions based on user role.

5. **Search, Filtering, and Pagination (10%):**
   - Search functionality with 300ms debounce.
   - At least one filter parameter working.
   - Pagination correctly implemented.

6. **Testing (5%):**
   - At least three unit tests on the client side using React Testing Library.
   - Each test targets a different React component.

7. **Web Accessibility (5%):**
   - Lighthouse Accessibility scores of 80 or above for at least three pages.
   - Reports included in the accessibility_reports folder.

8. **Deployment (5%):**
   - Client, API, and database are deployed and accessible.
   - Deployment links provided in the README file.

9. **Code Quality and Attention to Detail (5%):**
   - Code is clean, readable, and well-organized.
   - Variable and function names are meaningful.
   - Unnecessary code and console logs are removed.

---

## Code Examples

### Role-Based Middleware (Reference: Week 9 Security)

Extend your `requireAuth` middleware to support role checking:

```javascript
// requireAuth middleware (from class)
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// NEW: requireRole middleware
function requireRole(role) {
  return async (req, res, next) => {
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId } 
    });
    if (!user || user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// Usage examples:
app.get("/api/items", requireAuth, getItems);  // Any authenticated user
app.delete("/api/items/:id", requireAuth, requireRole("admin"), deleteItem);  // Admin only
```

### Optimistic Updates (Reference: Quiz 05)

Update UI immediately, rollback on failure:

```javascript
// React example with optimistic delete
async function handleDelete(itemId) {
  // Store current state for rollback
  const previousItems = [...items];
  
  // Optimistically remove from UI
  setItems(items.filter(item => item.id !== itemId));
  
  try {
    const response = await fetch(`/api/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Delete failed');
    
  } catch (error) {
    // Rollback on failure
    setItems(previousItems);
    setError('Failed to delete item. Please try again.');
  }
}
```

### Debounced Search (Reference: Quiz 08)

```javascript
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in component
const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

useEffect(() => {
  // Fetch with debounced value
  fetchItems({ search: debouncedSearch, page, filter });
}, [debouncedSearch, page, filter]);
```

### Dark Mode Toggle (Reference: Quiz 02 + Quiz 07)

```css
/* CSS Variables for theming */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --accent-color: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent-color: #60a5fa;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

```javascript
// Theme toggle with localStorage persistence
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    return localStorage.getItem('theme') 
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Loading, Error, and Empty States (Reference: Week 5 APIs)

```javascript
function ItemsList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/items', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // Loading state
  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }

  // Error state with retry
  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={fetchItems}>Try Again</button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No items found.</p>
        <a href="/items/new">Create your first item</a>
      </div>
    );
  }

  // Success state
  return (
    <ul>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </ul>
  );
}
```

---

## Submission Guidelines

- **Part 1:** Create and commit a `PART1.md` file in the root of your GitHub Classroom repository.
- **Parts 2 and 3:** Please submit your complete project code through GitHub Classroom, ensuring that each part is submitted to its corresponding repository.
- **Deadline:** Refer to the course schedule for submission deadlines for each part.

## Conclusion

This final project is an opportunity to showcase your understanding and application of web development concepts. Start early, plan thoroughly, and don't hesitate to reach out if you have any questions. Good luck, and I look forward to seeing your innovative solutions!

**Remember:** The key to success in this project is incremental development and testing. Build the foundational elements first, ensure they work correctly, and then add features progressively.

---

## Optional Challenges (Not Graded)

For students who want to go above and beyond:

1. **Real-time Updates:** Implement WebSockets for live updates when data changes
2. **Drag and Drop:** Add drag-and-drop reordering (Reference: Quiz 08)
3. **Keyboard Shortcuts:** Implement keyboard navigation (Reference: Quiz 04)
4. **Undo/Redo:** Add undo functionality for actions (Reference: Quiz 04)
5. **Infinite Scroll:** Replace pagination with infinite scroll
6. **PWA Features:** Add offline support with service workers

## Deployment
- **Client:** https://tangerine-kheer-dc9b9b.netlify.app
- **API:** https://final-project-cara.onrender.com
- **Database:** PostgreSQL hosted on Render