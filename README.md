# 🛒 L'Épicerie Moderne — Supermarché JEE

> A full-stack online supermarket application built with **Java EE (Servlets)** on the backend and **React + Vite** on the frontend, backed by **MySQL**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Features](#-features)
  - [Client Features](#-client-features)
  - [Admin Features](#-admin-features)
  - [Super Admin Features](#-super-admin-features)
- [API Endpoints](#-api-endpoints)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [Option A — Automated (PowerShell / XAMPP)](#option-a--automated-powershell--xampp)
  - [Option B — Manual Setup](#option-b--manual-setup)
- [Running the Application](#-running-the-application)
- [Database Migrations](#-database-migrations)
- [Environment Configuration](#-environment-configuration)
- [Security](#-security)
- [Default Admin Accounts](#-default-admin-accounts)
- [License](#-license)

---

## 🌐 Overview

**L'Épicerie Moderne** is a complete e-commerce platform for an online supermarket. It supports a full customer shopping workflow (browsing, cart management, checkout with promo codes, order tracking) and a multi-role administration panel (product management, stock control, promotions, order fulfillment, and user management).

---

## 🧰 Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| ☕ Backend    | Java 11, Java EE 4 (Servlets), Apache Tomcat 9          |
| ⚛️ Frontend   | React 19, Vite 8, Tailwind CSS 4, React Router 7        |
| 🗄️ Database   | MySQL 8 (via XAMPP or standalone)                       |
| 🔨 Build tool | Maven 3 (WAR packaging)                                 |
| 📦 JSON       | Google Gson 2.10                                        |
| 🔐 Security   | jBCrypt (password hashing), HTTP-only session cookies   |
| 📊 Charts     | Recharts 3                                              |
| 🌐 HTTP       | Axios 1.15                                              |

---

## 🏗️ Architecture

```
Browser (React SPA)
       │
       │  HTTP/JSON (proxied by Vite dev server → localhost:8080)
       ▼
Apache Tomcat 9  (/supermarche-jee)
       │
   AuthFilter ──► role-based access control
   CorsFilter ──► cross-origin headers
       │
  Servlets (REST-style JSON API)
       │
    DAO Layer (JDBC)
       │
   MySQL 8  (database: supermarche_jee)
```

The frontend is a **single-page application** that communicates with the Java backend via JSON REST-style endpoints. In development, Vite proxies all `/supermarche-jee/*` requests to `http://localhost:8080`. In production, the built React app is served as static files inside the Tomcat webapp.

---

## 📁 Project Structure

```
supermarche-jee/
├── pom.xml                          # Maven build descriptor
├── schema_complet.sql               # Full database schema (run once)
├── SETUP_COMPLET.sql                # Schema + seed data combined
├── migration_001.sql                # Add photo_profil column
├── migration_002.sql                # Add promo code columns to commande
├── seed*.sql                        # Various seed data scripts
├── DEPLOY.ps1                       # One-click deployment script (XAMPP/Windows)
├── GenerateHash.java                # Utility to generate bcrypt hashes
│
├── src/main/java/com/supermarche/
│   ├── config/
│   │   └── DatabaseConfig.java      # JDBC connection factory
│   ├── model/                       # Plain Java models (entities)
│   │   ├── Utilisateur.java
│   │   ├── Client.java
│   │   ├── Administrateur.java
│   │   ├── Produit.java
│   │   ├── Categorie.java
│   │   ├── Stock.java
│   │   ├── HistoriqueStock.java
│   │   ├── Panier.java
│   │   ├── PanierProduit.java
│   │   ├── Commande.java
│   │   ├── LigneCommande.java
│   │   ├── Paiement.java
│   │   ├── Promotion.java
│   │   └── CodePromo.java
│   ├── dao/                         # Data Access Objects (JDBC)
│   │   ├── UtilisateurDAO.java
│   │   ├── ClientDAO.java
│   │   ├── AdminDAO.java
│   │   ├── ProduitDAO.java
│   │   ├── CategorieDAO.java
│   │   ├── StockDAO.java
│   │   ├── PanierDAO.java
│   │   ├── CommandeDAO.java         # ACID transaction: checkout
│   │   ├── PromotionDAO.java
│   │   └── CodePromoDAO.java
│   ├── filter/
│   │   ├── AuthFilter.java          # Session-based auth + role guard
│   │   └── CorsFilter.java          # CORS headers
│   ├── servlet/
│   │   ├── auth/
│   │   │   ├── ConnexionServlet.java
│   │   │   ├── InscriptionServlet.java
│   │   │   ├── DeconnexionServlet.java
│   │   │   └── MeServlet.java
│   │   ├── client/
│   │   │   ├── ProduitsServlet.java
│   │   │   ├── CategoriesServlet.java
│   │   │   ├── PanierServlet.java
│   │   │   ├── CommandeServlet.java
│   │   │   └── ProfilServlet.java
│   │   ├── admin/
│   │   │   ├── AdminProduitServlet.java
│   │   │   ├── AdminCategorieServlet.java
│   │   │   ├── AdminStockServlet.java
│   │   │   ├── AdminCommandeServlet.java
│   │   │   ├── AdminClientServlet.java
│   │   │   ├── AdminPromotionServlet.java
│   │   │   ├── AdminCodePromoServlet.java
│   │   │   └── SuperAdminServlet.java
│   │   ├── CodePromoServlet.java
│   │   ├── PromotionsPublicServlet.java
│   │   ├── UploadServlet.java
│   │   └── TestDbServlet.java
│   └── util/
│       ├── JsonUtil.java
│       ├── PasswordUtil.java
│       └── FixDB.java
│
├── src/main/webapp/
│   └── WEB-INF/web.xml              # Servlet config, session (30 min timeout)
│
└── supermarche-frontend/            # React SPA
    ├── package.json
    ├── vite.config.js               # Proxy: /supermarche-jee → :8080
    └── src/
        ├── App.jsx                  # Router + route guards
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   └── ToastContext.jsx
        ├── components/
        │   ├── ClientNavbar.jsx
        │   ├── AdminSidebar.jsx
        │   ├── Footer.jsx
        │   ├── Modal.jsx
        │   ├── ConfirmModal.jsx
        │   ├── SkeletonCard.jsx
        │   ├── SkeletonList.jsx
        │   ├── FormSelect.jsx
        │   └── AdminFilterBar.jsx
        └── pages/
            ├── HomePage.jsx
            ├── CataloguePage.jsx
            ├── ProductDetailsPage.jsx
            ├── CartPage.jsx
            ├── CheckoutPage.jsx
            ├── OrderConfirmationPage.jsx
            ├── ClientOrdersPage.jsx
            ├── ProfilePage.jsx
            ├── PromotionsPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── AboutPage.jsx
            ├── FaqPage.jsx
            ├── ContactPage.jsx
            ├── NotFoundPage.jsx
            └── admin/
                ├── AdminDashboardPage.jsx
                ├── AdminProductsPage.jsx
                ├── AdminCategoriesPage.jsx
                ├── AdminStockPage.jsx
                ├── AdminOrdersPage.jsx
                ├── AdminClientsPage.jsx
                ├── AdminPromotionsPage.jsx
                ├── SuperAdminPage.jsx
                └── dashboards/
                    ├── SuperAdminDashboard.jsx
                    ├── AdminProduitsDashboard.jsx
                    ├── AdminStockDashboard.jsx
                    └── SharedComponents.jsx
```

---

## 🗄️ Database Schema

The MySQL database `supermarche_jee` contains the following tables:

| Table                    | Description                                         |
|--------------------------|-----------------------------------------------------|
| 👤 `utilisateur`         | All users (clients + admins). Role-based enum.      |
| 🙋 `client`              | Client-specific profile data (address, CIN, etc.)   |
| 🛡️ `administrateur`      | Admin type (`super`, `produits`, `stock`)           |
| 🗂️ `categorie`           | Hierarchical product categories (self-referencing)  |
| 📦 `produit`             | Products with price, image, and category            |
| 📊 `stock`               | One-to-one with `produit`; tracks quantity & status |
| 📜 `historique_stock`    | Audit log of all stock movements                    |
| 🛒 `panier`              | Active shopping cart per client                     |
| 🧾 `panier_produit`      | Cart line items                                     |
| 📋 `commande`            | Orders with status, address, promo code, discount   |
| 🔖 `ligne_commande`      | Order line items with price snapshot                |
| 💳 `paiement`            | Payment records linked to orders                    |
| 🏷️ `promotion`           | Time-bound percentage discounts on products         |
| 🎟️ `code_promo`          | Promo codes with usage limits and validity periods  |

---

## 👥 User Roles & Permissions

| Role                  | Access                                                                 |
|-----------------------|------------------------------------------------------------------------|
| 🙋 `client`           | Browse catalogue, manage cart, checkout, view orders, edit profile     |
| 📦 `admin_produits`   | Manage products, categories, promotions, promo codes                   |
| 📊 `admin_stock`      | Manage stock levels, view and update orders                            |
| 👑 `super_admin`      | Full access: all above + manage admin accounts, view all clients       |

Role enforcement happens at two levels:
- 🔒 **Backend**: `AuthFilter.java` guards all `/api/admin/*`, `/api/superadmin/*`, `/api/panier/*`, `/api/commandes/*`, and `/api/profil/*` routes.
- 🔒 **Frontend**: `ProtectedRoute` component in `App.jsx` redirects unauthorized users.

---

## ✨ Features

### 🛍️ Client Features

- 🏠 **Home page** — Featured products, promotions banner, category highlights
- 📂 **Catalogue** — Browse all products with category filtering and search
- 🔍 **Product details** — Full description, price, stock status, add to cart
- 🛒 **Shopping cart** — Add/remove/update quantities, real-time total
- 💳 **Checkout** — Address input, payment method selection, promo code application
- ✅ **Order confirmation** — Summary page after successful order
- 📋 **My orders** — Full order history with status tracking
- 👤 **Profile** — Update personal info, change password, upload profile photo
- 🏷️ **Promotions page** — View all active promotions
- ❓ **FAQ & Contact** — Static informational pages

### 🛠️ Admin Features

- 📊 **Dashboard** — Overview with metrics charts (Recharts)
- 📦 **Products** — Create, edit, deactivate products; upload product images
- 🗂️ **Categories** — Manage hierarchical categories
- 📈 **Stock** — Update stock levels, view alert/rupture status, stock history
- 📋 **Orders** — View all orders, update order status
- 👥 **Clients** — View client list, suspend/reactivate accounts
- 🏷️ **Promotions** — Create and manage percentage-based promotions per product
- 🎟️ **Promo Codes** — Generate codes with discount %, usage limit, and validity dates

### 👑 Super Admin Features

- All admin features above
- 🔧 Manage administrator accounts (create, edit, delete)
- 📊 Full access to all system areas via dedicated Super Admin dashboard

---

## 🔌 API Endpoints

All backend endpoints are prefixed with `/supermarche-jee`.

### 🔑 Authentication (`/api/auth/`)

| Method | Path                      | Description               |
|--------|---------------------------|---------------------------|
| POST   | `/api/auth/connexion`     | Login (creates session)   |
| POST   | `/api/auth/inscription`   | Register new client       |
| POST   | `/api/auth/deconnexion`   | Logout (destroys session) |
| GET    | `/api/auth/me`            | Get current user info     |

### 🌍 Public (`/api/`)

| Method | Path                         | Description               |
|--------|------------------------------|---------------------------|
| GET    | `/api/produits`              | List products (+ filters) |
| GET    | `/api/categories`            | List categories           |
| GET    | `/api/promotions`            | Active promotions         |
| POST   | `/api/code-promo/valider`    | Validate a promo code     |

### 🛒 Client — Cart (`/api/panier/`)

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/panier`           | Get current cart         |
| POST   | `/api/panier/ajouter`   | Add item to cart         |
| PUT    | `/api/panier/modifier`  | Update item quantity     |
| DELETE | `/api/panier/supprimer` | Remove item from cart    |

### 📋 Client — Orders (`/api/commandes/`)

| Method | Path                            | Description             |
|--------|---------------------------------|-------------------------|
| POST   | `/api/commandes/passer`         | Place an order (ACID)   |
| GET    | `/api/commandes/mes-commandes`  | Get client's orders     |

### 👤 Client — Profile (`/api/profil/`)

| Method | Path                          | Description          |
|--------|-------------------------------|----------------------|
| GET    | `/api/profil`                 | Get profile          |
| PUT    | `/api/profil/modifier`        | Update profile       |
| PUT    | `/api/profil/mot-de-passe`    | Change password      |
| POST   | `/api/upload`                 | Upload profile photo |

### 🛠️ Admin

All under `/api/admin/*` — GET (list), POST (create), PUT (update), DELETE (delete) for each resource: products, categories, stock, orders, clients, promotions, promo codes.

### 👑 Super Admin

All under `/api/superadmin/*` — full user and admin account management.

---

## ⚙️ Prerequisites

| Requirement        | Version      |
|--------------------|--------------|
| ☕ Java JDK         | 11 or higher |
| 🔨 Maven            | 3.6+         |
| 🐱 Apache Tomcat   | 9.x          |
| 🐬 MySQL            | 8.x          |
| 🟩 Node.js          | 18+          |
| 📦 npm              | 9+           |

> 💡 **Recommended**: [XAMPP](https://www.apachefriends.org/) bundles Apache Tomcat, MySQL, and phpMyAdmin for easy local setup on Windows.

---

## 🚀 Installation & Setup

### Option A — Automated (PowerShell / XAMPP)

A `DEPLOY.ps1` script automates the entire deployment on Windows with XAMPP.

1. Make sure **XAMPP is installed** at `C:\xampp` and both **MySQL** and **Tomcat** are running.
2. Build the WAR file first (see step 3 of Option B).
3. Right-click `DEPLOY.ps1` → **Run with PowerShell**, or run from a terminal:
   ```powershell
   .\DEPLOY.ps1
   ```
4. The script will:
   - ✅ Verify your environment (MySQL, Tomcat)
   - ✅ Create the database schema (`schema_complet.sql`)
   - ✅ Seed initial data (`seed_final.sql`, `seed_admins.sql`)
   - ✅ Copy the WAR to Tomcat's `webapps/` folder
   - ✅ Build and copy the React frontend

---

### Option B — Manual Setup

#### 1️⃣ Clone / Extract the project

```bash
unzip supermarche-jee.zip
cd supermarche-jee
```

#### 2️⃣ Set up the database

Start your MySQL server, then run:

```sql
-- Create schema and all tables
source schema_complet.sql;

-- Seed products and categories
source seed_final.sql;

-- Seed admin accounts
source seed_admins.sql;

-- Seed promotions (optional)
source seed_promotions.sql;
```

Or use the all-in-one file:

```bash
mysql -u root -p < SETUP_COMPLET.sql
```

#### 3️⃣ Configure the database connection

Edit `src/main/java/com/supermarche/config/DatabaseConfig.java`:

```java
private static final String URL      = "jdbc:mysql://127.0.0.1:3306/supermarche_jee?...";
private static final String USER     = "root";        // your MySQL username
private static final String PASSWORD = "";            // your MySQL password
```

#### 4️⃣ Build the backend

```bash
mvn clean package
```

This produces `target/supermarche-jee.war`.

#### 5️⃣ Deploy to Tomcat

Copy the WAR to your Tomcat `webapps/` folder:

```bash
cp target/supermarche-jee.war /path/to/tomcat/webapps/
```

Start (or restart) Tomcat. The app will be available at:
```
http://localhost:8080/supermarche-jee
```

#### 6️⃣ Set up the frontend

```bash
cd supermarche-frontend
npm install
```

For **development** (with Vite proxy to Tomcat):

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

For **production** build (embed in WAR):

```bash
npm run build
# Copy dist/ contents to src/main/webapp/ before running mvn package
```

---

## ▶️ Running the Application

| Mode              | Command                                          | URL                                     |
|-------------------|--------------------------------------------------|-----------------------------------------|
| 🐱 Backend         | Deploy WAR to Tomcat                             | `http://localhost:8080/supermarche-jee` |
| ⚛️ Frontend dev    | `npm run dev` (in `supermarche-frontend/`)       | `http://localhost:5173`                 |
| 📦 Frontend prod   | `npm run build` → embed in WAR                   | Served from Tomcat                      |

---

## 🔄 Database Migrations

If upgrading from an earlier version, run the migration scripts in order:

```bash
# Migration 001 — adds photo_profil column to utilisateur
mysql -u root supermarche_jee < migration_001.sql

# Migration 002 — adds code_promo_utilise and montant_remise to commande
mysql -u root supermarche_jee < migration_002.sql
```

---

## 🔧 Environment Configuration

The only file requiring environment-specific configuration is:

**`src/main/java/com/supermarche/config/DatabaseConfig.java`**

```java
private static final String URL =
    "jdbc:mysql://127.0.0.1:3306/supermarche_jee"
    + "?useSSL=false"
    + "&serverTimezone=UTC"
    + "&allowPublicKeyRetrieval=true"
    + "&useUnicode=true"
    + "&characterEncoding=UTF-8";

private static final String USER     = "root";
private static final String PASSWORD = "";   // set your password here
```

The Vite proxy configuration is in `supermarche-frontend/vite.config.js`:

```js
server: {
  proxy: {
    '/supermarche-jee': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

---

## 🔐 Security

- 🔑 **Passwords** are hashed with **BCrypt** (jBCrypt 0.4) before storage. Plain-text passwords are never persisted.
- 🍪 **Sessions** use HTTP-only cookies with a 30-minute timeout (configured in `web.xml`).
- 🛡️ **AuthFilter** enforces session validation and role-based access on every protected API route.
- ⚛️ **ACID transactions** in `CommandeDAO` ensure consistent stock decrement during checkout using `FOR UPDATE` locks and full rollback on any failure.
- 🌐 **CORS** headers are managed by `CorsFilter` to restrict cross-origin access.

---

## 🔑 Default Admin Accounts

After running `seed_admins.sql`, the following accounts are available:

| Role                        | Email                        | Password    |
|-----------------------------|------------------------------|-------------|
| 👑 `super_admin`            | `superadmin@epicerie.ma`     | `Admin123!` |
| 📦 `admin_produits`         | `produits@epicerie.ma`       | `Admin123!` |
| 📊 `admin_stock`            | `stock@epicerie.ma`          | `Admin123!` |

> ⚠️ **Change these passwords immediately in any non-local environment.**

---

## 📄 License

This project was developed as a Java EE academic/training project. No license is currently specified.
