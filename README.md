# temp-shop — E-ticaret vitrin (Next.js)

Bu proje, kök dizindeki **EcommerceBackend** (.NET) REST API’sine bağlanan vitrin uygulamasıdır. Ürün listeleme, sepet, ödeme akışı, hesap alanları ve yönetici ekranı gibi uçlar `NEXT_PUBLIC_API_URL` üzerinden doğrudan API’ye istek atar (BFF yok; tarayıcıdan CORS ile erişim).

## Teknolojiler

| Bileşen | Sürüm / not |
|--------|-------------|
| Next.js (App Router) | 15.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Geliştirme sunucusu | `next dev --turbopack` |

## Ön koşullar

- Çalışan **API** (varsayılan: `http://localhost:5000`)
- Node.js **20+** (yerel geliştirme için)
- API tarafında vitrin origin’inin **CORS** listesinde olması (`appsettings` → `Cors:AllowedOrigins`, örn. `http://localhost:3000`)

## Ortam değişkeni

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NEXT_PUBLIC_API_URL` | Backend kök adresi (sonunda `/` olmadan) | `http://localhost:5000` |

Değer `src/lib/config.ts` içinde okunur; yalnızca `NEXT_PUBLIC_*` önekli değişkenler istemci bundle’ına girer.

## Yerel çalıştırma

```bash
cd temp-shop
npm ci
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

API farklı bir host/port’taysa:

```bash
# PowerShell
$env:NEXT_PUBLIC_API_URL="http://127.0.0.1:5000"; npm run dev

# bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000 npm run dev
```

## Üretim derlemesi

```bash
npm run build    # Turbopack ile (yerel)
npm run start    # .next üzerinden production server

# Docker imajı (standalone) — build sırasında API URL gömülür
npm run build:docker
```

Docker ile tüm stack için üst dizinde: `docker compose up --build -d` (shop servisi `NEXT_PUBLIC_API_URL` build argümanı ile genelde `http://localhost:5000` kullanır; tarayıcı makinenizden API’ye gider).

## Öne çıkan sayfalar

- **/** — Ana sayfa, öne çıkan / kampanyalı ürünler
- **/products**, **/products/[id]** — Katalog ve ürün detayı
- **/categories**, **/subcategories**, **/campaigns**
- **/cart**, **/checkout** — Sepet; ara toplam, kargo, `errorCode` / `traceId` ile hata gösterimi
- **/login**, **/register**
- **/account/**\* — Siparişler, adresler, ödeme yöntemleri, favoriler, ayarlar, güvenlik, yardım, bildirimler
- **/admin** — Yönetim paneli (Admin JWT): özet, katalog (kategori / alt kategori / ürün), siparişler, kampanyalar, bildirimler, yardım makalesi oluşturma, destek talepleri (tümü), yorum moderasyonu, sistem ve API araçları (health, metrics, test kayıt)
- **/account/admin** — `/admin` adresine yönlendirir
- **/help** — İletişim / yardım

## Proje yapısı (kısa)

```
src/
  app/           # App Router sayfaları
  components/    # UI bileşenleri
  context/       # Auth, toast vb.
  lib/
    api.ts       # fetch + ApiCallError + unwrap
    config.ts    # API_BASE, TOKEN_KEY
    types.ts     # DTO tipleri (API ile uyumlu)
```

## NPM komutları

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme (Turbopack) |
| `npm run build` | Production build (Turbopack) |
| `npm run build:docker` | Standalone çıktı (Dockerfile ile uyumlu) |
| `npm run start` | Production sunucu |
| `npm run lint` | ESLint |

## Sorun giderme

- **Ağ hatası / CORS:** API’nin çalıştığını ve `Cors:AllowedOrigins` içinde vitrin adresinin olduğunu doğrulayın.
- **401 / oturum:** Giriş yapın; token `localStorage` (`temp-shop-token`) içinde tutulur.
- **Docker’da shop açılıyor ama API’ye düşmüyor:** `NEXT_PUBLIC_API_URL` tarayıcıdan erişilebilir bir adres olmalı (genelde `http://localhost:5000` veya makinenizin LAN IP’si).

---

Üst repo: `backend-dotnet` — API, veritabanı ve `docker-compose` tanımları için kök [README.md](../README.md) dosyasına bakın.
