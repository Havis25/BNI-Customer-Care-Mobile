# 🔧 BUILD FIX - EAS CLI Installation

## ❌ Error: @expo/eas-cli not found

## ✅ SOLUSI:

### 1. Install dengan nama yang benar:
```bash
npm install -g eas-cli
```

### 2. Atau gunakan npx (tanpa install global):
```bash
npx eas-cli@latest build --platform android --profile preview
```

### 3. Atau install via yarn:
```bash
yarn global add eas-cli
```

## 🚀 BUILD COMMANDS YANG BENAR:

```bash
# Method 1: Install global
npm install -g eas-cli
eas login
eas build --platform android --profile preview

# Method 2: Gunakan npx (recommended)
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview

# Method 3: Yarn
yarn global add eas-cli
eas login  
eas build --platform android --profile preview
```

## 📋 LANGKAH BUILD:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login:**
   ```bash
   eas login
   ```

3. **Build APK:**
   ```bash
   eas build --platform android --profile preview --clear-cache
   ```

## ❌ ERROR: Request Timeout (408)

### SOLUSI TIMEOUT:

```bash
# 1. Retry dengan timeout lebih lama
eas build --platform android --profile preview --non-interactive

# 2. Atau gunakan local keystore
eas build --platform android --profile preview --local

# 3. Atau skip keystore generation
eas build --platform android --profile preview --no-wait

# 4. Clear cache dan retry
eas build --platform android --profile preview --clear-cache --non-interactive
```

### ALTERNATIF BUILD:

```bash
# Build tanpa keystore baru (gunakan existing)
eas build --platform android --profile development

# Atau build dengan expo build (fallback)
npx expo build:android
```

### TROUBLESHOOTING:

1. **Cek koneksi internet**
2. **Retry beberapa kali** (server Expo kadang timeout)
3. **Gunakan VPN** jika ada masalah regional
4. **Build di waktu yang berbeda** (server load)

## ❌ ERROR: Keystore Generation Failed

### SOLUSI KEYSTORE:

```bash
# 1. Build tanpa non-interactive (allow keystore prompt)
eas build --platform android --profile preview --clear-cache

# 2. Atau gunakan development profile
eas build --platform android --profile development

# 3. Generate keystore manual
eas credentials

# 4. Build dengan local credentials
eas build --platform android --profile preview --local
```

### EAS.JSON SUDAH DIPERBAIKI:
- ✅ Added `appVersionSource: "local"`
- ✅ Added `credentialsSource: "local"`

## ✅ BUILD COMMAND TERBARU:

```bash
# Interactive mode (recommended)
eas build --platform android --profile preview --clear-cache

# Atau development profile
eas build --platform android --profile development
```