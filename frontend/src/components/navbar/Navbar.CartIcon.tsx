import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/features/cart/api/cartApi';
import { useUiStore } from '@/store/uiStore';

export default function NavbarCartIcon() {
  const setOpen = useUiStore((s) => s.setCartDrawerOpen);
  const { data } = useQuery({ queryKey: ['cart'], queryFn: cartApi.getCart });
  const count = data?.item_count ?? 0;

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open cart"
      className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
