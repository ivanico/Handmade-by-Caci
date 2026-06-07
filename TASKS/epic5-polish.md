# Read before starting this epic:
- `CLAUDE.md` — data models, API conventions, roles
- Relevant skill files noted per task

---

## Epic 5 — Polish & Edge Cases

### Task 5.1 — Loading & Error States
- Skeleton loaders: 12 cards for product list, 5 rows for order table, 4 cards for admin stats (`animate-pulse`)
- `ErrorBoundary` wraps router: "Something went wrong" + "Reload" button
- Toast system (no external library): fixed top-right `z-50`, auto-dismiss 3s, stack vertically
  - success: `bg-green-50 border border-green-200 text-green-800`
  - error: `bg-red-50 border border-red-200 text-red-800`
  - info: `bg-primary-light border border-primary text-gray-800`
  - all: `rounded-md shadow-md px-4 py-3 text-sm animate-fadeIn`
  - dismiss animation: fade out over 300ms before removing from DOM
- Toast triggers: add to cart, order placed, admin save/delete/status update
- 404 page: "Page not found" + "Go Home"
- Empty states: catalog no results, empty cart drawer, admin no orders
- **Done when**:
  - Kill backend → catalog shows skeletons then error (not blank)
  - Add to cart → green toast, fades after 3s

### Task 5.2 — Responsive Fixes
All pages usable at 375px:
- Navbar: hamburger → fullscreen overlay
- Catalog: sidebar → "Filters" bottom sheet; 1-column grid
- Product detail: gallery stacks above info
- Cart drawer: `w-full`
- Checkout: single column
- Admin tables: `overflow-x-auto`
- Admin sidebar: hamburger toggle
- **Done when**: resize to 375px — no horizontal overflow, all elements reachable

### Task 5.3 — Stock Guard
- `GET /api/cart` response includes per-item `available_quantity: int`
- Cart drawer: yellow banner + highlighted row if `available_quantity < quantity`
- `POST /api/orders`: stock changed since cart built → `400 {"detail":"'{name}' only has X in stock"}` → shown above checkout form
- **Done when**:
  - Set `stock_quantity=0` via DB → open drawer → warning shown
  - Attempt checkout → 400 error in form, not a crash

### Task 5.4 — Payment Stub
```python
@router.post('/api/orders/{order_id}/pay')
async def pay_order(order_id: int):
    # TODO: wire Stripe or PayPal here
    raise HTTPException(status_code=501, detail='Online payment not yet available')
```
- Order pages show payment_status badge only — no "Pay Now" button
- **Done when**: `curl -X POST http://localhost:8000/api/orders/1/pay` → `501`

### Task 5.5 — systemd Services + README
`/etc/systemd/system/shop-backend.service`:
```ini
[Unit]
Description=Shop Backend (FastAPI)
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=shop
WorkingDirectory=/home/vboxuser/Handmade-by-Caci/backend
EnvironmentFile=/home/vboxuser/Handmade-by-Caci/backend/.env
ExecStart=~/Handmade-by-Caci/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```
`/etc/systemd/system/shop-frontend.service`:
```ini
[Unit]
Description=Shop Frontend (Vite Preview)
After=network.target

[Service]
Type=simple
User=shop
WorkingDirectory=/home/vboxuser/Handmade-by-Caci/frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
`~/Handmade-by-Caci/README.md`:
```
1. Clone repo to /srv/shop
2. sudo -u postgres createuser shop && sudo -u postgres createdb shopdb -O shop
3. cp backend/.env.example backend/.env && nano backend/.env
4. cp frontend/.env.example frontend/.env
5. cd backend && python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
6. alembic upgrade head
7. python seed.py
8. cd ../frontend && npm install
9. sudo systemctl daemon-reload && sudo systemctl enable --now shop-backend shop-frontend
10. http://localhost:5173  —  admin: admin@shop.com / admin123
```
- **Done when**: both `systemctl status` → active; reboot VM → both restart automatically

---