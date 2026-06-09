# Frontend Skill — Shop CMS

This skill defines the code standards, folder structure, and architectural conventions for the Shop CMS frontend. Always follow these rules when generating or modifying any frontend code.

---

## 1. Code Quality

### Formatting & Indentation

* Use **2-space indentation** consistently across all files.
* One statement per line.
* Avoid nested ternaries.
* Avoid inline ternaries that exceed ~80 characters.
* Trailing commas in multi-line objects, arrays, and function parameters.
* Single quotes for strings unless the string contains a single quote.
* Always use TypeScript.
* Explicitly type all public APIs, component props, hook returns, and service responses.
* Never use `any`. Use proper types, interfaces, or generics.

### DRY Principle (Do Not Repeat Yourself)

* Extract any logic used more than once into a shared utility, hook, or service.
* Never copy-paste blocks of JSX.
* Extract repeated UI into reusable components.
* Constants (strings, numbers, URLs, routes, keys) belong in a dedicated `constants/` file.
* Never hardcode reusable values inline.
* Shared types/interfaces live in `types/` and are imported where needed.

### Naming Conventions

* Components: `PascalCase`
* Hooks: `useCamelCase`
* API functions: `camelCase`
* Zustand stores: `camelCase` + Store suffix
* Constants: `UPPER_SNAKE_CASE`
* Utility functions: `camelCase`
* Types and interfaces: `PascalCase`
* Files should match the primary export name.

Example:

```ts
ProductCard.tsx
useProducts.ts
productsApi.ts
authStore.ts
APP_ROUTES.ts
```

---

## 2. Component Architecture

### Modular, Decomposed Components

* Each component must have a single responsibility.
* If a component renders more than ~100 lines of JSX, split it into subcomponents.
* Prefer composition over large monolithic components.
* Business logic should not live inside UI components.

Example:

```text
components/
└── ProductCard/
    ├── index.tsx
    ├── ProductCard.Image.tsx
    ├── ProductCard.Info.tsx
    └── ProductCard.Actions.tsx

components/
└── CartDrawer/
    ├── index.tsx
    ├── CartDrawer.Item.tsx
    └── CartDrawer.Footer.tsx

components/
└── AdminOrderTable/
    ├── index.tsx
    ├── AdminOrderTable.Row.tsx
    ├── AdminOrderTable.Filters.tsx
    └── AdminOrderTable.Pagination.tsx

components/
└── Navbar/
    ├── index.tsx
    ├── Navbar.CartIcon.tsx
    └── Navbar.MobileMenu.tsx
```

### Component Responsibilities

#### index.tsx

* Composes subcomponents.
* Receives data from hooks/pages.
* Contains minimal logic.

#### Subcomponents

* Render UI only.
* No API calls.
* No side effects.

### Props

* Always define a `Props` type at the top of the file.
* Never use implicit prop typing.
* Avoid prop drilling deeper than 2 levels.
* Use context or Zustand when data is shared deeply.

Example:

```ts
type Props = {
  product: Product;
  onAddToCart: (productId: number) => void;
};
```

---

## 3. Folder Structure

```text
src/
├── api/                # axios client only
│   └── client.ts
├── components/         # shared reusable UI components
│   ├── ui/             # primitive components (Button, Input, Badge, Spinner)
│   ├── navbar/
│   ├── footer/
│   └── common/         # shared composites (SkeletonCard, ErrorBoundary, Toast)
├── features/           # feature modules
│   ├── auth/
│   │   ├── pages/
│   │   ├── api/
│   │   └── components/
│   ├── catalog/
│   │   ├── pages/
│   │   ├── api/
│   │   └── components/
│   ├── cart/
│   │   ├── api/
│   │   └── components/
│   ├── checkout/
│   │   ├── pages/
│   │   └── components/
│   └── admin/
│       ├── dashboard/
│       ├── products/
│       ├── categories/
│       └── orders/
├── hooks/              # shared hooks used across multiple features
├── layouts/            # page shell components
│   ├── MainLayout.tsx
│   └── AdminLayout.tsx
├── routes/             # routing concerns only
│   ├── ProtectedRoute.tsx
│   └── AuthProvider.tsx
├── store/              # zustand stores — UI/auth state only, not server data
│   ├── authStore.ts
│   └── uiStore.ts
├── constants/
├── types/
└── utils/
```

### Folder Rules

