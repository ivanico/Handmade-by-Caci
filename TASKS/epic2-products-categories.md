# Read before starting this epic:
- `CLAUDE.md` — data models, API conventions, roles
- Relevant skill files noted per task

---

## Epic 2 — Admin: Products & Categories

### Task 2.1 — Category API
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/categories` | none | All `is_active=true`, each with `product_count` |
| GET | `/api/categories/{slug}` | none | 404 if not found or inactive |
| POST | `/api/admin/categories` | admin | `{name, description?, parent_id?}`; slug auto-generated |
| PUT | `/api/admin/categories/{id}` | admin | Partial update, any field except id/slug |
| DELETE | `/api/admin/categories/{id}` | admin | Sets `is_active=false`; if active products exist → `400 {"detail": "Category has X active products"}` |
| POST | `/api/admin/categories/{id}/image` | admin | Multipart; save to `{MEDIA_DIR}/categories/{id}.{ext}`; return `{image_url}` |

- **Done when**:
  ```bash
  curl http://localhost:8000/api/categories # → 5 seeded categories with product_count

  curl -X POST http://localhost:8000/api/admin/categories \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"name":"New Category"}' # → 201 with slug="new-category"

  # delete category with no products → 200
  # delete category with products → 400
  ```

### Task 2.2 — Product API
**Public:**

| Method | Path | Query params |
|--------|------|-------------|
| GET | `/api/products` | `category` (slug), `search` (ilike name+description), `sort` (newest\|price_asc\|price_desc\|featured), `page`, `limit` (max 48), `featured` (bool) |
| GET | `/api/products/{slug}` | — |

List response per item: `{id, name, slug, price, compare_at_price, is_featured, stock_quantity, category:{id,name,slug}, primary_image:{url,alt_text}}`
Single response: same + `images`, `variants`, `description`, `sku`, `is_active`

**Admin:**

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/admin/products` | `{name, category_id, description?, price, compare_at_price?, sku, stock_quantity, is_featured?, is_active?}` |
| PUT | `/api/admin/products/{id}` | Partial update |
| DELETE | `/api/admin/products/{id}` | Soft delete: `is_active=false` |
| POST | `/api/admin/products/{id}/images` | Multipart `files[]` up to 8; resize to max 1200px wide via Pillow; first upload = primary if no existing primary |
| DELETE | `/api/admin/products/{id}/images/{image_id}` | Delete file from disk + DB row |
| PUT | `/api/admin/products/{id}/images/reorder` | `{order: [image_id, ...]}` — sets sort_order by index; first = `is_primary=true` |

- **Done when**:
  ```bash
  PROD=$(curl -s -X POST http://localhost:8000/api/admin/products \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"name":"Gold Ring","category_id":1,"price":49.99,"sku":"GR-001","stock_quantity":10}')
  SLUG=$(echo $PROD | python3 -c "import sys,json; print(json.load(sys.stdin)['slug'])")
  ID=$(echo $PROD | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

  curl http://localhost:8000/api/products/$SLUG           # → full product object
  curl -X PUT http://localhost:8000/api/admin/products/$ID \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"price":39.99}'                                  # → updated product
  curl -X DELETE http://localhost:8000/api/admin/products/$ID \
    -H "Authorization: Bearer $TOKEN"                     # → 200
  curl http://localhost:8000/api/products/$SLUG           # → 404
  ```

### Task 2.3 — Admin Stats Endpoint
`GET /api/admin/stats` returns:
```json
{ "total_products": 0, "active_orders": 0, "low_stock_count": 0, "total_revenue": 0.00 }
```
- `total_products`: COUNT `is_active=true`
- `active_orders`: COUNT status NOT IN `('delivered','cancelled')`
- `low_stock_count`: COUNT `stock_quantity < 5 AND is_active=true`
- `total_revenue`: SUM `total_amount` where `payment_status='paid'`
- All in one DB round-trip
- **Done when**: `curl http://localhost:8000/api/admin/stats -H "Authorization: Bearer $TOKEN"` → correct JSON shape

### Task 2.4 — Admin Dashboard UI
- `/admin` layout: fixed left sidebar (240px) — links: Dashboard, Products, Categories, Orders; logged-in user name + Logout button
- Dashboard index: 4 stat cards from `/api/admin/stats`; refetch every 30s
- **Done when**:
  - Sidebar visible, 4 stat cards show real numbers
  - Change data in DB directly → numbers update within 30s

### Task 2.5 — Product Management UI
`/admin/products` table: image thumbnail (48×48), Name, SKU, Category, Price, Stock, Status badge, Actions (Edit / Toggle active / Delete)
- Search: debounce 300ms
- Delete: `window.confirm` → API call → refetch
- Toggle active: `PUT` with `{is_active: !current}` → update row in place
- Pagination: Prev / Page N of N / Next

`/admin/products/new` and `/admin/products/{id}/edit` — same `ProductForm` component:
- Fields: Name (slug preview below), Category `<select>`, Description `<textarea rows={6}>`, Price, Compare At Price (optional), SKU, Stock Quantity, Is Featured toggle, Is Active toggle
- Image section: click-to-upload, 120×120 grid preview, up/down reorder buttons, delete per image
- On new product: image upload available after first save
- Save → redirect to `/admin/products`; Cancel → back to list
- **Done when**:
  - Create product → appears in table
  - Edit price → table shows new price
  - Upload 2 images → both in grid
  - Delete product → row removed

### Task 2.6 — Category Management UI
`/admin/categories`: grid of cards (image/placeholder, name, product_count, Edit, Delete)
- Create/Edit via modal (not new page): Name, Description, Image upload
- Delete: confirm dialog; show API error message if 400
- **Done when**:
  - 5 seeded categories visible
  - Create → appears in grid immediately
  - Delete category with products → error message shown

---