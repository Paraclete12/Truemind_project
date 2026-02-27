# Truemind Project
# Chuks Kitchen – Backend API

**Client:** Mr. Chukwudi Okorie (Chuks Kitchen)  
**Built by:** Trueminds Innovations Ltd – Backend Intern  
**Stack:** Node.js · Express · SQLite3 · JWT

---

## System Overview

Chuks Kitchen is a food ordering platform. The backend exposes a REST API that handles:

- **User registration and OTP verification** – customers sign up via email or phone, receive a simulated OTP, and verify to activate their account.
- **JWT-based authentication** – after verification or login, a JSON Web Token is issued and must be sent in the `Authorization: Bearer <token>` header for protected routes.
- **Food/menu management** – public browsing of available food items; admins can add/update items.
- **Cart management** – customers add meals, view their cart, or clear it before placing an order.
- **Order lifecycle** – placing an order from a cart, checking order status, and admins updating status through its full lifecycle.

### Architecture

```
Client (Frontend/Postman)
        │
        ▼
  Express Server (server.js)
        │
   ┌────┴─────┐
   Routes     Middleware (auth, role, error)
   │
   Controllers (business logic)
   │
   Models (SQL queries via SQLite3)
   │
   SQLite Database (chuks_kitchen.db)
```

---

## Setup & Installation

```bash
npm install
node server.js
# Server runs on http://localhost:5000
```

Requires a `.env` file:
```
JWT_SECRET=mysuperstrongsecret123
PORT=5000
```

---

## API Endpoints

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/signup` | Register with email or phone | Public |
| POST | `/api/users/verify` | Verify OTP to activate account | Public |
| POST | `/api/users/login` | Login, receive JWT | Public |

**POST /api/users/signup**
```json
{ "email": "ada@example.com", "phone": "08012345678", "referral_code": "REF123" }
```
Response: `{ userId, otp }` *(OTP is returned for simulation; in production, send via email/SMS)*

**POST /api/users/verify**
```json
{ "userId": 1, "otp": "482910" }
```
Response: `{ token }` *(JWT to use in Authorization header)*

**POST /api/users/login**
```json
{ "email": "ada@example.com" }
```
Response: `{ token, role }`

---

### Foods (`/api/foods`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/foods` | List all available food items | Public |
| POST | `/api/foods` | Add a new food item | Admin JWT |
| PUT | `/api/foods/:id` | Update food item / mark unavailable | Admin JWT |

**POST /api/foods** *(Admin)*
```json
{ "name": "Jollof Rice", "description": "Party jollof", "price": 1500, "image_url": "..." }
```

**PUT /api/foods/:id** *(Admin)*
```json
{ "price": 1800, "is_available": 0 }
```

---

### Cart (`/api/cart`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/cart/add` | Add a meal to cart | Public (userId in body) |
| GET | `/api/cart/:userId` | View cart contents | Public |
| POST | `/api/cart/clear` | Clear entire cart | Public (userId in body) |

**POST /api/cart/add**
```json
{ "userId": 1, "foodId": 2, "quantity": 3 }
```

---

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order from cart | Public (userId in body) |
| GET | `/api/orders/:id` | Get order details & status | Public |
| PUT | `/api/orders/:id/status` | Update order status | Admin JWT |

**POST /api/orders**
```json
{ "userId": 1 }
```
Response: `{ orderId, total, status: "Pending" }`

**PUT /api/orders/:id/status** *(Admin)*
```json
{ "status": "Confirmed" }
```

#### Order Status Lifecycle
```
Pending → Confirmed → Preparing → Out for Delivery → Completed
                                                    ↘ Cancelled
```

---

## Flow Diagrams

### A. User Registration & Verification Flow

```
Customer submits email/phone
        │
        ▼
  Validate input (email or phone required)
        │
   ┌────┴────┐
Already   New user?
exists?      │
   │         ▼
 400      Generate OTP (6-digit)
 Error    Save user (unverified)
          Return { userId, otp }
                │
                ▼
        Customer submits OTP
                │
          ┌─────┴──────┐
        OTP          OTP valid?
       expired/         │
       invalid          ▼
          │       Mark is_verified=1
         400      Issue JWT token
```

**Edge Cases Handled:**
- Duplicate email/phone → `400 User already exists`
- Expired OTP (>5 min) → `400 Invalid or expired OTP`
- Missing both email and phone → `400` validation error
- Login on unverified account → `403 Account not verified`

---

### B. Cart & Ordering Flow

```
Customer adds item to cart
        │
        ▼
  Check food exists & is_available=1
        │
   ┌────┴────┐
Not found  Available
  404         │
              ▼
       Find/create cart for user
              │
              ▼
       Insert cart_item row
       Recalculate cart total
              │
              ▼
       Customer places order (POST /orders)
              │
        Fetch cart items
              │
        Check all still available
              │
   ┌──────────┴──────────┐
Some unavailable       All available
  400 error               │
                    Create order record
                    Copy items to order_items
                    Clear the cart
                    Return { orderId, total }
```

**Edge Cases Handled:**
- Item becomes unavailable after added to cart → `400` with list of unavailable food IDs
- Empty cart on checkout → `400 Cart is empty`
- Cart not found → `404`
- Updating a Completed/Cancelled order status → `400` blocked

---

## Data Model

### Entity Relationship Diagram

```
USERS
  id, email, phone, referral_code, otp, otp_expires_at, is_verified, role, created_at, updated_at

FOODS
  id, name, description, price, is_available, image_url, created_at, updated_at

CARTS
  id, user_id (FK→users), total_amount, created_at, updated_at

CART_ITEMS
  id, cart_id (FK→carts), food_id (FK→foods), quantity, price

ORDERS
  id, user_id (FK→users), total_amount, status, payment_status, created_at, updated_at

ORDER_ITEMS
  id, order_id (FK→orders), food_id (FK→foods), quantity, price

RATINGS
  id, user_id (FK→users), food_id (FK→foods), rating (1–5), comment, created_at
```

**Relationships:**
- One User → many Carts (one active), Orders, Ratings
- One Cart → many CartItems; each CartItem references a Food
- One Order → many OrderItems; each OrderItem references a Food
- Prices are stored on CartItem and OrderItem to preserve historical pricing

---

## Assumptions

1. No real email/SMS provider is integrated — OTP is returned in the API response for simulation.
2. Authentication is not required on cart/order creation endpoints (userId is sent in request body) — in production, `req.user.id` from JWT would be used instead.
3. Payment logic is assumed complete (no payment gateway integrated).
4. Referral code is stored but not validated against an existing user — assumed as optional metadata.
5. A customer has one active cart at a time; placing an order clears the cart.

---

## Scalability Thoughts

| Concern | At 100 users | At 10,000+ users |
|---------|-------------|-----------------|
| Database | SQLite (fine) | Migrate to PostgreSQL or MySQL with connection pooling |
| Auth | JWT stateless (fine) | Add token refresh, Redis blacklist for logout |
| Cart storage | DB rows (fine) | Consider Redis for session-speed cart reads |
| OTP delivery | Simulated | Integrate Twilio (SMS) / SendGrid (email) |
| Order status updates | Polling | Add WebSockets or push notifications |
| API performance | Single server (fine) | Horizontal scaling with load balancer, cluster mode |
| File uploads (food images) | image_url string | Use Cloudinary or AWS S3 |