| Folder | Allowed | Not Allowed |
|--------|---------|-------------|
| `api/` | axios client instance only | API calls, business logic |
| `components/` | shared UI used across features | Feature-specific UI, API calls |
| `features/` | pages, API calls, components scoped to one feature | Shared/reusable UI |
| `hooks/` | shared stateful logic used across features | JSX, feature-specific logic |
| `layouts/` | page shell, nav slot, footer slot | Business logic, API calls |
| `routes/` | ProtectedRoute, AuthProvider | UI components |
| `store/` | Zustand for auth + UI state | Server data (use React Query) |
| `constants/` | Shared constants | Logic |
| `types/` | Shared interfaces/types | Business logic |
| `utils/` | Pure helper functions | React hooks |

### Feature module structure
Each feature folder follows the same internal shape:
```text
features/catalog/
├── pages/
│   └── CatalogPage.tsx
├── api/
│   └── catalogApi.ts
└── components/
    └── ProductCard/
        ├── index.tsx
        ├── ProductCard.Image.tsx
        ├── ProductCard.Info.tsx
        └── ProductCard.Actions.tsx
```
- `pages/` — route-level components, assemble layout, call hooks
- `api/` — typed axios functions for this feature, import `client` from `src/api/client.ts`
- `components/` — UI components only used within this feature

---

## 4. Hooks

### All Stateful Logic Lives in Hooks

Any logic involving:

* useState
* useEffect
* useMemo
* useCallback
* useRef
* Event handlers
* Side effects
* Data fetching

must live in `hooks/`.

### Hook Naming

```ts
useProducts.ts
useProductDetail.ts
useCategories.ts
useCart.ts
useCheckout.ts
useAuth.ts
useAdminProducts.ts
useAdminOrders.ts
useToast.ts
```

### Hook Guidelines

* Return only what consumers need.
* Keep APIs minimal.
* Encapsulate side effects.
* Keep components focused on rendering.

Example:

```ts
export function useProducts(params: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    productsApi
      .getProducts(params)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [params]);

  return {
    products,
    loading,
  };
}
```

---

## 5. API Layer (`api/`)

One file per backend domain. These are plain async functions — no React, no state.

```ts
api/
├── client.ts          # axios instance with interceptors
├── authApi.ts
├── productsApi.ts
├── categoriesApi.ts
├── cartApi.ts
└── ordersApi.ts
```

### API Function Shape

```ts
import { client } from './client';
import { Product, ProductListResponse, ProductQueryParams } from '../types/product';

export async function getProducts(
  params: ProductQueryParams,
): Promise<ProductListResponse> {
  const { data } = await client.get('/api/products', { params });

  return data;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product> {
  const { data } = await client.get(`/api/products/${slug}`);

  return data;
}
```

### API Rules

* One file per domain.
* No React imports.
* No component state.
* No UI concerns.
* Always return typed responses.
* Always use `client` from `api/client.ts`.

---

## 6. Global HTTP Client (`api/client.ts`)

### Single Source of HTTP Configuration

All HTTP traffic must go through:

```text
api/client.ts
```

### Responsibilities

* Attach auth tokens.
* Global error handling.
* Retry on 401 with refresh token.
* Common headers.

Example:

```ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { APP_ROUTES } from '../constants/routes';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const { data } = await client.post('/api/auth/refresh');
        useAuthStore.getState().setToken(data.access_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return client(error.config);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = APP_ROUTES.LOGIN;
      }
    }

    return Promise.reject(error);
  },
);
```

### Rules

* Never use `fetch` directly.
* Never create additional HTTP clients.
* Never duplicate auth logic.

---

## 7. Pages (`pages/`)

### Page Responsibilities

Pages should:

* Assemble layout.
* Connect hooks to components.
* Handle route parameters.

Pages should NOT:

* Perform raw API calls.
* Contain large business logic.
* Manage complex side effects.

```ts
pages/
├── HomePage.tsx
├── CatalogPage.tsx
├── ProductDetailPage.tsx
├── CheckoutPage.tsx
├── OrderConfirmationPage.tsx
├── LoginPage.tsx
├── RegisterPage.tsx
└── admin/
    ├── AdminDashboardPage.tsx
    ├── AdminProductsPage.tsx
    ├── AdminProductFormPage.tsx
    ├── AdminCategoriesPage.tsx
    ├── AdminOrdersPage.tsx
    └── AdminOrderDetailPage.tsx
```

Example:

```ts
import { ProductGrid } from '../components/ProductGrid';
import { CatalogSidebar } from '../components/CatalogSidebar';
import { useProducts } from '../hooks/useProducts';
import { useCatalogFilters } from '../hooks/useCatalogFilters';

export default function CatalogPage() {
  const { filters, setFilter } = useCatalogFilters();
  const { products, loading } = useProducts(filters);

  return (
    <div className='flex gap-6'>
      <CatalogSidebar filters={filters} onChange={setFilter} />
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
```

---

## 8. State Management

### Zustand Stores (`store/`)

```ts
store/
├── authStore.ts    # user, token, setAuth, setToken, logout
└── uiStore.ts      # cartDrawerOpen, mobileMenuOpen
```

Use Zustand for state consumed by multiple features that is not server data:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth' },
  ),
);
```

### Local State

Use component state only for:

* UI toggles.
* Form values.
* Temporary display state.

### Rules

* Avoid unnecessary global state.
* Keep state as close as possible to its consumers.
* Derived state should be computed, not stored.
* Server data (products, orders, cart items) lives in hooks — not in Zustand.

---

## 9. Constants (`constants/`)

### Rules

* No hardcoded routes.
* No hardcoded API paths.
* No hardcoded labels used multiple times.
* No magic numbers.

```ts
// constants/routes.ts
export const APP_ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: (slug: string) => `/products/${slug}`,
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: (orderNumber: string) => `/order-confirmation/${orderNumber}`,
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    PRODUCT_NEW: '/admin/products/new',
    PRODUCT_EDIT: (id: number) => `/admin/products/${id}/edit`,
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    ORDER_DETAIL: (id: number) => `/admin/orders/${id}`,
  },
} as const;

// constants/ui.ts
export const ITEMS_PER_PAGE = 24;
export const ADMIN_ITEMS_PER_PAGE = 20;
export const LOW_STOCK_THRESHOLD = 5;
export const TOAST_DURATION_MS = 3000;
export const DEBOUNCE_MS = 300;
export const SEARCH_DEBOUNCE_MS = 400;
```

---

## 10. Types (`types/`)

### Rules

* Shared types belong in `types/`.
* Avoid duplicate interfaces.
* Reuse existing types before creating new ones.
* Prefer explicit domain models.

```ts
// types/product.ts
export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
};

