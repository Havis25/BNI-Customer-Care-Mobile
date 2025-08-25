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

## ✅ SIAP BUILD APK!