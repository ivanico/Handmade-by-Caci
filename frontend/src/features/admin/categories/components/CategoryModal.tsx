import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCategoriesApi, type Category } from '../api/adminCategoriesApi';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Props = {
  isOpen: boolean;
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
};

export default function CategoryModal({ isOpen, category, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [nameMk, setNameMk] = useState(category?.name_mk ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [descriptionMk, setDescriptionMk] = useState(category?.description_mk ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const saved = isEdit
        ? await adminCategoriesApi.update(category!.id, {
            name,
            name_mk: nameMk || null,
            description: description || null,
            description_mk: descriptionMk || null,
          })
        : await adminCategoriesApi.create({
            name,
            name_mk: nameMk || null,
            description: description || null,
            description_mk: descriptionMk || null,
          });
      if (imageFile) {
        await adminCategoriesApi.uploadImage(saved.data.id, imageFile);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Save failed');
      setSubmitting(false);
    }
  };

  const textareaClass =
    'w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('admin.editCategory') : t('admin.newCategoryHeading')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('admin.categoryName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label={t('admin.categoryNameMk')}
          value={nameMk}
          onChange={(e) => setNameMk(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.categoryDescription')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.categoryDescriptionMk')}</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={descriptionMk}
            onChange={(e) => setDescriptionMk(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.image')}</label>
          {isEdit && category?.image_url && (
            <div className="mb-2">
              <div
                style={{ width: 64, height: 64 }}
                className="rounded border border-border overflow-hidden bg-gray-100"
              >
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${category.image_url}`}
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('admin.currentImage')}</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            {imageFile ? imageFile.name : isEdit ? t('admin.replaceImage') : t('admin.chooseImage')}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="submit" variant="primary" isLoading={submitting}>
            {t('admin.save')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
