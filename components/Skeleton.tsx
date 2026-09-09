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

export function HeaderAuthSkeleton() {
  return (
    <div className="w-20 h-7 rounded-full bg-[#ede5d6] animate-pulse hidden lg:block" />
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0] h-16" />
      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 animate-pulse space-y-4 shadow-xs">
              <div className="h-5 bg-[#ede5d6] rounded-md w-40" />
              <div className="space-y-3 pt-2">
                <div className="h-10 bg-[#f2ebdc] rounded-xl w-full" />
                <div className="h-10 bg-[#f2ebdc] rounded-xl w-full" />
                <div className="h-10 bg-[#f2ebdc] rounded-xl w-full" />
              </div>
            </div>
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 animate-pulse space-y-4 shadow-xs">
              <div className="h-5 bg-[#ede5d6] rounded-md w-36" />
              <div className="h-20 bg-[#f2ebdc] rounded-xl w-full" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 animate-pulse space-y-5 shadow-xs">
              <div className="h-5 bg-[#ede5d6] rounded-md w-32" />
              <div className="space-y-3 border-b border-[#f0e8dc] pb-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-[#f2ebdc] rounded w-20" />
                  <div className="h-4 bg-[#f2ebdc] rounded w-16" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-[#f2ebdc] rounded w-24" />
                  <div className="h-4 bg-[#f2ebdc] rounded w-12" />
                </div>
              </div>
              <div className="h-12 bg-[#ede5d6] rounded-xl w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#FAF9F6]/90 border-b border-[#EAE4DC] h-16" />
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-6">
        <div className="bg-white border border-[#e5ddd0] rounded-2xl p-6 animate-pulse space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-[#f0e8dc]">
            <div className="space-y-2">
              <div className="h-6 bg-[#ede5d6] rounded-md w-48" />
              <div className="h-3.5 bg-[#f2ebdc] rounded-md w-32" />
            </div>
            <div className="h-7 bg-[#f2ebdc] rounded-full w-24" />
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-20 bg-[#f2ebdc] rounded-xl w-full" />
            <div className="h-20 bg-[#f2ebdc] rounded-xl w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function CustomizeSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Fixed header skeleton */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[rgba(250,247,242,0.96)] border-b border-[#e5ddd0] h-16">
        <div className="flex items-center justify-between h-16 px-4 max-w-2xl mx-auto">
          <div className="w-8 h-8 rounded-lg bg-[#ede5d6] animate-pulse" />
          <div className="w-24 h-5 rounded-md bg-[#ede5d6] animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-[#ede5d6] animate-pulse" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="pt-20 pb-32 px-4 max-w-lg mx-auto w-full flex flex-col gap-6 lg:max-w-2xl lg:px-8">
        {/* Template selector card skeleton */}
        <div className="bg-white border border-[#e5ddd0] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 animate-pulse shadow-xs">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-[#ede5d6] shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#ede5d6] rounded-md w-3/4" />
              <div className="h-3.5 bg-[#f2ebdc] rounded-md w-1/2" />
            </div>
          </div>
          <div className="h-8 w-20 bg-[#ede5d6] rounded-lg shrink-0" />
        </div>

        {/* Upload slots skeleton */}
        <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 space-y-4 animate-pulse shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
            <div className="h-4 bg-[#ede5d6] rounded-md w-32" />
            <div className="h-4 bg-[#f2ebdc] rounded-md w-20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="aspect-square rounded-xl bg-[#ede5d6]" />
            <div className="aspect-square rounded-xl bg-[#ede5d6]" />
            <div className="aspect-square rounded-xl bg-[#ede5d6]" />
          </div>
        </div>

        {/* Text field skeleton */}
        <div className="bg-white border border-[#e5ddd0] rounded-2xl p-5 space-y-3 animate-pulse shadow-xs">
          <div className="h-4 bg-[#ede5d6] rounded-md w-28" />
          <div className="h-11 bg-[#f2ebdc] rounded-xl w-full" />
        </div>
      </main>

      {/* Sticky bottom bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e5ddd0] p-3 sm:p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="h-3 bg-[#f2ebdc] rounded w-16 animate-pulse" />
            <div className="h-5 bg-[#ede5d6] rounded w-24 animate-pulse" />
          </div>
          <div className="h-11 bg-[#ede5d6] rounded-xl w-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
