# Read before starting this epic:
- `CLAUDE.md` — data models, API conventions, roles
- Relevant skill files noted per task

---

## Final Acceptance Checklist

**Auth**
- [ ] Wrong password → `401`
- [ ] No token → `401`
- [ ] Customer token on admin endpoint → `403`
- [ ] Admin login → `/admin`; refresh → still there

**Admin: Products**
- [ ] Create product with 2 images → appears in table
- [ ] Edit price → table shows new price
- [ ] Toggle inactive → disappears from `/catalog`
- [ ] Reorder images → first becomes primary

**Admin: Categories**
- [ ] 5 seeded categories in grid
- [ ] Create new → appears immediately
- [ ] Delete with products → error shown

**Admin: Orders**
- [ ] Placed order appears in list
- [ ] Search by email works
- [ ] Pending tab filters correctly
- [ ] Status update → toast, no crash

**Customer: Catalog & Cart**
- [ ] `/catalog` loads active products
- [ ] Category filter → URL updates, results filter
- [ ] Add to Cart → badge increments
- [ ] Cart persists on refresh
- [ ] Quantity change → subtotal updates
- [ ] Remove item → gone from drawer

**Customer: Checkout**
- [ ] Place order → confirmation page
- [ ] Confirmation shows correct items + total
- [ ] Cart badge = 0 after order
- [ ] Customer email received
- [ ] Admin email received

**Stock Guard**
- [ ] Add more than stock → `400`
- [ ] Set stock=0 via DB → drawer warning shown

**Services**
- [ ] `systemctl status shop-backend` → active
- [ ] `systemctl status shop-frontend` → active
- [ ] Reboot → both restart automatically
- [ ] `POST /api/orders/1/pay` → `501`