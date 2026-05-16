<div align="center">

# 🛒 L'Épicerie Moderne

### A full-stack online supermarket platform built with Java EE & React

[![Java](https://img.shields.io/badge/Java-11-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Java EE](https://img.shields.io/badge/Java%20EE-Servlets%204.0-007396?style=for-the-badge&logo=java&logoColor=white)](https://jakarta.ee/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Maven](https://img.shields.io/badge/Maven-3-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![Tomcat](https://img.shields.io/badge/Tomcat-9-F8DC75?style=for-the-badge&logo=apachetomcat&logoColor=black)](https://tomcat.apache.org/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey?style=for-the-badge)](./README.md)

</div>

---

## 📋 Table of Contents

- [Description](#-description)
- [🚀 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📸 Screenshots](#-screenshots)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation](#️-installation)
- [🔑 Environment Variables](#-environment-variables)
- [▶️ Usage](#️-usage)
- [📜 Available Scripts](#-available-scripts)
- [🔌 API Documentation](#-api-documentation)
- [🗄 Database Schema](#-database-schema)
- [🔐 Authentication](#-authentication)
- [🚢 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [🔮 Future Improvements](#-future-improvements)

---

## Description

**L'Épicerie Moderne** is a complete e-commerce platform for an online supermarket. It supports the full customer shopping lifecycle — browsing a product catalogue, managing a cart, applying promo codes, checking out, and tracking orders — alongside a comprehensive multi-role back-office for product management, stock control, promotions, order fulfillment, and user administration.

The backend is a REST-style JSON API built with pure Java EE Servlets (no framework), deployed on Apache Tomcat 9. The frontend is a React 19 single-page application styled with Tailwind CSS 4, communicating with the backend over HTTP with session-based authentication.

---

## 🚀 Features

### 🛍️ Client-facing

- **Home page** — Featured products, active promotions banner, and category highlights
- **Product catalogue** — Browse all products with category filtering and keyword search
- **Product detail** — Full description, price, live stock status, and Add to Cart action
- **Shopping cart** — Add, remove, and update item quantities with real-time totals
- **Checkout** — Delivery address input, payment method selection, and promo code validation
- **Order confirmation** — Post-checkout summary page with order details
- **Order history** — Full list of past orders with status tracking
- **User profile** — Edit personal information, change password, and upload a profile photo
- **Promotions page** — Browse all currently active promotions
- **Password reset** — Email-based reset code flow via JavaMail/SMTP
- **Static pages** — FAQ, About, and Contact

### 🛠️ Admin Back-office

- **Role-aware dashboard** — Metrics overview with charts (Recharts) scoped to the logged-in admin's role
- **Products** — Create, update, and soft-delete products; upload product images
- **Categories** — Manage hierarchical (parent/child) product categories
- **Stock** — Adjust stock levels, view alert/rupture status, browse stock movement history
- **Orders** — View all orders, update order status through the fulfillment pipeline
- **Clients** — View client list, suspend or reactivate accounts
- **Promotions** — Create and manage time-bound, percentage-based promotions linked to specific products
- **Promo codes** — Generate codes with fixed or percentage discounts, usage limits, and validity dates

### 👑 Super Admin

- All admin features above
- Create, update role, and delete administrator accounts
- Full system dashboard with cross-department metrics

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 11 | Core language |
| Java EE / Servlets | 4.0 | HTTP request handling (no framework) |
| Apache Tomcat | 9.x | Servlet container / app server |
| Maven | 3.6+ | Build tool, WAR packaging |
| MySQL Connector/J | 8.0.33 | JDBC driver |
| Google Gson | 2.10.1 | JSON serialization/deserialization |
| jBCrypt | 0.4 | BCrypt password hashing |
| JavaMail (javax.mail) | 1.6.2 | Transactional emails (password reset, order status) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| Vite | 8 | Build tool and dev server |
| React Router | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| Axios | 1.15 | HTTP client |
| Recharts | 3 | Admin dashboard charts |

### Database
- **MySQL 8** — Relational database (`supermarche_jee` schema)
- **JDBC** — Direct database access via the DAO layer (no ORM)

### Authentication
- **HTTP-only session cookies** — Server-side sessions managed by Tomcat
- **BCrypt** — Password hashing at rest

---

## 📸 Screenshots

The `stitch_supermarch_design_system/` and `supermarche-frontend/design-reference/` folders contain UI mockups and screen captures for all major views:

| Screen | File |
|---|---|
| Homepage | `homepage_l_epicerie_moderne/screen.png` |
| Product catalogue grid | `product_catalog_grid/screen.png` |
| Cart & Checkout | `cart_checkout_l_epicerie_moderne/screen.png` |
| Order confirmation | `order_confirmation_l_epicerie_moderne/screen.png` |
| Admin global dashboard | `dashboard_global/screen.png` |
| Admin stock dashboard | `dashboard_stock/screen.png` |
| Stock detail management | `gestion_stock_d_tail/screen.png` |
| Order processing | `traitement_commandes/screen.png` |
| Client management | `client_management/screen.png` |
| Promotion builder | `promotion_builder/screen.png` |
| Category management | `category_management/screen.png` |
| Admin management | `gestion_administrateurs/screen.png` |
| Login page | `login_supermarch_vision/screen.png` |
| User profile | `user_profile_l_epicerie_moderne/screen.png` |

---

## 📁 Project Structure

```
supermarche-jee/
│
├── pom.xml                          # Maven build descriptor (Java 11, WAR packaging)
├── schema_complet.sql               # Full MySQL schema — run once to initialize
├── SETUP_COMPLET.sql                # Schema + seed data combined (all-in-one)
├── migration_001.sql                # Migration: adds photo_profil to utilisateur
├── migration_002.sql                # Migration: adds promo code fields to commande
├── seed_final.sql                   # Product & category seed data
├── seed_admins.sql                  # Default admin account seed
├── seed_promotions.sql              # Sample promotions seed
├── DEPLOY.ps1                       # One-click deployment script (Windows / XAMPP)
├── GenerateHash.java                # CLI utility to generate BCrypt hashes
│
├── sql/
│   └── promotions_setup.sql         # Standalone promotions table setup
│
├── src/main/java/com/supermarche/
│   ├── config/
│   │   └── DatabaseConfig.java      # JDBC connection factory (URL, credentials)
│   │
│   ├── model/                       # Plain Java model/entity classes
│   │   ├── Utilisateur.java         # Base user entity
│   │   ├── Client.java              # Client profile (address, CIN)
│   │   ├── Administrateur.java      # Admin record linked to Utilisateur
│   │   ├── Produit.java             # Product entity
│   │   ├── Categorie.java           # Category (supports parent/child hierarchy)
│   │   ├── Stock.java               # Stock level per product
│   │   ├── HistoriqueStock.java     # Stock movement audit log entry
│   │   ├── Panier.java              # Shopping cart header
│   │   ├── PanierProduit.java       # Cart line item
│   │   ├── Commande.java            # Order header
│   │   ├── LigneCommande.java       # Order line item (price snapshot)
│   │   ├── Paiement.java            # Payment record
│   │   ├── Promotion.java           # Promotion (percentage, date range)
│   │   └── CodePromo.java           # Promo code (discount, usage limits)
│   │
│   ├── dao/                         # Data Access Objects — JDBC queries
│   │   ├── UtilisateurDAO.java
│   │   ├── ClientDAO.java
│   │   ├── AdminDAO.java
│   │   ├── ProduitDAO.java
│   │   ├── CategorieDAO.java
│   │   ├── StockDAO.java
│   │   ├── PanierDAO.java
│   │   ├── CommandeDAO.java         # ACID transaction: stock decrement at checkout
│   │   ├── PromotionDAO.java
│   │   └── CodePromoDAO.java
│   │
│   ├── filter/
│   │   ├── AuthFilter.java          # Session validation + role enforcement
│   │   └── CorsFilter.java          # CORS response headers
│   │
│   ├── servlet/
│   │   ├── auth/
│   │   │   ├── ConnexionServlet.java       # POST /api/auth/connexion
│   │   │   ├── InscriptionServlet.java     # POST /api/auth/inscription
│   │   │   ├── DeconnexionServlet.java     # POST /api/auth/deconnexion
│   │   │   ├── MeServlet.java              # GET  /api/auth/me
│   │   │   └── PasswordResetServlet.java   # POST /api/auth/password-reset
│   │   ├── client/
│   │   │   ├── ProduitsServlet.java        # GET  /api/produits/*
│   │   │   ├── CategoriesServlet.java      # GET  /api/categories/*
│   │   │   ├── PanierServlet.java          # GET/POST/PUT/DELETE /api/panier/*
│   │   │   ├── CommandeServlet.java        # GET/POST/PUT /api/commandes/*
│   │   │   └── ProfilServlet.java          # GET/PUT/DELETE /api/profil/*
│   │   ├── admin/
│   │   │   ├── AdminProduitServlet.java    # CRUD /api/admin/produits/*
│   │   │   ├── AdminCategorieServlet.java  # CRUD /api/admin/categories/*
│   │   │   ├── AdminStockServlet.java      # GET/PUT /api/admin/stock/*
│   │   │   ├── AdminCommandeServlet.java   # GET/PUT /api/admin/commandes/*
│   │   │   ├── AdminClientServlet.java     # GET/PUT/DELETE /api/admin/clients/*
│   │   │   ├── AdminPromotionServlet.java  # CRUD /api/admin/promotions/*
│   │   │   ├── AdminCodePromoServlet.java  # CRUD /api/admin/codes-promo/*
│   │   │   └── SuperAdminServlet.java      # CRUD /api/superadmin/*
│   │   ├── CodePromoServlet.java           # POST /api/promo/valider
│   │   ├── PromotionsPublicServlet.java    # GET  /api/promotions/*
│   │   ├── UploadServlet.java              # POST /api/upload
│   │   └── TestDbServlet.java              # GET  /api/test-db (connectivity check)
│   │
│   └── util/
│       ├── JsonUtil.java            # JSON response helpers (sendJson, sendError)
│       ├── PasswordUtil.java        # BCrypt wrapper
│       ├── EmailUtil.java           # JavaMail SMTP sender (reset codes, order emails)
│       └── FixDB.java               # One-off DB repair utility
│
├── src/main/webapp/
│   ├── index.jsp                    # Root redirect to frontend
│   └── WEB-INF/web.xml             # Session config (30 min), MIME types
│
├── stitch_supermarch_design_system/ # UI design mockups (HTML + PNG per screen)
│
└── supermarche-frontend/            # React SPA
    ├── package.json
    ├── vite.config.js               # Vite dev proxy → localhost:8080
    ├── index.html
    └── src/
        ├── App.jsx                  # Router, route guards (ProtectedRoute)
        ├── main.jsx
        ├── api/
        │   └── api.js               # Centralized API client (fetch wrapper + named exports)
        ├── context/
        │   ├── AuthContext.jsx      # Global auth state
        │   ├── CartContext.jsx      # Global cart state
        │   └── ToastContext.jsx     # Toast notification state
        ├── components/
        │   ├── ClientNavbar.jsx
        │   ├── AdminSidebar.jsx
        │   ├── Footer.jsx
        │   ├── Modal.jsx / ConfirmModal.jsx
        │   ├── SkeletonCard.jsx / SkeletonList.jsx / SkeletonLoader.jsx
        │   ├── FormSelect.jsx
        │   ├── AdminFilterBar.jsx
        │   └── AccessibleForm.jsx
        ├── hooks/
        │   ├── useScrollToTop.js
        │   ├── useReveal.js
        │   └── useRevealAnimation.jsx
        └── pages/
            ├── HomePage.jsx / CataloguePage.jsx / ProductDetailsPage.jsx
            ├── CartPage.jsx / CheckoutPage.jsx / OrderConfirmationPage.jsx
            ├── ClientOrdersPage.jsx / ProfilePage.jsx / PromotionsPage.jsx
            ├── LoginPage.jsx / RegisterPage.jsx / ForgotPasswordPage.jsx
            ├── AboutPage.jsx / FaqPage.jsx / ContactPage.jsx / NotFoundPage.jsx
            └── admin/
                ├── AdminDashboardPage.jsx
                ├── AdminProductsPage.jsx / AdminCategoriesPage.jsx
                ├── AdminStockPage.jsx / AdminOrdersPage.jsx
                ├── AdminClientsPage.jsx / AdminPromotionsPage.jsx
                ├── AdminProfilePage.jsx / SuperAdminPage.jsx
                └── dashboards/
                    ├── SuperAdminDashboard.jsx
                    ├── AdminProduitsDashboard.jsx
                    ├── AdminStockDashboard.jsx
                    └── SharedComponents.jsx
```

---

## ⚙️ Installation

### Prerequisites

| Requirement | Minimum version |
|---|---|
| Java JDK | 11 |
| Apache Maven | 3.6 |
| Apache Tomcat | 9.x |
| MySQL | 8.x |
| Node.js | 18 |
| npm | 9 |

> **Tip:** On Windows, [XAMPP](https://www.apachefriends.org/) bundles Tomcat and MySQL with a graphical control panel.

---

### Option A — Automated (Windows / XAMPP)

1. Make sure XAMPP is installed at `C:\xampp` with both **MySQL** and **Tomcat** running.
2. Build the WAR file (see step 4 in Option B below).
3. Run the deployment script:

```powershell
.\DEPLOY.ps1
```

The script will verify your environment, create the database schema, seed initial data, copy the WAR to Tomcat's `webapps/` directory, and build and deploy the React frontend automatically.

---

### Option B — Manual Setup

#### 1. Clone / extract the project

```bash
unzip supermarche-jee.zip
cd supermarche-jee
```

#### 2. Initialize the database

Start your MySQL server, then run:

```sql
-- All-in-one (schema + seed data)
source SETUP_COMPLET.sql;
```

Or step by step:

```bash
mysql -u root -p < schema_complet.sql       # Create all tables
mysql -u root -p supermarche_jee < seed_final.sql      # Products & categories
mysql -u root -p supermarche_jee < seed_admins.sql     # Default admin accounts
mysql -u root -p supermarche_jee < seed_promotions.sql # Sample promotions (optional)
```

#### 3. Configure the database connection

Edit `src/main/java/com/supermarche/config/DatabaseConfig.java` and set your MySQL credentials:

```java
private static final String URL = "jdbc:mysql://127.0.0.1:3306/supermarche_jee"
    + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
    + "&useUnicode=true&characterEncoding=UTF-8";

private static final String USER     = "root";   // your MySQL username
private static final String PASSWORD = "";        // your MySQL password
```

#### 4. Build the backend

```bash
mvn clean package
# Produces: target/supermarche-jee.war
```

#### 5. Deploy to Tomcat

```bash
cp target/supermarche-jee.war /path/to/tomcat/webapps/
# Then start (or restart) Tomcat
```

Backend available at: `http://localhost:8080/supermarche-jee`

#### 6. Set up the frontend

```bash
cd supermarche-frontend
npm install
```

Development mode (Vite proxies API calls to Tomcat):

```bash
npm run dev
# Frontend available at: http://localhost:5173
```

Production build (to embed inside the WAR):

```bash
npm run build
# Copy dist/ contents into src/main/webapp/ then re-run: mvn clean package
```

#### 7. Apply database migrations (when upgrading)

```bash
mysql -u root supermarche_jee < migration_001.sql   # Adds photo_profil column
mysql -u root supermarche_jee < migration_002.sql   # Adds promo code fields to commande
```

---

## 🔑 Environment Variables

This project uses **hardcoded configuration files** rather than `.env` files. The two files requiring environment-specific edits are:

### Backend — `src/main/java/com/supermarche/config/DatabaseConfig.java`

```java
// JDBC connection URL
private static final String URL = "jdbc:mysql://127.0.0.1:3306/supermarche_jee"
    + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
    + "&useUnicode=true&characterEncoding=UTF-8";

private static final String USER     = "root";   // MySQL username
private static final String PASSWORD = "";        // MySQL password
```

### Backend — `src/main/java/com/supermarche/util/EmailUtil.java`

```java
// SMTP credentials for transactional emails (password reset, order updates)
private static final String SMTP_EMAIL    = "YOUR_GMAIL_ADDRESS@gmail.com";
private static final String SMTP_PASSWORD = "YOUR_GMAIL_APP_PASSWORD";
```

> To enable email sending, create a [Gmail App Password](https://support.google.com/accounts/answer/185833) with 2FA enabled and set it in `EmailUtil.java`.

### Frontend — `supermarche-frontend/vite.config.js`

```js
server: {
  proxy: {
    '/supermarche-jee': {
      target: 'http://localhost:8080',  // Tomcat host and port
      changeOrigin: true,
    }
  }
}
```

### Equivalent `.env` reference (for documentation purposes)

```env
# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=supermarche_jee
DB_USER=root
DB_PASSWORD=

# SMTP (Gmail)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Tomcat
TOMCAT_PORT=8080
TOMCAT_CONTEXT=/supermarche-jee

# Vite dev server
VITE_DEV_PORT=5173
VITE_PROXY_TARGET=http://localhost:8080
```

---

## ▶️ Usage

| Mode | Steps | URL |
|---|---|---|
| **Backend only** | Deploy WAR to Tomcat, start Tomcat | `http://localhost:8080/supermarche-jee` |
| **Full dev mode** | Start Tomcat + run `npm run dev` in `supermarche-frontend/` | `http://localhost:5173` |
| **Production** | `npm run build` → copy `dist/` to `webapp/` → `mvn package` → deploy WAR | `http://localhost:8080/supermarche-jee` |

### Default admin accounts (after running `seed_admins.sql`)

| Role | Email | Password |
|---|---|---|
| 👑 `super_admin` | `superadmin@epicerie.ma` | `Admin123!` |
| 📦 `admin_produits` | `produits@epicerie.ma` | `Admin123!` |
| 📊 `admin_stock` | `stock@epicerie.ma` | `Admin123!` |

> ⚠️ **Change these passwords immediately in any non-local environment.**

---

## 📜 Available Scripts

### Backend (Maven)

| Command | Description |
|---|---|
| `mvn clean package` | Compile source and produce `target/supermarche-jee.war` |
| `mvn clean` | Remove the `target/` build directory |

### Frontend (npm — run from `supermarche-frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload at `localhost:5173` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the source files |

### Database scripts (root of project)

| Script | Description |
|---|---|
| `SETUP_COMPLET.sql` | Full all-in-one setup: schema + all seed data |
| `schema_complet.sql` | Schema only (tables, views, constraints) |
| `seed_final.sql` | Products, categories, and initial data |
| `seed_admins.sql` | Default admin user accounts |
| `seed_promotions.sql` | Sample promotion data |
| `migration_001.sql` | Add `photo_profil` column to `utilisateur` |
| `migration_002.sql` | Add promo code columns to `commande` |

### Deployment (Windows)

| Script | Description |
|---|---|
| `DEPLOY.ps1` | Automated deployment via PowerShell for XAMPP (Windows only) |

---

## 🔌 API Documentation

All endpoints are prefixed with `/supermarche-jee`. The API is session-based; authentication state is maintained via an HTTP-only session cookie.

---

### 🔑 Authentication — `/api/auth/`

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| `POST` | `/api/auth/inscription` | No | Register a new client account |
| `POST` | `/api/auth/connexion` | No | Login — creates a server session |
| `POST` | `/api/auth/deconnexion` | Yes | Logout — destroys the session |
| `GET` | `/api/auth/me` | Yes | Return the current user's identity and role |
| `POST` | `/api/auth/password-reset` | No | Initiate or complete a password reset via email code |

**`POST /api/auth/inscription` — Request body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "mot_de_passe": "SecretPassword1!"
}
```

**`POST /api/auth/connexion` — Request body:**
```json
{
  "email": "jean.dupont@example.com",
  "mot_de_passe": "SecretPassword1!"
}
```

---

### 🌍 Public catalogue — no auth required

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/produits` | List all active products (supports `?categorie=`, `?search=`, `?page=`) |
| `GET` | `/api/produits/{id}` | Get a single product by ID |
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/categories/{id}` | Get a single category |
| `GET` | `/api/promotions/actives` | List currently active promotions |
| `GET` | `/api/promotions/produits` | List promoted products with computed promo price |
| `POST` | `/api/promo/valider` | Validate a promo code and return the discount |
| `GET` | `/api/test-db` | Database connectivity check |

---

### 🛒 Cart — `/api/panier/` (auth: any logged-in user)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/panier` | Get the current user's active cart |
| `POST` | `/api/panier/ajouter` | Add a product to the cart |
| `PUT` | `/api/panier/modifier` | Update item quantity |
| `DELETE` | `/api/panier/supprimer` | Remove an item from the cart |

---

### 📋 Orders — `/api/commandes/` (auth: `client`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/commandes/passer` | Place an order (ACID transaction: stock decremented atomically) |
| `GET` | `/api/commandes/historique` | Get the client's order history |
| `GET` | `/api/commandes/{id}` | Get a specific order by ID |

---

### 👤 Profile — `/api/profil/` (auth: `client`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profil` | Get the current user's profile |
| `PUT` | `/api/profil/modifier` | Update profile info (name, phone, address, etc.) |
| `PUT` | `/api/profil/mot-de-passe` | Change password |
| `DELETE` | `/api/profil` | Delete the client account |
| `POST` | `/api/upload` | Upload a profile or product image |

---

### 🛠️ Admin endpoints — `/api/admin/` (auth: admin roles)

#### Products (role: `admin_produits` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/produits` | List all products |
| `GET` | `/api/admin/produits/{id}` | Get product by ID |
| `POST` | `/api/admin/produits` | Create a product |
| `PUT` | `/api/admin/produits/{id}` | Update a product |
| `DELETE` | `/api/admin/produits/{id}` | Deactivate a product |

#### Categories (role: `admin_produits` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/categories` | List all categories |
| `POST` | `/api/admin/categories` | Create a category |
| `PUT` | `/api/admin/categories/{id}` | Update a category |
| `DELETE` | `/api/admin/categories/{id}` | Delete a category |

#### Stock (role: `admin_stock` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stock` | List all stock entries |
| `GET` | `/api/admin/stock/{id}` | Get stock by product ID |
| `PUT` | `/api/admin/stock/{id}` | Update stock quantity |

#### Orders (role: `admin_stock` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/commandes` | List all orders |
| `PUT` | `/api/admin/commandes/{id}` | Update order status |

#### Clients (role: any admin)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/clients` | List all clients |
| `GET` | `/api/admin/clients/{id}` | Get client details |
| `GET` | `/api/admin/clients/{id}/commandes` | Get a client's order history |
| `PUT` | `/api/admin/clients/{id}/statut` | Suspend or reactivate a client |
| `PUT` | `/api/admin/clients/{id}/profil` | Update client profile |
| `PUT` | `/api/admin/clients/{id}/reset-password` | Force-reset a client's password |
| `DELETE` | `/api/admin/clients/{id}` | Delete a client account |

#### Promotions (role: `admin_stock` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/promotions` | List all promotions |
| `GET` | `/api/admin/promotions/actives` | List active promotions |
| `POST` | `/api/admin/promotions` | Create a promotion |
| `PUT` | `/api/admin/promotions/{id}` | Update a promotion |
| `PUT` | `/api/admin/promotions/{id}/toggle` | Enable/disable a promotion |
| `DELETE` | `/api/admin/promotions/{id}` | Delete a promotion |

#### Promo Codes (role: `admin_stock` or `super_admin`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/codes-promo` | List all promo codes |
| `POST` | `/api/admin/codes-promo` | Create a promo code |
| `PUT` | `/api/admin/codes-promo/{id}/toggle` | Enable/disable a promo code |
| `DELETE` | `/api/admin/codes-promo/{id}` | Delete a promo code |

---

### 👑 Super Admin — `/api/superadmin/` (role: `super_admin` only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/superadmin/dashboard` | Full system metrics dashboard |
| `GET` | `/api/superadmin/admins` | List all administrator accounts |
| `POST` | `/api/superadmin/admins` | Create a new administrator |
| `PUT` | `/api/superadmin/admins/{id}/role` | Update an administrator's role |
| `DELETE` | `/api/superadmin/admins/{id}` | Delete an administrator account |

---

## 🗄 Database Schema

Database name: **`supermarche_jee`** — MySQL 8, utf8mb4 encoding.

| Table | Description |
|---|---|
| `utilisateur` | All system users. Stores `nom`, `prenom`, `email`, `mot_de_passe` (BCrypt), `telephone`, `role` (enum), `photo_profil`, `statut` (actif/suspendu/supprime) |
| `client` | Client-specific profile: CIN, address, city, postal code. One-to-one with `utilisateur` |
| `administrateur` | Admin record with `type_admin` (super/produits/stock). One-to-one with `utilisateur` |
| `categorie` | Product categories with optional self-referencing `id_categorie_parent` for hierarchy |
| `produit` | Products: `nom_produit`, `description`, `prix`, `image_produit`, `actif` flag, category FK |
| `stock` | One-to-one with `produit`. Tracks `quantite_disponible`, `seuil_alerte`, and `statut_stock` (disponible/alerte/rupture) |
| `historique_stock` | Audit log of every stock movement (entree/sortie/ajustement) with before/after quantities |
| `panier` | Shopping cart per client or session. Statuses: actif/valide/abandonne |
| `panier_produit` | Cart line items: product FK, quantity, and price snapshot at time of add |
| `commande` | Orders with delivery address, status pipeline, payment method, promo code applied, and cancellation info |
| `ligne_commande` | Order line items with `nom_produit_snapshot` (preserves product name even if deleted) |
| `paiement` | Payment record per order: method, status (en_attente/paye/rembourse) |
| `promotion` | Time-bound percentage promotions created by admins, linked to products via `promotion_produit` |
| `promotion_produit` | Junction table linking promotions to specific products |
| `code_promo` | Promo codes: type (pourcentage/montant), valeur, montant_min, usage_max, date range |
| `usage_code_promo` | Tracks which client used which promo code on which order |

**SQL view:** `vue_produits_en_promotion` — pre-computed view returning all currently active promoted products with their original price, promotion percentage, and computed `prix_promo`.

### Order status pipeline

```
en_attente → confirmee → en_preparation → en_livraison → livree
                                                        ↘ annulee
```

### Stock status logic

```
quantite_disponible > seuil_alerte  →  disponible
quantite_disponible ≤ seuil_alerte  →  alerte
quantite_disponible = 0             →  rupture
```

---

## 🔐 Authentication

The application uses **server-side session authentication** managed by Apache Tomcat.

### Login flow

1. The client POSTs credentials to `POST /api/auth/connexion`.
2. The backend verifies the BCrypt-hashed password against the `utilisateur` table.
3. On success, a server session is created storing `userId`, `role`, and `email`.
4. Tomcat sets an **HTTP-only session cookie** (`JSESSIONID`) in the response.
5. All subsequent requests from the browser automatically include this cookie.

### Session configuration (`web.xml`)

- **Timeout:** 30 minutes of inactivity
- **HTTP-only:** `true` (inaccessible to JavaScript — XSS mitigation)

### Route protection

Two layers of protection are enforced independently:

**Backend — `AuthFilter.java`**

Intercepts all requests matching:

```
/api/panier/*
/api/commandes/*
/api/profil/*
/api/admin/*
/api/superadmin/*
```

Returns `401 Unauthorized` if no valid session exists. Returns `403 Forbidden` if the session role is insufficient for the requested path.

| Path prefix | Required role |
|---|---|
| `/api/superadmin/*` | `super_admin` |
| `/api/admin/stock/*`, `/api/admin/commandes/*` | `admin_stock` or `super_admin` |
| `/api/admin/*` (other) | `admin_produits`, `admin_stock`, or `super_admin` |
| `/api/panier/*`, `/api/commandes/*`, `/api/profil/*` | any authenticated user |

**Frontend — `ProtectedRoute` component**

Reads the user role from `AuthContext` and redirects to `/connexion` (unauthenticated) or the appropriate fallback page (wrong role) before rendering a protected route.

### Password security

- Passwords are hashed with **BCrypt** (jBCrypt 0.4) before being stored. Plain-text passwords are never persisted.
- The `GenerateHash.java` utility can be used to generate BCrypt hashes for seed scripts.

### Password reset flow

1. User submits their email to `POST /api/auth/password-reset` with `{ "step": "request", "email": "..." }`.
2. A time-limited reset code is generated and emailed via JavaMail/SMTP (Gmail App Password).
3. User submits the code and new password to the same endpoint with `{ "step": "reset", "email": "...", "code": "...", "newPassword": "..." }`.

---

## 🚢 Deployment

### Development (local XAMPP — Windows)

Use the automated PowerShell script:

```powershell
# From the project root, after running: mvn clean package
.\DEPLOY.ps1
```

The script: verifies XAMPP installation → creates DB schema → seeds data → copies WAR to Tomcat webapps → optionally builds and copies the React frontend.

### Manual production deployment

1. Build the backend:

```bash
mvn clean package
```

2. Build and embed the frontend into the WAR:

```bash
cd supermarche-frontend
npm install
npm run build
cp -r dist/* ../src/main/webapp/
cd ..
mvn clean package
```

3. Copy the WAR to your Tomcat `webapps/` directory and start Tomcat:

```bash
cp target/supermarche-jee.war $CATALINA_HOME/webapps/
$CATALINA_HOME/bin/startup.sh
```

4. Application available at: `http://your-server:8080/supermarche-jee`

### Production configuration checklist

- [ ] Update `DatabaseConfig.java` with production MySQL credentials
- [ ] Update `EmailUtil.java` with a valid SMTP Gmail App Password
- [ ] Change all default admin passwords after first login
- [ ] Enable SSL/TLS on Tomcat (HTTPS)
- [ ] Set a strong MySQL password for the application user
- [ ] Consider creating a dedicated MySQL user (not `root`) for the app
- [ ] Set `useSSL=true` in the JDBC URL for production MySQL

---

## 🐛 Troubleshooting

**`MySQL Driver introuvable` on Tomcat startup**
Make sure `mysql-connector-java-8.0.33.jar` is present inside the WAR's `WEB-INF/lib/`. Run `mvn clean package` to rebuild.

**`401 Unauthorized` on all API requests**
The session cookie is not being sent. In development, ensure the Vite proxy is running (`npm run dev`) and the frontend is accessed via `http://localhost:5173` — not directly via port 8080.

**`403 Forbidden` when accessing admin routes**
The logged-in account's `role` does not match the required role for that route. Verify the account role in the `utilisateur` table.

**CORS errors in the browser console**
In production, `CorsFilter.java` may need updating to whitelist your actual frontend origin. Check the `Access-Control-Allow-Origin` header.

**Email not being sent**
`EmailUtil.java` contains placeholder credentials. Replace `SMTP_EMAIL` and `SMTP_PASSWORD` with a valid Gmail address and a [Gmail App Password](https://support.google.com/accounts/answer/185833). 2-Step Verification must be enabled on the Gmail account.

**Tomcat returns 404 on `/supermarche-jee`**
The WAR has not been deployed. Check that `supermarche-jee.war` is in Tomcat's `webapps/` directory and that Tomcat has finished starting up (check `logs/catalina.out`).

**`stock alerte` or stock not updating after checkout**
Checkout uses a `FOR UPDATE` lock in `CommandeDAO`. If a deadlock occurred, the transaction was rolled back. Check the MySQL error log and ensure the `stock` table exists and is populated.

**Frontend shows blank page after `npm run build` + WAR deploy**
Ensure the contents of `dist/` were copied into `src/main/webapp/` **before** running `mvn clean package`. The WAR must include the built static assets.

---

## 🔮 Future Improvements

- **Externalize configuration** — Move database credentials and SMTP settings to environment variables or a `.properties` file read at runtime, instead of hardcoded Java constants.
- **Connection pooling** — Replace `DriverManager.getConnection()` in `DatabaseConfig` with a connection pool (HikariCP or DBCP2) for production-grade performance.
- **JWT or token-based auth** — Replace session cookies with stateless JWT tokens to support horizontal scaling and mobile clients.
- **Pagination on all list endpoints** — Currently some endpoints return unbounded lists; add cursor or page-based pagination.
- **Image storage** — Move uploaded product and profile images to an object storage service (S3, Cloudinary) instead of the local filesystem.
- **Unit and integration tests** — The `src/test/` directory is empty. Add JUnit tests for DAOs and servlet logic.
- **Docker support** — Add a `Dockerfile` and `docker-compose.yml` to containerize Tomcat + MySQL for reproducible environments.
- **Audit logging** — Extend `historique_stock` to a general admin action log covering product and user changes.
- **Real payment integration** — Replace the `a_la_livraison` / `carte` / `paypal` placeholders with a real payment gateway (Stripe, PayPal SDK).
- **Internationalization (i18n)** — The backend sends French-language error messages; externalize strings to support multiple locales.

---

<div align="center">

Built as a Java EE academic project · No license specified

</div>
