import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProductsApi, categoriesApi, type CreateProductData } from '../api/adminProductsApi';
import ProductForm from '../components/ProductForm';

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminProductsApi.getById(Number(id)).then((r) => r.data),
    enabled: isEdit,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const handleSave = async (data: CreateProductData) => {
    const res = isEdit
      ? await adminProductsApi.update(Number(id), data)
      : await adminProductsApi.create(data);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    if (!isEdit) {
      navigate(`/admin/products/${res.data.id}/edit`);
    } else {
      navigate('/admin/products');
    }
    return res.data;
  };

  if (isEdit && productLoading) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-heading text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>
      <ProductForm
        product={product}
        categories={categories}
        onSave={handleSave}
        onCancel={() => navigate('/admin/products')}
        onImagesChanged={() =>
          queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
        }
      />
    </div>
  );
}
