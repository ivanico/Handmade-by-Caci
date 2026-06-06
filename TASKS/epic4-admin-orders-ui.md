# Read before starting this epic:
- `CLAUDE.md` — data models, API conventions, roles
- Relevant skill files noted per task

---

## Epic 4 — Admin Orders UI

### Task 4.1 — Orders Management UI
`/admin/orders`:
- Search (debounce 400ms): order_number + customer_name + email
- Status tabs: All | Pending | Confirmed | Processing | Shipped | Delivered | Cancelled
- Sort toggle: Newest ↔ Oldest
- Table: Order #, Customer Name, Email, Date (`DD/MM/YYYY HH:mm`), Items count, Total, Status badge, Payment badge, Actions
- Badge colours — status: pending=yellow, confirmed=blue, processing=purple, shipped=indigo, delivered=green, cancelled=red; payment: unpaid=red, paid=green, refunded=grey
- Click row → `/admin/orders/{id}`; pagination 20 per page

`/admin/orders/{id}`:
- Back link preserves search params
- Section 1: Customer name, email, phone, full shipping address
- Section 2: Items table (Name | SKU | Unit Price | Qty | Subtotal) + Total footer
- Section 3: Status `<select>`, Payment Status `<select>`, Notes `<textarea>`, "Save Changes" button → `PUT /api/admin/orders/{id}/status`; success toast
- **Done when**:
  - Place order → appears in list within 1 refresh
  - Search by email → only matching orders
  - Filter Pending tab → correct results
  - Click row → all details visible
  - Change status + save → toast shown

---