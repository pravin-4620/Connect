# CampusConnect Frontend (Recreated)

The frontend has been completely recreated using a modern, professional tech stack as requested.

## 🛠 Tech Stack
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS (v3.4) + Shadcn UI (Class-variance-authority)
- **Icons**: Lucide React
- **State**: React Context API (AuthContext)
- **Forms**: React Hook Form + Zod Validation
- **Charts**: Recharts
- **Http Client**: Axios with Interceptors
- **Real-time**: Socket.io Client

## 📂 Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Dropdown...)
│   ├── common/       # Layouts, Sidebar, Navbar, ProtectedRoute
├── pages/
│   ├── auth/         # Login, AdminLogin
│   ├── student/      # Student Dashboard & Features
│   ├── mentor/       # Mentor Dashboard & Features
│   ├── placement/    # Placement Dashboard & Features
│   ├── admin/        # Admin Dashboard & Features
├── context/          # Auth & Global State
├── services/         # API & Socket Services
├── types/            # TypeScript Interfaces
```

## 🚀 Key Features Implemented
1.  **Professional UI Foundation**:
    *   configured `tailwind.config.js` with HSL variables for theming.
    *   `cn` utility for class merging.
    *   `Button`, `Card`, `LoadingSpinner`, `DropdownMenu` components built to professional standards.

2.  **Authentication System**:
    *   `AuthContext` handling login/logout and token persistence.
    *   `ProtectedRoute` for RBAC (Role-Based Access Control).
    *   **Login Page** with form validation and role switching.
    *   **Admin Login Page** with distinct branding.

3.  **Navigation Architecture**:
    *   **Collapsible Sidebar** with role-specific menu items.
    *   **Responsive Navbar** with user profile and notifications.
    *   **Layout Wrapper** ensuring consistent structure.
    *   **Router Setup** in `App.tsx` handling all 4 roles and 30+ routes.

4.  **Dashboards**:
    *   **Student Dashboard**: Implemented with Stats Cards (CGPA, Pending work, etc.).
    *   **Placeholders**: Created skeleton pages for Mentor, Placement, and Admin dashboards to verify routing.

## 🏃‍♂️ How to Run
```bash
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:3000`.

## ⏭ Next Steps
The core architecture is built. You can now proceed to implement the specific logic for the remaining pages (Assignments, Drives, etc.) using the established patterns in `src/pages/`.
