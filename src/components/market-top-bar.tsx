import Link from "next/link";

export function MarketTopBar() {
  return (
    <div className="bg-[var(--mp-topbar)] text-[11px] text-white/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-1.5 sm:justify-between">
        <p className="hidden sm:block">
          <span className="font-semibold text-[var(--mp-orange)]">
            150 TL üzeri
          </span>{" "}
          seçili kategorilerde kargo bedava · Kolay iade
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/help" className="hover:underline">
            Yardım
          </Link>
          <Link href="/campaigns" className="hover:underline">
            Kampanyalar
          </Link>
          <Link href="/dev/status" className="text-white/70 hover:underline">
            API durumu
          </Link>
        </div>
      </div>
    </div>
  );
}
