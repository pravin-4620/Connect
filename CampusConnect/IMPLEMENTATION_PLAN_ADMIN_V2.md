# IMPLEMENTATION_PLAN_ADMIN_V2.md

## Objective
Enhance the Admin module and core system functionality with features like Maintenance Mode, Data Export, User Blocking, Enhanced Chat/Activity Monitoring, Improved Announcements, System Stats, and revised Role Hierarchy.

## 1. Schema Updates
- **Enum `Role`:** Add `CHIEF_MENTOR`, `SUB_ADMIN`.
- **Model `User`:**
    - Add `isBlocked` (Boolean, default: false).
- **Model `Announcement`:**
    - Add `isArchived` (Boolean, default: false).

## 2. Maintenance Mode
- **Feature:** Block non-admin logins when Maintenance Mode is ON.
- **Implementation:**
    - Ensure `SystemSettings` has a key for `maintenance_mode`.
    - Modifiy `auth.controller.js` (`login` function):
        - Check `SystemSettings` for `maintenance_mode = 'true'`.
        - If true and user.role != `ADMIN` (and != `SUB_ADMIN`), deny login with "Under Maintenance" message.

## 3. User Blocking
- **Feature:** Block access for specific users.
- **Implementation:**
    - Modify `auth.controller.js`:
        - In `login`, `adminLogin`, and `getProfile` (or middleware), check `user.isBlocked`.
        - If true, return 403 Forbidden with "Account Blocked. Contact Admin.".
    - Admin Controller:
        - Add `toggleBlockUser` endpoint.

## 4. Chats & Activity Monitoring
- **Feature:** Admin can see all other user chats and activities.
- **Implementation:**
    - **Chats:** Create endpoint `getAdminAllChats` to fetch threads involving any user.
    - **Activities:** Enhance `getSystemLogs` or create `getGlobalActivityLog`.

## 5. Role Hierarchy & Chat Logic
- **New Roles:**
    - **CHIEF_MENTOR:**
        - Can only chat with `ADMIN` (Head Admin).
        - Can be mapped to students/mentors? (Clarify if mapping logic changes). Assumptions: They oversee mentors.
    - **SUB_ADMIN (Low Admin):**
        - Restricted features (Can't delete users, maybe can't see specific high-level stats).
        - Chats with everyone else (Students, Mentors).
- **Chat Access Logic (Frontend/Backend):**
    - `getContacts` or similar logic needs to respect these rules.
    - Default:
        - `STUDENT/MENTOR` see `SUB_ADMIN` (Low Admin) in contact list for "Admin Support".
        - `CHIEF_MENTOR` sees `ADMIN` (Head Admin).
        - `ADMIN` sees everyone.
        - `SUB_ADMIN` sees everyone (except maybe Head Admin private chats?).

## 6. Announcements Improvements
- **Feature:** Archive announcements.
- **Implementation:**
    - Add `archiveAnnouncement` endpoint (sets `isArchived = true`).
    - Update `getAnnouncements` to support filtering by `isArchived` compatible with frontend tabs (Active vs Older).

## 7. Data Export
- **Feature:** Export data to Excel.
- **Implementation:**
    - Use `exceljs`.
    - Create `exportUsersExcel` endpoint.

## 8. System Stats
- **Feature:** More technical stats.
- **Implementation:**
    - DB Size (approx), API Latency (avg), Error Rates, Active Sessions.

## 9. User Management (Search/Filter)
- **Feature:** Filter by Department and Year.
- **Implementation:**
    - Update `getUsers` in `admin.controller.js` to accept `department` and `year` query params.

## Phase 1 Execution Plan
1.  **Schema Migration:** Update `schema.prisma` and migrate.
2.  **Backend Logic (Auth & Blocking):** Update `auth.controller.js`.
3.  **Backend Logic (Admin Controller):** Add `toggleBlockStatus`, `exportExcel`, `archiveAnnouncement`.
4.  **Frontend Admin Dashboard:** Implement new tabs/UI for these features.

