# BNI Customer Care Mobile App 🏦

Aplikasi mobile customer service BNI yang dibangun dengan React Native dan Expo Router untuk memberikan layanan pelanggan yang komprehensif.

## 🚀 Fitur Utama

- **Authentication & Security**: Login aman dengan auto-logout dan session management
- **Complaint Management**: Sistem pengaduan terintegrasi dengan chatbot AI
- **Real-time Chat**: Chat langsung dengan customer service menggunakan WebRTC
- **Service Directory**: Informasi lengkap layanan BNI (Digital, Cabang, Produk, Promo)
- **Ticket Tracking**: Pelacakan status pengaduan dan riwayat
- **Multi-platform**: Support Android, iOS, dan Web

## 📱 Struktur Aplikasi

### Core Pages
- **Home** (`/`): Dashboard utama dengan layanan dan FAQ
- **Login** (`/login`): Autentikasi pengguna
- **Profile** (`/profile`): Informasi dan pengaturan akun
- **Notifications** (`/notification`): Notifikasi dan update
- **History** (`/riwayat`): Riwayat pengaduan dan transaksi

### Services
- **Digital Services** (`/services/digital`): Layanan perbankan digital
- **Branch Locator** (`/services/cabang`): Pencari cabang terdekat
- **Products** (`/services/produk`): Katalog produk BNI
- **Promotions** (`/services/promo`): Promo dan penawaran
- **Agent Services** (`/services/agent`): Layanan agen46
- **Wondr Integration** (`/services/wondr`): Integrasi dengan aplikasi Wondr

### Complaint System
- **Chat Interface** (`/complaint/chat`): Chat dengan AI bot dan customer service
- **Complaint Form** (`/complaint/confirmation`): Form pengaduan terstruktur
- **Ticket Detail** (`/riwayat/[id]`): Detail pengaduan dan follow-up

## 🛠️ Setup & Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi yang sesuai
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web browser
   ```

## 🏗️ Arsitektur Teknis

### Frontend Stack
- **React Native 0.79.5** dengan Expo SDK 53
- **Expo Router** untuk file-based routing
- **TypeScript** untuk type safety
- **React Native Reanimated** untuk animasi
- **Socket.IO** untuk real-time communication

### State Management
- **Custom Hooks** untuk business logic
- **AsyncStorage** untuk local persistence
- **Context API** untuk global state

### Security Features
- **Auto-logout** dengan inactivity detection
- **XSS Protection** dengan input sanitization
- **Secure token management** dengan refresh mechanism
- **Path traversal protection**

### Key Components
```
components/
├── home/           # Homepage components
├── modals/         # Modal dialogs
├── shared/         # Reusable components
└── ui/             # UI primitives

hooks/
├── useAuth.ts      # Authentication logic
├── useAutoLogout.ts # Security & session management
├── useTickets.ts   # Complaint management
└── useApi.ts       # API communication

utils/
├── chatbotMapping.ts    # AI chatbot integration
├── chatValidation.ts    # Input validation
└── responsive.ts        # Responsive design
```

## 🔧 Development Scripts

```bash
npm start          # Start Expo development server
npm run server     # Start backend server (if available)
npm run lint       # Run ESLint
npm run reset-project  # Reset to clean state
```

## 📋 API Integration

- **Authentication**: `/auth/login`, `/auth/me`, `/auth/refresh`
- **Tickets**: `/v1/tickets` (CRUD operations)
- **Channels & Categories**: `/v1/channels`, `/v1/categories`
- **Terminals**: `/v1/terminals`
- **FAQ**: `/v1/faq`
- **Feedback**: `/v1/feedback`

## 🔒 Security Measures

- **Input Sanitization**: XSS protection pada semua user input
- **Session Management**: Auto-logout setelah 2 menit inaktif
- **Token Security**: Automatic token refresh dan secure storage
- **Path Protection**: Validasi path untuk mencegah directory traversal

## 📱 Platform Support

- **Android**: Native Android app via Expo
- **iOS**: Native iOS app via Expo
- **Web**: Progressive Web App (PWA)

## 🚀 Deployment

Gunakan Expo Application Services (EAS) untuk build dan deployment:

```bash
npx eas build --platform android
npx eas build --platform ios
npx eas submit
```

## 📞 Support

Untuk bantuan teknis atau pertanyaan pengembangan, hubungi tim development BNI Customer Care.
