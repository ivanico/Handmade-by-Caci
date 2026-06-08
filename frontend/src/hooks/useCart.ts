import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/features/cart/api/cartApi';
import { useUiStore } from '@/store/uiStore';

export function useCart() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const addMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantId,
    }: {
      productId: number;
      quantity: number;
      variantId?: number | null;
    }) => cartApi.addItem(productId, quantity, variantId),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      showToast('Added to cart');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.updateItem(productId, quantity),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => cartApi.removeItem(productId),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
  });

  return {
    cart,
    isLoading,
    addItem: (productId: number, quantity: number, variantId?: number | null) =>
      addMutation.mutate({ productId, quantity, variantId }),
    isAdding: addMutation.isPending,
    updateItem: (productId: number, quantity: number) =>
      updateMutation.mutate({ productId, quantity }),
    removeItem: (productId: number) => removeMutation.mutate(productId),
  };
}
