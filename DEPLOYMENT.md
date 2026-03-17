# SIPKG NTT — Panduan Deployment

## Opsi Deployment

Ada 3 pilihan untuk men-deploy SIPKG NTT:

| Opsi | Cocok Untuk | Biaya |
|------|-------------|-------|
| **VPS Linux** | Server pemerintah on-premise | Gratis (server sendiri) |
| **Docker** | Server dengan Docker Engine | Gratis |
| **Vercel + Supabase** | Deployment cepat cloud | Gratis (tier free) |

---

## Opsi 1: VPS Linux (Ubuntu 22.04) — Disarankan untuk Pemprov

### Prasyarat
```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Setup Database PostgreSQL
```bash
# Masuk sebagai postgres user
sudo -u postgres psql

# Di dalam psql:
CREATE USER sipkg_user WITH PASSWORD 'ganti_password_kuat';
CREATE DATABASE sipkg_ntt_db OWNER sipkg_user;
GRANT ALL PRIVILEGES ON DATABASE sipkg_ntt_db TO sipkg_user;
\q
```

### Deploy Aplikasi
```bash
# Clone atau upload kode ke server
cd /var/www
git clone https://github.com/pemprov-ntt/sipkg-ntt.git
cd sipkg-ntt

# Install dependencies
npm install

# Konfigurasi environment
cp .env.example .env
nano .env
# → Isi DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Build aplikasi
npm run build

# Jalankan dengan PM2
pm2 start npm --name "sipkg-ntt" -- start
pm2 startup
pm2 save
```

### Konfigurasi Nginx (Reverse Proxy)
```nginx
# /etc/nginx/sites-available/sipkg-ntt
server {
    listen 80;
    server_name sipkg.nttprov.go.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/sipkg-ntt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL dengan Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sipkg.nttprov.go.id
```

---

## Opsi 2: Docker Compose

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: sipkg_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: sipkg_ntt_db
      POSTGRES_USER: sipkg_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    container_name: sipkg_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://sipkg_user:${DB_PASSWORD}@db:5432/sipkg_ntt_db
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    depends_on:
      - db
    command: >
      sh -c "npx prisma migrate deploy && npx prisma db seed && npm start"

volumes:
  postgres_data:
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

### Jalankan Docker
```bash
# Buat file .env untuk Docker
cat > .env << EOF
DB_PASSWORD=password_kuat_disini
NEXTAUTH_SECRET=secret_panjang_acak_disini
NEXTAUTH_URL=http://your-server-ip:3000
EOF

# Jalankan
docker compose up -d

# Cek log
docker compose logs -f app
```

---

## Opsi 3: Vercel + Supabase (Tercepat)

### 1. Setup Supabase
1. Buka [supabase.com](https://supabase.com) → New Project
2. Catat **Connection String** dari Settings → Database
3. Format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### 2. Deploy ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login dan deploy
vercel login
vercel

# Set environment variables di dashboard Vercel:
# DATABASE_URL = [connection string Supabase]
# NEXTAUTH_SECRET = [random string panjang]
# NEXTAUTH_URL = https://[your-vercel-url].vercel.app
```

### 3. Jalankan Migrasi
```bash
# Setelah deploy, jalankan dari lokal dengan DATABASE_URL production
DATABASE_URL="[url supabase]" npm run db:migrate
DATABASE_URL="[url supabase]" npm run db:seed
```

---

## Backup Database

### Backup Otomatis (Crontab)
```bash
# Edit crontab
crontab -e

# Backup setiap hari jam 02:00
0 2 * * * pg_dump -U sipkg_user sipkg_ntt_db > /backup/sipkg_$(date +\%Y\%m\%d).sql

# Hapus backup lebih dari 30 hari
0 3 * * * find /backup -name "sipkg_*.sql" -mtime +30 -delete
```

### Manual Backup & Restore
```bash
# Backup
pg_dump -U sipkg_user -h localhost sipkg_ntt_db > backup_sipkg.sql

# Restore
psql -U sipkg_user -h localhost sipkg_ntt_db < backup_sipkg.sql
```

---

## Pemeliharaan

### Update Aplikasi
```bash
cd /var/www/sipkg-ntt
git pull origin main
npm install
npm run db:migrate
npm run build
pm2 restart sipkg-ntt
```

### Monitoring
```bash
# Status aplikasi
pm2 status
pm2 logs sipkg-ntt

# Status database
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Generate NEXTAUTH_SECRET yang Kuat
```bash
openssl rand -base64 32
```

---

## Variabel Environment Produksi

```env
# Database
DATABASE_URL="postgresql://sipkg_user:PASSWORD@localhost:5432/sipkg_ntt_db?schema=public"

# NextAuth — WAJIB diganti dengan nilai acak
NEXTAUTH_SECRET="hasil_openssl_rand_base64_32"
NEXTAUTH_URL="https://sipkg.nttprov.go.id"

# Opsional
NEXT_PUBLIC_APP_NAME="SIPKG NTT"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

---

## Checklist Sebelum Go-Live

- [ ] `NEXTAUTH_SECRET` sudah diganti dengan nilai acak yang kuat
- [ ] Password admin default sudah diganti
- [ ] Database sudah di-backup
- [ ] SSL/HTTPS sudah aktif
- [ ] Domain sudah mengarah ke server
- [ ] Firewall sudah dikonfigurasi (hanya port 80, 443, 22)
- [ ] Data sekolah NTT sudah diinput
- [ ] Admin sekolah sudah dibuat
- [ ] Tahun ajaran aktif sudah diatur di Pengaturan Sistem

---

## Kontak Support

**Biro Organisasi Setda Provinsi NTT**  
Jl. El Tari No. 52, Kupang, NTT  

---

© 2024 Pemerintah Provinsi Nusa Tenggara Timur
