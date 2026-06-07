# Read before starting this epic:
- `CLAUDE.md` — data models, API conventions, roles
- Relevant skill files noted per task

---

## Epic 3 — Customer Catalog

### Task 3.1 — Cart API
Cart ID: UUID in httpOnly cookie `cart_id` (SameSite=Lax, 7-day max-age)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cart` | Hydrates from DB: returns `{items:[{product_id, name, price, stock_quantity, quantity, image_url, variant_id}], item_count, subtotal}` |
| POST | `/api/cart/items` | `{product_id, variant_id?, quantity}`; validate stock; increment if item exists |
| PUT | `/api/cart/items/{product_id}` | `{quantity}`; 0 = remove |
| DELETE | `/api/cart/items/{product_id}` | Remove item |
| DELETE | `/api/cart` | Clear all |

- **Done when**:
  ```bash
  curl -c /tmp/c.txt -b /tmp/c.txt -X POST http://localhost:8000/api/cart/items \
    -H "Content-Type: application/json" -d '{"product_id":1,"quantity":2}' # → 200
  curl -b /tmp/c.txt http://localhost:8000/api/cart  # → item_count:2, subtotal correct
  curl -b /tmp/c.txt http://localhost:8000/api/cart  # → same (Redis persisted)
  curl -b /tmp/c.txt -X POST http://localhost:8000/api/cart/items \
    -H "Content-Type: application/json" -d '{"product_id":1,"quantity":9999}' # → 400
  ```

### Task 3.2 — Order API
**`POST /api/orders`** — no auth:
Body: `{customer_name, customer_email, customer_phone, shipping_address: {line1, line2?, city, postal_code, country}, notes?}`

Steps in one transaction:
1. Read cart from Redis via `cart_id` cookie
2. Empty cart → `400 {"detail": "Cart is empty"}`
3. Each item: `SELECT ... FOR UPDATE`; insufficient stock → `400 {"detail": "'{name}' only has X in stock"}`
4. Generate order_number: `ORD-{YYYY}-{zero-padded count}`
5. INSERT Order + OrderItems (snapshot name, sku, price)
6. UPDATE stock (decrement)
7. Clear cart from Redis
8. After commit: `asyncio.create_task()` for customer confirmation email + admin notification email
9. Return `201` with full order + items

**`GET /api/orders/{order_number}`** — no auth; `?email=` must match `customer_email` else `403`

**Admin:**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/orders` | `status`, `search` (order_number+email+name ilike), `sort` (newest\|oldest), `page`, `limit=20` |
| GET | `/api/admin/orders/{id}` | Full order + items |
| PUT | `/api/admin/orders/{id}/status` | `{status?, payment_status?, notes?}` |

- **Done when**:
  ```bash
  curl -b /tmp/c.txt -X POST http://localhost:8000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"customer_name":"Jane","customer_email":"jane@test.com","customer_phone":"123","shipping_address":{"line1":"Main St 1","city":"Skopje","postal_code":"1000","country":"MK"}}' # → 201 ORD-XXXX-XXXX

  curl -b /tmp/c.txt http://localhost:8000/api/cart # → item_count:0
  curl "http://localhost:8000/api/orders/ORD-2024-0001?email=jane@test.com" # → full order
  curl http://localhost:8000/api/admin/orders -H "Authorization: Bearer $TOKEN" # → includes the order
  # two emails received
  ```

### Task 3.3 — Customer UI Shell
- `Navbar`: logo, Home/Catalog links, cart icon with item count badge (reads from React Query `['cart']` cache), Login/Register or user name + logout
- `Footer`: shop name, category links, contact email
- **Done when**: navbar renders on all pages; cart badge shows correct count after adding item

### Task 3.4 — Homepage
`/`:
- **Hero**: min-height 60vh, headline + "Shop Now" → `/catalog`
- **Featured Products**: `GET /api/products?featured=true&limit=8`; horizontal scroll row; hidden if no featured products
- **Categories**: `GET /api/categories`; grid of cards linking to `/catalog?category={slug}`
- **New Arrivals**: `GET /api/products?sort=newest&limit=8`; product card grid

