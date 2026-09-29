# Smart Disaster Relief — Resource Allocation & Inventory Tracker

A production-style full-stack web application for disaster relief resource management.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
Diasester/
├── backend/          ← Spring Boot application
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/disasterrelief/
│           │   ├── config/         ← SecurityConfig, DataSeeder
│           │   ├── controller/     ← REST controllers
│           │   ├── dto/            ← Request/Response DTOs
│           │   ├── entity/         ← JPA entities
│           │   ├── exception/      ← Global exception handler
│           │   ├── repository/     ← Spring Data repositories
│           │   ├── security/       ← JWT utils, filters
│           │   └── service/        ← Business logic layer
│           └── resources/
│               └── application.properties
└── frontend/         ← React application
    ├── src/
    │   ├── components/   ← Reusable UI components
    │   ├── context/      ← Auth context
    │   ├── hooks/        ← Custom hooks
    │   ├── pages/        ← All page components
    │   └── services/     ← API service layer
    └── package.json
```

---

## Setup Instructions

### 1. Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8
- Node.js 18+

### 2. Database Setup
```sql
CREATE DATABASE disaster_relief_db;
```
> The application auto-creates tables on first run (`spring.jpa.hibernate.ddl-auto=update`)

### 3. Configure Database Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: http://localhost:8080

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Administrator | `admin` | `admin123` |
| Logistics Officer | `logistics1` | `password123` |
| Camp Representative | `camp_rep1` | `password123` |

---

## Features

- ✅ Disaster Campaign Management
- ✅ Relief Hub Management with Map
- ✅ Camp & Recipient Management
- ✅ Product Master & Inventory Tracking
- ✅ Automatic Low Stock Alerts (CRITICAL < 15%, LOW < 30%)
- ✅ Supplier Management
- ✅ Purchase Order Workflow (Draft → Pending → Approved → Received)
- ✅ Auto inventory update on PO receipt
- ✅ Resource Request System with SOS
- ✅ Dispatch Management with inventory deduction
- ✅ Campaign Budget Tracking
- ✅ Fund Account Management
- ✅ Double-entry Journal & Ledger
- ✅ Reports: Inventory, PO, Dispatch, Budget, Balance Sheet, P&L
- ✅ Notification Center
- ✅ Audit Log
- ✅ Role-based access control (ADMIN / LOGISTICS_OFFICER / CAMP_REPRESENTATIVE)

---

## End-to-End Workflow

```
DISASTER CAMPAIGN
    ↓
CAMP CREATED & ASSIGNED
    ↓
CAMP REQUESTS RESOURCES (or SOS)
    ↓
ADMIN REVIEWS → APPROVES
    ↓
IF STOCK INSUFFICIENT: CREATE PURCHASE ORDER
    ↓  SUPPLIER DELIVERS → INVENTORY AUTO-UPDATED
DISPATCH CREATED
    ↓
IN-TRANSIT → STOCK AUTO-DEDUCTED
    ↓
DELIVERY CONFIRMED
    ↓
REPORTS & LEDGER UPDATED
```
