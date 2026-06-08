import Button from '@/components/ui/Button';

type Props = {
  page: number;
  pages: number;
  onPage: (n: number) => void;
};

export default function AdminOrderTablePagination({ page, pages, onPage }: Props) {
  return (
    <div className="flex items-center gap-3 mt-4 text-sm">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
      >
        Prev
      </Button>
      <span className="text-gray-600">
        Page {page} of {pages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
      >
        Next
      </Button>
    </div>
  );
}
