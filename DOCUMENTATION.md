# Onestep-Hub | Documentation

## 1. Project Overview
**Onestep-Hub** is a technology-driven B2B digital marketplace designed to connect manufacturers, wholesalers, and retailers. It focuses on fashion, footwear, and lifestyle segments, providing a seamless procurement experience.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Framer Motion (for animations)
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`)
- **Authentication**: Firebase Client SDK
- **API Client**: Axios (with custom interceptors for token handling)

### Backend
- **Framework**: Express.js (Node.js)
- **Database ORM**: Sequelize
- **Database**:
  - **Development**: SQLite (Zero-config, local storage)
  - **Production**: MySQL (configured via `.env`)
- **Authentication**: Firebase Admin SDK (Server-side validation)

---

## 3. Project Structure

```text
onestep-hub/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, Footer, etc.)
│   │   ├── context/          # Auth, Cart, and Wishlist providers
│   │   ├── pages/            # Main views and Dashboard pages
│   │   ├── services/         # API (Axios) and Firebase logic
│   │   └── lib/              # Utility functions
├── backend/                  # Express API
│   ├── src/
│   │   ├── middleware/       # Authentication and Auth-check logic
│   │   ├── models/           # Sequelize Models (Database Schema)
│   │   ├── routes/           # REST API endpoints
│   │   └── index.js          # Entry point and Server setup
├── firebase-applet-config.json # Working Firebase Configuration
└── .env                      # Global environment variables
```

---

## 4. Authentication Architecture

### The Flow
1. **Client Side**: User logs in via Firebase (Email/Password or Google). Firebase returns an `idToken`.
2. **Request Binding**: The `src/services/api.js` interceptor automatically attaches this token to the `Authorization` header (`Bearer <token>`).
3. **Server Side**: The `authenticate` middleware in `backend/src/middleware/auth.js` intercepts the request.
4. **Validation**: 
   - If it's a standard JWT (Firebase), the `firebase-admin` SDK verifies it.
   - If it's an internal admin token (stored in `adminTokens` Map), it authenticates as the master admin.
5. **Session Persistence**: User details are mapped from Firebase to the local SQL database for role management.

---

## 5. Database Schema (Sequelize)

| Model | Key Fields | Purpose |
| :--- | :--- | :--- |
| **User** | `uid`, `email`, `role`, `wishlist` | Stores user profiles and roles (user, seller, admin). |
| **Product** | `name`, `price`, `images`, `stock` | Core inventory management. Supports variants (sizes/colors). |
| **Category** | `name`, `image`, `description` | Organizes products for navigation. |
| **Order** | `userId`, `items`, `totalAmount`, `status` | Tracks transactions and delivery progress. |
| **Contact** | `name`, `email`, `message`, `isRead` | Customer support inquiries. |
| **Newsletter**| `email`, `isActive` | Marketing subscription list. |

---

## 6. How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- MySQL (Optional, defaults to SQLite if not configured)

### 2. Environment Setup
Create a `.env` file in the root with the following:
```env
# Database (Defaults to SQLite if omitted)
DB_DIALECT=sqlite 

# Firebase Admin
FIREBASE_PROJECT_ID=gen-lang-client-0187334274

# Master Admin Credentials
ADMIN_EMAIL=admin@onestep.com
ADMIN_PASSWORD=Admin@123
```

### 3. Installation
```bash
# Install root (optional)
npm install

# Install Frontend
cd frontend && npm install

# Install Backend
cd ../backend && npm install
```

### 4. Start Development
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

---

## 7. Key API Endpoints

- `GET /api/products`: Fetch all products (supports filtering).
- `POST /api/auth/register`: Syncs a Firebase user with the local SQL database.
- `GET /api/users/profile`: Retrieves current user details and role.
- `POST /api/orders`: Create a new purchase entry.
- `GET /api/health`: Check server and database connectivity.
## 8. Functional Workflow & User Journey

### A. User Registration & Sync
1. **Frontend**: When a user registers via `Register.jsx`, they are first created in **Firebase Authentication**.
2. **Backend Sync**: Immediately after, the frontend calls `POST /api/auth/register`. 
3. **Database**: The backend verifies the Firebase token and creates a corresponding record in the **MySQL/SQLite `Users` table**. This allows us to assign roles like `admin` or `seller` which Firebase doesn't handle natively.

### B. Shopping Experience
1. **Browsing**: Products are fetched from the database through `GET /api/products`.
2. **Personalization**: Users can add items to their **Wishlist**, which is synced to the database (User model) so it persists across devices.
3. **Cart**: The cart is managed locally via `CartContext` for speed, but is converted into a permanent **Order** record upon checkout.

### C. Checkout & Order Management
1. **Security**: Only logged-in users can access the `/checkout` route (enforced by `ProtectedRoute`).
2. **Order Placement**: When a user completes checkout, a new entry is created in the `Orders` table.
3. **Admin Alert**: Admin and Seller dashboards can view these orders in real-time by polling the `GET /api/orders` endpoints.

### D. Seller & Admin Operations
- **Sellers**: Can access `/seller` to manage their own products and view order statuses.
- **Admins**: Have full access to `/admin` for user management, category creation, and site-wide analytics.
- **Asset Handling**: Images uploaded via the dashboards are handled by `multer` in `backend/src/routes/upload.js` and served via the `/uploads` static route.