// types/common.ts
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
};
```

---

## 11. Utilities (`utils/`)

### Rules

Utilities must be:

* Pure functions.
* Stateless.
* Reusable.

```ts
// utils/formatters.ts
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('mk-MK', {
    style: 'currency',
    currency: 'MKD',
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('mk-MK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// utils/slug.ts
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// utils/cn.ts — for conditional Tailwind classes
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

## 12. Tailwind Usage

* No inline `style` props — use Tailwind classes only.
* Extract repeated class combinations into a component, not a CSS file.
* Use `cn()` for conditional classes:

```tsx
<button className={cn('px-4 py-2 rounded', isLoading && 'opacity-50 cursor-not-allowed')}>
```

---

## 13. Comments & Documentation

### Avoid Inline Comments

Do not add comments that explain obvious code behavior.

Bad:

```ts
// Set loading to true
setLoading(true);
```

Good:

```ts
setLoading(true);
```

### Allowed Comments

Comments are allowed only when:

* Explaining a non-obvious business rule.
* Documenting a third-party workaround.
* Explaining a complex algorithm.
* Adding TODOs with context.

Example:

```ts
// Cart must be merged before setting auth state so the navbar count is correct on redirect.
await cartApi.mergeCarts(guestCartId, userId);
```

### Generated Code Rules

* Do not generate unnecessary comments.
* Do not add file header comments.
* Do not add section separator comments.
* Do not add JSX comments.
* Prefer clear naming over comments.

---

## 14. Performance

### Rules

* Memoize expensive computations.
* Avoid unnecessary re-renders.
* Lazy-load large features.
* Use code splitting where appropriate.
* Avoid inline object creation inside JSX when reusable.
* Avoid inline functions when passed repeatedly to deeply nested children.

---

## 15. Testing Mindset

### Rules

Code should be structured to be testable:

* Business logic in hooks/api/utils.
* Components focused on rendering.
* Avoid tightly coupling API logic to UI.
* Prefer dependency boundaries that are easy to mock.

---

## 16. Review Checklist

Before finalizing any code, verify:

* [ ] Uses 2-space indentation
* [ ] No duplicated logic
* [ ] Logic extracted into hooks/api/utils where appropriate
* [ ] Component responsibility is clear
* [ ] JSX split into subcomponents when large
* [ ] All stateful logic lives in hooks
* [ ] No raw API calls in pages/components
* [ ] All API calls use `api/client.ts`
* [ ] Props explicitly typed
* [ ] No `any` types
* [ ] Shared types live in `types/`
* [ ] Constants extracted
* [ ] No hardcoded reusable values
* [ ] No unnecessary comments
* [ ] Clear naming instead of explanatory comments
* [ ] API functions return typed responses
* [ ] Folder structure respected
* [ ] Code follows DRY principles
* [ ] Business logic separated from UI
* [ ] Performance considerations applied where needed
* [ ] Tailwind only — no inline styles
* [ ] `cn()` used for conditional classes

---

## 17. Design System

### Colors
```
Primary:     #ffb3bf  (blush pink)
Primary light: #ffecf1 (pale rose)
Primary dark:  #e8909f (deeper rose for hover states)
Text:        #1a1a1a  (near black)
Text muted:  #6b7280  (gray-500)
Background:  #ffffff
Surface:     #fff5f7  (very light pink tint for cards/sections)
Border:      #ffd6de  (soft pink border)
Success:     #10b981
Error:       #ef4444
Warning:     #f59e0b
```

Add to `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#ffb3bf',
        light: '#ffecf1',
        dark: '#e8909f',
      },
      surface: '#fff5f7',
      border: '#ffd6de',
    },
    fontFamily: {
      heading: ['Cormorant Garamond', 'serif'],
      body: ['Raleway', 'sans-serif'],
    },
  },
}
```

Add to `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Raleway:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Raleway', sans-serif;
    color: #1a1a1a;
    background-color: #ffffff;
  }
  h1, h2, h3, h4 {
    font-family: 'Cormorant Garamond', serif;
  }
}
```

### Border Radius
- Cards: `rounded-md` (6px)
- Buttons: `rounded-md` (6px)
- Inputs: `rounded-md` (6px)
- Badges: `rounded-full`
- Modals: `rounded-lg`
- Never use `rounded-xl` or larger except for image containers

### Shadows
- Cards at rest: `shadow-sm`
- Cards on hover: `shadow-md`
- Modals/drawers: `shadow-xl`
- Navbar: `shadow-sm`

### Animations
- Card hover lift: `hover:-translate-y-1 hover:shadow-md transition-all duration-200`
- Button press: `active:scale-95 transition-transform duration-100`
- Page transitions: `animate-fadeIn` (define in tailwind config)
- Drawer slide-in: `transition-transform duration-300`
- Skeleton pulse: `animate-pulse`

Add to `tailwind.config.js` under `extend`:
```js
animation: {
  fadeIn: 'fadeIn 0.2s ease-in-out',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0', transform: 'translateY(4px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
```

### Shared UI Components (`src/components/ui/`)
These must exist and be used everywhere — never write raw HTML buttons, inputs, or badges:

| Component | Usage |
|-----------|-------|
| `Button.tsx` | All buttons — variants: primary, secondary, ghost, danger |
| `Input.tsx` | All text inputs |
| `Badge.tsx` | Status badges — variants: success, error, warning, info, muted |
| `Spinner.tsx` | Loading spinner |
| `Modal.tsx` | All modals/dialogs |
| `SkeletonCard.tsx` | Product card skeleton loader |

### Button variants
```tsx
// primary — blush pink bg, white text
className="bg-primary hover:bg-primary-dark text-white rounded-md px-4 py-2 active:scale-95 transition-all duration-150"

// secondary — outline style
className="border border-primary text-primary hover:bg-primary-light rounded-md px-4 py-2 transition-all duration-150"

// ghost — no border, subtle hover
className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-4 py-2 transition-all duration-150"

// danger — for delete actions
className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 active:scale-95 transition-all duration-150"
```

### Review additions
* [ ] Colors match design system — no arbitrary color values
* [ ] Fonts use heading/body classes correctly
* [ ] Cards use `shadow-sm` + `hover:-translate-y-1 hover:shadow-md transition-all duration-200`
* [ ] All buttons use `Button.tsx` component — no raw `<button>` with inline styles
* [ ] All inputs use `Input.tsx` component
* [ ] All badges use `Badge.tsx` component
* [ ] Border radius follows the scale — `rounded-md` for cards/buttons