`<ProductCard>` component (reused everywhere):
```
[image — aspect-square, object-cover; hover shows images[1] if exists]
[category badge — top-left overlay]
[name — 2 lines max, ellipsis]
[price — compare_at_price struck through if present]
["Out of Stock" overlay OR "Add to Cart" button]
```
- **Done when**: hero, category grid (5 items), new arrivals all render with real data


### Task 3.4.1 — UI Component Library & Base Styling
**Read section 17 of FRONTEND_SKILL.md before starting.**

This task applies the design system to the entire frontend. Do not skip — all subsequent tasks depend on these components.

**Step 0 — Logo:**
- Logo file: `public/Handmade-by-Caci-logo.png` (already placed there by user)
- Use in Navbar: `<img src="/Handmade-by-Caci-logo.png" alt="Handmade by Caci" className="h-10 w-auto" />`
- Use in Footer: same image, `className="h-8 w-auto"`
- Never use a text fallback if the image fails — the logo is always present

**Step 1 — Configure Tailwind and fonts:**
- Update `tailwind.config.js` with custom colors, fonts, animations from FRONTEND_SKILL.md section 17
- Replace contents of `src/index.css` with the base styles from section 17 (Google Fonts import + Tailwind directives + base layer)

**Step 2 — Create shared UI components in `src/components/ui/`:**

`Button.tsx` — props: `variant` (primary|secondary|ghost|danger), `size` (sm|md|lg), `isLoading`, `disabled`, `onClick`, `type`, `children`
- primary: `bg-primary hover:bg-primary-dark text-white`
- secondary: `border border-primary text-primary hover:bg-primary-light`
- ghost: `text-gray-600 hover:text-gray-900 hover:bg-gray-100`
- danger: `bg-red-500 hover:bg-red-600 text-white`
- all: `rounded-md active:scale-95 transition-all duration-150`
- isLoading: shows `<Spinner />` inline, disables button

`Input.tsx` — props: `label`, `error`, `placeholder`, `type`, `value`, `onChange`, `required`
- Style: `border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`
- Shows red border + error message below if `error` prop set

`Badge.tsx` — props: `variant` (success|error|warning|info|muted), `children`
- success: `bg-green-100 text-green-800`
- error: `bg-red-100 text-red-800`
- warning: `bg-yellow-100 text-yellow-800`
- info: `bg-blue-100 text-blue-800`
- muted: `bg-gray-100 text-gray-600`
- all: `rounded-full px-2.5 py-0.5 text-xs font-medium`

`Spinner.tsx` — simple animated ring, size prop (sm|md|lg), color defaults to primary

`Modal.tsx` — props: `isOpen`, `onClose`, `title`, `children`
- Backdrop: `fixed inset-0 bg-black/40 z-50`
- Panel: `bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto mt-20`
- Close button top-right
- Trap focus, close on backdrop click

`SkeletonCard.tsx` — mimics ProductCard dimensions, `animate-pulse`, grey placeholder blocks for image + text lines

**Step 3 — Update these specific already-built files to use the design system:**

