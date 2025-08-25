# 🚀 BUILD BEST PRACTICE - BNI B-Care

## ✅ STEP BY STEP BUILD APK

### 1. Setup Credentials (WAJIB)
```bash
# Generate credentials dulu
eas credentials

# Pilih: Android > Generate new keystore
```

### 2. Build APK
```bash
# Build dengan remote credentials
eas build --platform android --profile preview
```

### 3. Alternative Commands
```bash
# Method 1: Development build (fastest)
eas build --platform android --profile development

# Method 2: Production build
eas build --platform android --profile production

# Method 3: Clear cache jika error
eas build --platform android --profile preview --clear-cache
```

## 🔧 TROUBLESHOOTING

### Error: Request Timeout (408) - Keystore Generation
**SOLUSI LANGSUNG:**
```bash
# Skip credentials setup - build langsung
eas build --platform android --profile development
```

### Error: credentials.json not found
**SOLUSI:**
```bash
# Build tanpa setup credentials (auto-generate)
eas build --platform android --profile development
```

### Server Expo Timeout
**ALTERNATIF:**
```bash
# 1. Retry beberapa kali
eas build --platform android --profile development

# 2. Gunakan VPN
# 3. Coba di waktu berbeda
# 4. Build dengan expo CLI (fallback)
npx expo build:android
```

## ⚡ SOLUSI TIMEOUT - SKIP CREDENTIALS

### LANGSUNG BUILD (RECOMMENDED):
```bash
# Skip setup credentials - auto generate
eas build --platform android --profile development
```

### RETRY COMMANDS:
```bash
# Method 1: Development (fastest)
eas build --platform android --profile development

# Method 2: Retry preview
eas build --platform android --profile preview

# Method 3: Fallback expo CLI
npx expo build:android
```

### TIPS TIMEOUT:
1. **Retry 3-5 kali** (server Expo sering timeout)
2. **Gunakan VPN** jika regional issue
3. **Build di waktu sepi** (malam/pagi)
4. **Development profile lebih stabil**

## 🎯 BEST COMMAND:

```bash
eas build --platform android --profile development
```

**Skip credentials setup - langsung build development!**