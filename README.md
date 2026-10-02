# temp-shop — E-ticaret vitrini (Next.js)

**PazarKapısı** adlı demo e-ticaret sitesinin ön yüzü. Ürün kataloğu, sepet, ödeme, kullanıcı hesabı ve yönetim paneli içerir.

Kendi backend'i yoktur; [**backend-dotnet**](https://github.com/MihrimatriX/backend-dotnet) REST API'sine bağlanır. Önce onu ayağa kaldırın.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Dil | TypeScript |

## Hızlı başlangıç

### 1. Backend'i çalıştırın

```bash
git clone https://github.com/MihrimatriX/backend-dotnet.git
cd backend-dotnet
docker compose up --build -d
docker exec dotnet-backend dotnet EcommerceBackend.dll seed-demo   # demo ürünler
```

API `http://localhost:5000` adresinde açılır (Swagger: `/swagger`). Demo kullanıcı hesapları (admin dahil) backend README'sindeki **Demo hesapları** bölümünde.

### 2. Vitrini çalıştırın

**Node.js ile** (Node 20.9+):

```bash
git clone https://github.com/MihrimatriX/temp-shop-net.git
cd temp-shop-net
npm ci
npm run dev
```

**veya Docker ile:**

```bash
docker compose up --build -d
```

Her iki durumda da: <http://localhost:3000>

Bağlantıyı kontrol etmek için <http://localhost:3000/dev/status> sayfası API'nin `health` ve `hello` uçlarını çağırır.

## Ayarlar

Varsayılanlar backend'in aynı makinede `:5000` portunda çalıştığını varsayar; bu durumda hiçbir ayar gerekmez. Farklıysa `.env.example` dosyasını `.env.local` (Node) veya `.env` (Docker) olarak kopyalayıp düzenleyin.

| Değişken | Ne için | Varsayılan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Tarayıcının API'ye gittiği adres | `http://localhost:5000` |
| `API_INTERNAL_URL` | Sunucu tarafı (SSR) isteklerinin gittiği adres | `NEXT_PUBLIC_API_URL` · Docker'da `http://host.docker.internal:5000` |

**Neden iki adres?** Ana sayfa, ürün listesi ve kategoriler sunucuda render edilir; sepet, giriş ve hesap sayfaları ise tarayıcıdan API'yi çağırır. Docker'da konteyner içindeki `localhost` konteynerin kendisidir, bu yüzden sunucu tarafı istekler `host.docker.internal` üzerinden makinenize çıkar.

Docker'da konteyner her başladığında `entrypoint.sh`, `NEXT_PUBLIC_API_URL` değerini `public/runtime-config.js` dosyasına yazar ve tarayıcı bunu build'deki değerin önüne koyar. Yani adresi değiştirmek için yeniden build gerekmez, `docker compose up -d` yeterli.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build (standalone çıktı) |
| `npm run start` | Build edilmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint |

## Sayfalar

| Yol | |
|---|---|
| `/` | Ana sayfa: kampanyalar, öne çıkan ve indirimli ürünler |
| `/products`, `/products/[id]` | Katalog ve ürün detayı |
| `/categories`, `/subcategories`, `/campaigns` | |
| `/cart`, `/checkout` | Sepet ve ödeme |
| `/login`, `/register` | |
| `/account/*` | Siparişler, adresler, ödeme yöntemleri, favoriler, bildirimler, ayarlar, güvenlik, destek |
| `/admin/*` | Yönetim paneli (Admin rolü gerekir): katalog, siparişler, kampanyalar, yorum moderasyonu, destek, sistem |
| `/help` | Yardım ve SSS |
| `/dev/status` | API bağlantı testi |

## Proje yapısı

```
src/
  app/           App Router sayfaları
  components/    Ortak UI bileşenleri
  context/       Oturum (JWT) ve bildirim (toast) context'leri
  lib/
    api.ts         Tarayıcı tarafı fetch + hata tipi
    server-api.ts  Sunucu tarafı fetch (SSR)
    config.ts      API adresleri
    types.ts       API DTO tipleri
```

## Sorun giderme

- **Sayfalar boş, ürün yok:** Backend çalışıyor mu? `/dev/status` sayfasına bakın. Veritabanı boşsa `seed-demo` komutunu çalıştırın.
- **Giriş/sepet "Bağlantı hatası" veriyor:** Tarayıcı API'ye ulaşamıyor ya da CORS engelliyor. Backend `Cors:AllowedOrigins` listesinde `http://localhost:3000` olmalı (varsayılan olarak var). Vitrini başka bir port/adreste açıyorsanız oraya ekleyin.
- **Docker'da ana sayfa boş ama giriş çalışıyor:** SSR istekleri API'ye ulaşamıyor; `API_INTERNAL_URL` değerini kontrol edin.
- **401 / oturum düşüyor:** Token tarayıcıda `localStorage` → `temp-shop-token` anahtarında tutulur; çıkış yapıp tekrar girin.
