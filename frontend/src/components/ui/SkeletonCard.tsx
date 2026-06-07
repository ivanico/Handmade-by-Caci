export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-md shadow-sm p-3">
      <div className="h-48 bg-gray-200 rounded-md mb-3" />
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
    </div>
  );
}
