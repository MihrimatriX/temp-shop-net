import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--mp-border)] bg-[var(--mp-black)] text-white">
      <div className="border-b border-white/10 bg-[#2a2a2a] py-6">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          {[
            {
              icon: Truck,
              t: "Hızlı teslimat",
              d: "Seçili ürünlerde aynı gün / ertesi gün kargo",
            },
            {
              icon: RotateCcw,
              t: "Kolay iade",
              d: "14 gün içinde cayma hakkı (koşullara tabi)",
            },
            {
              icon: ShieldCheck,
              t: "Güvenli ödeme",
              d: "3D Secure ve kart bilgisi koruması",
            },
            {
              icon: Headphones,
              t: "7/24 destek",
              d: "Yardım merkezi ve sipariş takibi",
            },
          ].map((x) => (
            <div key={x.t} className="flex gap-3">
              <x.icon className="mt-0.5 h-8 w-8 shrink-0 text-[var(--mp-orange)]" />
              <div>
                <p className="font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-white/65">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-xl font-extrabold tracking-tight">
            Pazar<span className="text-[var(--mp-orange)]">Kapısı</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Elektronik, moda, ev yaşam, kozmetik ve daha fazlasında binlerce
            ürün. Kampanyalar, güvenli ödeme ve müşteri odaklı deneyim — demo
            vitrin, canlı .NET API.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--mp-orange)]">
            Popüler
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link
                href="/products"
                className="hover:text-white hover:underline"
              >
                Tüm ürünler
              </Link>
            </li>
            <li>
              <Link
                href="/campaigns"
                className="hover:text-white hover:underline"
              >
                Kampanyalar
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="hover:text-white hover:underline"
              >
                Kategoriler
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--mp-orange)]">
            Kurumsal
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/help" className="hover:text-white hover:underline">
                Yardım merkezi
              </Link>
            </li>
            <li>
              <Link
                href="/dev/status"
                className="hover:text-white hover:underline"
              >
                API durumu
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--mp-orange)]">
            Hesap
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/login" className="hover:text-white hover:underline">
                Giriş
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="hover:text-white hover:underline"
              >
                Kayıt ol
              </Link>
            </li>
            <li>
              <Link
                href="/account/orders"
                className="hover:text-white hover:underline"
              >
                Siparişlerim
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} PazarKapısı · Demo e-ticaret vitrin · Marka
        ve tasarım örnektir
      </div>
    </footer>
  );
}
