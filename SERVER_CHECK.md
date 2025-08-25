# Server Compatibility Check

## ❌ ISSUES DITEMUKAN:

### 1. **expo-av MISSING**
```bash
# PERLU INSTALL:
npx expo install expo-av
```

### 2. **Socket Events untuk Audio Call**
Server perlu mendukung events:
- `audio:invite` - Memulai audio call
- `audio:accept` - Terima audio call  
- `audio:decline` - Tolak audio call
- `audio:hangup` - Tutup audio call
- `audio:data` - Stream audio data

### 3. **Video Call Events**
Server perlu mendukung:
- `call:stream` - Realtime video streaming (bukan capture)

## ✅ FIXES DIPERLUKAN:

### 1. Install expo-av
```bash
npx expo install expo-av
```

### 2. Update package.json dependencies
Tambahkan:
```json
"expo-av": "~14.1.5"
```

### 3. Server Socket Events
Pastikan server socket.io mendukung:
```javascript
// Audio call events
socket.on('audio:invite', (data) => {
  // Handle audio call invitation
});

socket.on('audio:accept', (data) => {
  // Handle audio call acceptance
});

socket.on('audio:data', (data) => {
  // Handle audio streaming data
});

// Video streaming (tanpa capture)
socket.on('call:stream', (data) => {
  // Handle video streaming
});
```

## 🔧 QUICK FIX:

1. **Install expo-av:**
```bash
cd BNI-Customer-Care-Mobile
npx expo install expo-av
```

2. **Update build config:**
```bash
eas build --platform android --profile preview --clear-cache
```

## ⚠️ KEMUNGKINAN MASALAH:

1. **Audio Permission** - Mungkin perlu permission tambahan di Android
2. **Network Latency** - Audio/video call butuh koneksi stabil
3. **Server Load** - Streaming realtime butuh server yang kuat

## 📱 TESTING CHECKLIST:

- [ ] Audio call bisa dimulai
- [ ] Audio call bisa diterima/ditolak
- [ ] Video call tanpa capture
- [ ] Socket connection stabil
- [ ] Permissions granted
- [ ] Build APK berhasil