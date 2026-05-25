# Allo Inventory Reservation System

A full-stack inventory reservation system built with Next.js, Prisma, PostgreSQL, and Supabase.

This project solves a specific problem: preventing overselling in multi-warehouse commerce systems when payment confirmation is delayed.

---

## Live Demo

> Add your deployed URL here after deployment.

```
https://your-vercel-url.vercel.app
```

## GitHub Repository

> Add your GitHub repository URL here.

```
https://github.com/your-username/allo-inventory
```

---

## The Problem

Payment confirmation isn't instant. UPI flows, 3DS authentication, wallet redirects, and gateway delays can hold up a transaction for several minutes.

That creates a timing problem:

- Decrement stock only after payment succeeds → multiple users can buy the same item simultaneously
- Decrement stock at add-to-cart → inventory looks unavailable even though most carts never convert

Neither option works cleanly. This app uses a temporary reservation layer instead.

When a user checks out, their inventory is held for a fixed window. It gets confirmed after payment goes through, or released automatically if the window expires.

---

## Tech Stack

**Frontend**
- Next.js App Router
- TypeScript
- Tailwind CSS

**Backend**
- Next.js API Routes
- Prisma ORM

**Database**
- PostgreSQL via Supabase

---

## Features

### Inventory Management

- Products stored across multiple warehouses
- Stock tracked per warehouse with three separate counters: total, reserved, and available
- Available stock is calculated dynamically: `availableStock = totalStock - reservedStock`

### Reservation System

Users can reserve inventory, confirm it after payment, or cancel it. Each reservation carries a quantity, a status, and an expiry time.

Supported statuses: `pending`, `confirmed`, `released`

### Automatic Expiry

A cron-style cleanup endpoint finds expired pending reservations and releases them — returning reserved stock to available and flipping the status to `released`.

### Frontend

- Product listing with per-warehouse stock display
- Reserve button with out-of-stock handling
- Reservation detail page with a live countdown timer
- Confirm purchase flow
- Cancel reservation flow
- Actions disabled after expiry

---

## Database Schema

**Product** — represents a sellable item.

**Warehouse** — represents a physical storage location.

**Inventory** — tracks stock per product per warehouse. Holds `totalStock` and `reservedStock`; available stock is derived from these two.

**Reservation** — tracks a temporary inventory hold. Fields: `quantity`, `status`, `expiresAt`.

---

## Reservation Lifecycle

### 1. Reserve

- Check available stock
- Increment reserved stock
- Create reservation with `pending` status

### 2. Confirm (payment success)

- Reservation status → `confirmed`
- Total stock decrements permanently
- Reserved stock decrements

### 3. Release (cancel or expiry)

- Reservation status → `released`
- Reserved stock decrements
- Total stock unchanged

---

## Concurrency

The main challenge here is preventing overselling when two users hit reserve at the same time. The approach:

- All stock updates run inside a Prisma transaction
- Increments and decrements are atomic

```ts
await prisma.$transaction(async (tx) => {
  // fetch → check → increment → create reservation
})
```

This isn't bulletproof under extreme concurrency — see the tradeoffs section — but it's solid for most real-world traffic.

---

## API Endpoints

### `GET /api/products`

Returns products with warehouse inventory and available stock.

---

### `POST /api/reservations`

Creates a reservation.

**Request body:**
```json
{
  "productId": "string",
  "warehouseId": "string",
  "quantity": 1
}
```

**Responses:**
- `200` — Reservation created
- `409` — Not enough stock

---

### `GET /api/reservations/:id`

Returns reservation details.

---

### `POST /api/reservations/:id/confirm`

Confirms a reservation after payment.

- Decrements total and reserved stock
- Updates status to `confirmed`

**Responses:**
- `200` — Confirmed
- `410` — Reservation expired

---

### `POST /api/reservations/:id/release`

Cancels a reservation and releases reserved stock.

---

### `POST /api/cron/release-expired`

Finds and releases all expired pending reservations. Trigger this on a schedule (Vercel Cron Jobs, a background worker, etc.).

---

## Running Locally

**1. Clone the repo**
```bash
git clone <repo-url>
cd allo-inventory
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file:
```env
DATABASE_URL="your_postgres_connection_url"
```

**4. Generate Prisma client**
```bash
npx prisma generate
```

**5. Push schema to database**
```bash
npx prisma db push
```

**6. Seed the database**
```bash
npx tsx scripts/seed.ts
```

**7. Start the dev server**
```bash
npm run dev
```

---

## Project Structure

```
app/
├── api/
└── reservation/

components/
├── CountdownTimer.tsx
├── ReservationActions.tsx
└── ReserveButton.tsx

lib/
└── prisma.ts

prisma/
└── schema.prisma

scripts/
└── seed.ts
```

---

## Tradeoffs

Prisma transactions with atomic increments work well for this use case and are straightforward to reason about. That said, under very high concurrency, explicit row-level locking (`SELECT FOR UPDATE`) would give stronger guarantees.

Other things that would improve this in production:

- Redis distributed locking
- Idempotency keys
- Authentication
- Optimistic UI updates
- WebSocket-based live stock updates
- Unit and integration tests
- Background job queues

---

## Deployment

Frontend and API: Vercel
Database: Supabase PostgreSQL

---

## Screenshots

> Add screenshots before submission:
> - Homepage
> - Reservation page
> - Countdown timer
> - Confirm flow
> - Cancel flow

---

## Author

Prajyot Kumar
