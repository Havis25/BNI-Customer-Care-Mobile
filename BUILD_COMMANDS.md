# Build Commands untuk BNI B-Care Mobile

## Prerequisites
```bash
npm install -g @expo/eas-cli
eas login
```

## Build APK Commands

### 1. Build APK untuk Testing (Recommended)
```bash
eas build --platform android --profile preview
```

### 2. Build APK untuk Development
```bash
eas build --platform android --profile development
```

### 3. Build AAB untuk Production (Google Play Store)
```bash
eas build --platform android --profile production
```

## Quick Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```

## Download APK
1. Buka https://expo.dev/
2. Login dengan akun yang sama
3. Pilih project "B-Care"
4. Download APK dari build yang selesai

## Features yang sudah ditambahkan:
- ✅ Audio Call realtime (tanpa capture)
- ✅ Video Call realtime (tanpa capture/screenshot)
- ✅ Chat dengan bot
- ✅ Upload file ke tiket
- ✅ Create tiket otomatis
- ✅ Live chat dengan agent

## Permissions yang sudah dikonfigurasi:
- Camera (untuk video call)
- Microphone (untuk audio call)
- Internet & Network (untuk realtime communication)
- Storage (untuk upload file)