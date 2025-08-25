# Panduan Build APK - BNI Customer Care Mobile

## Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 3. Login ke Expo Account
```bash
eas login
```

## Konfigurasi Build

### 1. Buat file `eas.json` di root project
```json
{
  "cli": {
    "version": ">= 5.4.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Update `app.json` atau `app.config.js`
Pastikan konfigurasi berikut ada:
```json
{
  "expo": {
    "name": "BNI Customer Care",
    "slug": "bni-customer-care",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bni.customercare"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.bni.customercare",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for audio calls"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## Build Commands

### 1. Build APK untuk Testing (Preview)
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

### 4. Build untuk iOS (jika diperlukan)
```bash
eas build --platform ios --profile preview
```

## Folder Structure yang Diperlukan

Pastikan folder dan file berikut ada:

```
BNI-Customer-Care-Mobile/
├── assets/
│   └── images/
│       ├── icon.png (1024x1024)
│       ├── adaptive-icon.png (1024x1024)
│       ├── splash.png (1284x2778 untuk iOS, 1080x1920 untuk Android)
│       └── favicon.png (48x48)
├── app/
├── components/
├── hooks/
├── lib/
├── utils/
├── src/
├── app.json
├── eas.json
├── package.json
└── BUILD_APK_GUIDE.md
```

## Troubleshooting

### 1. Jika ada error permission
Tambahkan permission yang diperlukan di `app.json`:
```json
"android": {
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.MODIFY_AUDIO_SETTINGS",
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE"
  ]
}
```

### 2. Jika ada error dengan expo-av
```bash
npx expo install expo-av
```

### 3. Jika ada error dengan expo-camera
```bash
npx expo install expo-camera
```

### 4. Clear cache jika diperlukan
```bash
npx expo start --clear
```

## Download APK

Setelah build selesai:
1. Buka dashboard EAS di browser: https://expo.dev/
2. Login dengan akun yang sama
3. Pilih project "bni-customer-care"
4. Klik pada build yang sudah selesai
5. Download APK file

## Testing APK

1. Transfer APK ke device Android
2. Enable "Install from Unknown Sources" di Settings
3. Install APK
4. Test semua fitur:
   - Chat dengan bot
   - Audio call
   - Video call
   - Upload file
   - Create ticket

## Notes

- Build time biasanya 10-20 menit
- Pastikan internet connection stabil
- APK size sekitar 50-80MB
- Minimum Android version: 6.0 (API level 23)