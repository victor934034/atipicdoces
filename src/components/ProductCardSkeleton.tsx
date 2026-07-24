export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col animate-pulse">
      <div className="w-full aspect-square bg-mint-50" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-8 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}
