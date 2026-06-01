## 1.

In a production QDC system with thousands of orders and concurrent users, I would replace the in-memory `ORDERS` array with a persistent database and redesign the data access layer into a repository/DAO layer. Specific changes:

- Use a relational database (Postgres) for strong consistency and ACID transactions for order/garment updates, or a document DB (MongoDB) if the domain favors flexible schemas (e.g., variable garment metadata).
- Introduce entities/models: `Order`, `Garment`, `Customer`, `Location`, `Payment` with indexes on frequently queried fields (order id, createdAt, status).
- Implement a repository layer (e.g., TypeORM/Prisma) that exposes atomic operations and optimistic concurrency (version column) for concurrent updates.
- Move business logic from controllers into services with clear transaction boundaries; use background jobs/queues (Bull, RabbitMQ) for long-running tasks like billing or notification.
- Add pagination, filtering, and projection at the DB query level for performance.

These changes ensure durability, scalability, predictable performance, and safe concurrent updates.

## 2.

Returning `Order | { error: string }` mixes data and error shapes and forces client-side checks for an `error` key. Tradeoffs:

- Simplicity: easy to implement for small demos.
- Ambiguity: clients must branch on response shape; status codes may still be 200, hiding errors from HTTP semantics and intermediaries.
- Validation: it's easy to overlook consistency when reusing the same HTTP status.

Improvement:

- Use proper HTTP status codes: 404 for not found, 400 for bad requests, 5xx for server errors. In NestJS throw `NotFoundException` (as implemented) and rely on HTTP error responses with structured error bodies (e.g., `{ error: { code, message, details } }`).
- Define OpenAPI/Swagger contract and DTOs so clients and servers agree on response shapes.

## 3.

For a growing frontend dashboard:

- Centralize API calls in a data layer (e.g., `api/orders.ts`) with typed client functions: `listOrders(params)`, `getOrder(id)`, `createOrder(body)`, `updateGarmentStatus(...)`.
- Use a client-side data-fetching/caching library like React Query or SWR to handle caching, background refetch, optimistic updates, pagination, and loading/error states.
- Separate UI components (presentation) from container components (data fetching) — keep `OrdersList` purely presentational and let a parent container provide data and callbacks.
- Add typed shared models (TypeScript interfaces) and reuse DTO types to avoid drift.
- Organize feature folders (e.g., `features/orders/`) and centralize common UI elements (filters, paginators) to encourage reuse.

This keeps the code testable, decoupled, and scalable.

## 4.

Missing fields / edge cases with current `Order`/`Garment` types:

- No `customerId`/account linking — only `customerName` string.
- No `price`/`billing` or `payment` information.
- No `location`/`storeId` for multi-location setups.
- No `history`/`events` to track status changes (audit trail).
- No `estimatedReadyAt` or SLA timestamps, or `priority` for rush items.
- No `assignedTo` (operator or machine), `processingNotes`, or `tags` for special-care items.

Evolve domain model:

- Add `Customer` entity with contact and loyalty info.
- Add `Garment` metadata (care instructions, SKU, price, flags). Store `statusHistory: { status, by, at }[]` for audit.
- Add `Order` fields: `storeId`, `paymentStatus`, `totalAmount`, `deliveryInfo`.
- Introduce small value objects for `Address`, `Money` to avoid primitive obsession.

## 5.

Risks of relying on AI-generated code:

- Incorrect assumptions about domain/edge cases, insecure defaults, or missing validation.
- Non-idiomatic patterns that confuse maintainers; subtle bugs or inefficient code.
- Overconfidence: reviewers may miss defects if they assume the AI "got it right."

Review/debugging practices:

- Run static analysis (linters, type checks) and unit tests immediately. Require peer code review and pair-programming for critical paths.
- Add targeted unit tests for edge cases and property-based tests where appropriate.
- Use runtime monitoring and feature flags to roll out gradually.

## 6.

To add near real-time updates:

- Option 1 (recommended for UX): Add WebSockets (Socket.IO) or Server-Sent Events for push notifications from the server when a garment's status changes. Emit minimal events (orderId, garmentId, newStatus) so clients update the local cache.
- Option 2 (easier): Use Webhook / Pub-Sub + polling with short intervals or use React Query's background refetch for the dashboard.

Tradeoffs:

- Push (WebSocket): real-time, low-latency UX but adds operational complexity (stateful connections, scaling, security). Use a message broker (Redis pub/sub) and socket servers behind a scaling layer.
- Polling: simpler to implement and horizontally scalable but can be less real-time and more resource-intensive at scale.


---