Files to update — replace raw `<button>` with `<Button>`, raw `<input>` with `<Input>`, apply card/font/color styles:
- `src/layouts/AdminLayout.tsx` — apply `bg-white shadow-sm` to sidebar, `font-heading` to logo
- `src/layouts/MainLayout.tsx` — `bg-white` background
- `src/components/navbar/Navbar.tsx` — `bg-white shadow-sm`, `font-heading` to logo/brand name
- `src/components/navbar/Navbar.MobileMenu.tsx` — replace any raw buttons with `<Button variant="ghost">`
- `src/components/footer/Footer.tsx` — `bg-surface` background, `font-heading` to footer brand name
- `src/features/admin/dashboard/DashboardPage.tsx` — `font-heading` to page title, `bg-white rounded-md shadow-sm` to stat cards
- `src/features/admin/products/pages/AdminProductsPage.tsx` — replace all raw `<button>` with `<Button>`, `<SkeletonCard>` for loading rows
- `src/features/admin/products/pages/AdminProductFormPage.tsx` — replace all raw `<input>/<textarea>` with `<Input>`, raw `<button>` with `<Button>`
- `src/features/admin/products/components/ProductForm.tsx` — replace all raw `<input>/<textarea>/<select>` with `<Input>`, raw `<button>` with `<Button>`
- `src/features/admin/categories/pages/AdminCategoriesPage.tsx` — replace raw `<button>` with `<Button>`, apply `bg-white rounded-md shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200` to category cards
- `src/features/admin/categories/components/CategoryModal.tsx` — replace with `<Modal>` wrapper, raw `<input>` with `<Input>`, raw `<button>` with `<Button>`
- `src/features/catalog/components/ProductCard/index.tsx` — apply `bg-white rounded-md shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200`
- `src/features/catalog/components/ProductCard/ProductCard.Actions.tsx` — replace raw `<button>` with `<Button variant="primary">`
- `src/features/catalog/components/ProductCard/ProductCard.Info.tsx` — `font-heading` to product name, `text-primary` to price
- `src/features/catalog/pages/HomePage.tsx` — `font-heading` to section headings, `bg-surface` to alternate sections

- **Done when**:
  - `http://localhost:5173` shows blush pink colors, Cormorant Garamond headings
  - All buttons are rounded-md with hover/active animations
  - Product cards lift on hover with shadow
  - No raw unstyled HTML buttons or inputs visible anywhere

### Task 3.5 — Catalog Page
`/catalog`:
- Sidebar (desktop, 260px sticky) / bottom-sheet drawer (mobile, "Filters" button):
  - Categories: checkbox list
  - Price: Min/Max number inputs
  - Sort: radio buttons (Newest, Price ↑, Price ↓)
  - Clear filters button
- Filters reflected in URL params; filter change → update URL → new API fetch
- Product grid: 3 col desktop / 2 tablet / 1 mobile; uses `<ProductCard>`
- Loading: 12 skeleton cards (`animate-pulse`)
- Empty: "No products found" + "Clear filters"
- Pagination: 24 per page, Prev/Next + page indicator
- **Done when**:
  - Visit `/catalog` → all active products
  - Check Jewelry → URL `/catalog?category=jewelry`, filtered results
  - Clear filters → all products return

### Task 3.6 — Product Detail Page
`/products/{slug}` — 404 → redirect to `/catalog`:
- Desktop: left = image gallery; right = product info
- Gallery: large primary image + thumbnail row (click to swap)
- Info: breadcrumb, name (h1), price + compare_at_price struck through, stock badge (red/orange/green), description (dangerouslySetInnerHTML), SKU, variant `<select>` if variants exist, quantity stepper (max = stock_quantity), Add to Cart button (disabled if OOS, spinner on click, toast on success)
- **Done when**:
  - All fields render
  - Add to Cart → toast + cart badge increments
  - Out of stock → button disabled, red badge

### Task 3.7 — Cart Drawer & Checkout
**Cart Drawer** (right slide-in, `z-50`, full-width on mobile):
- Items: image (60×60), name, variant, price, qty stepper, × remove
- Stock warning row if `available_quantity < quantity`
- Footer: subtotal, "We'll confirm your order by email", "Go to Checkout" button
- Empty state: "Your cart is empty" + "Browse Catalog"

**`/checkout`** — redirect to `/catalog` if cart empty:
- Left: form (Full Name, Email, Phone, Address Line 1, Address Line 2 optional, City, Postal Code, Country default "MK", Notes optional)
- Right: readonly order summary (items, total)
- Place Order → `POST /api/orders`; spinner + disable during request
- `201` → `/order-confirmation/{order_number}`
- `400` → show `detail` message above form

**`/order-confirmation/{order_number}`**:
- Fetch `GET /api/orders/{order_number}?email={email}` (email from sessionStorage)
- Show: checkmark, "Order placed!", order number, item list, total, shipping address, "Continue Shopping" → `/catalog`
- **Done when**:
  1. Add to cart → drawer shows item
  2. Change qty → subtotal updates
  3. Checkout → fill form → submit → confirmation page
  4. Cart badge = 0; two emails received

---