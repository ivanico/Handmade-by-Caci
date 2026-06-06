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
