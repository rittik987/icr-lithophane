export function CartItemSkeleton() {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 flex gap-4 animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#ede5d6] shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          <div className="h-4 bg-[#ede5d6] rounded-md w-3/4" />
          <div className="h-3 bg-[#f2ebdc] rounded-md w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 w-24 bg-[#f2ebdc] rounded-lg" />
          <div className="h-5 w-16 bg-[#ede5d6] rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 animate-pulse space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
        <div className="space-y-1.5">
          <div className="h-3.5 bg-[#ede5d6] rounded-md w-32" />
          <div className="h-2.5 bg-[#f2ebdc] rounded-md w-24" />
        </div>
        <div className="h-6 bg-[#f2ebdc] rounded-full w-20" />
      </div>
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-xl bg-[#ede5d6] shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-[#ede5d6] rounded-md w-2/3" />
          <div className="h-3 bg-[#f2ebdc] rounded-md w-1/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 bg-[#ede5d6] rounded-md w-20" />
        <div className="h-8 bg-[#f2ebdc] rounded-lg w-28" />
      </div>
    </div>
  );
}

export function AddressCardSkeleton() {
  return (
    <div className="bg-white border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 animate-pulse space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#ede5d6] rounded-md w-28" />
        <div className="h-5 bg-[#f2ebdc] rounded-md w-14" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-[#f2ebdc] rounded-md w-full" />
        <div className="h-3 bg-[#f2ebdc] rounded-md w-4/5" />
        <div className="h-3 bg-[#f2ebdc] rounded-md w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-7 bg-[#ede5d6] rounded-lg w-16" />
        <div className="h-7 bg-[#f2ebdc] rounded-lg w-16" />
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      <div className="h-16 border-b border-[#e5ddd0] bg-white/60" />
      <main className="max-w-[800px] mx-auto px-4 py-8 w-full space-y-6">
        <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ede5d6]" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-[#ede5d6] rounded-md w-40" />
              <div className="h-3 bg-[#f2ebdc] rounded-md w-28" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
      </main>
    </div>
  );
}
