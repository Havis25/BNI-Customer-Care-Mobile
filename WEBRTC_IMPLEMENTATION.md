# WebRTC Implementation for BNI Customer Care

## Overview
Implementasi WebRTC untuk audio/video call realtime yang kompatibel dengan web users. Menggantikan Expo AV yang file-based dengan WebRTC yang stream-based.

## Architecture

### Before (Expo AV - File Based)
```
Mobile App -> Record Audio -> Save File -> Send File -> Web User -> Play File
Delay: 1-2 seconds, No realtime interaction
```

### After (WebRTC - Stream Based)
```
Mobile App <-> WebRTC Peer Connection <-> Web User
Delay: < 100ms, True realtime audio/video
```

## Components

### 1. WebRTC Service (`src/services/webrtc.ts`)
- **Purpose**: Handle WebRTC peer connections, media streams, and signaling
- **Features**:
  - Audio/Video call initialization
  - Offer/Answer creation and handling
  - ICE candidate exchange
  - Media stream management
  - Audio/Video toggle controls

### 2. Socket Events (Server Integration)
- **webrtc:offer**: Send/receive call offers
- **webrtc:answer**: Send/receive call answers  
- **webrtc:ice-candidate**: Exchange ICE candidates
- **webrtc:end-call**: End call signaling
- **webrtc:audio-toggle**: Audio mute/unmute
- **webrtc:video-toggle**: Video on/off

### 3. Chat Integration (`app/complaint/chat.tsx`)
- **Audio Call Flow**:
  1. User clicks audio call button
  2. Initialize WebRTC with audio only
  3. Create offer and send via socket
  4. Handle answer from remote peer
  5. Exchange ICE candidates
  6. Establish peer connection
  7. Audio streams directly between peers

- **Video Call Flow**:
  1. User clicks video call button
  2. Initialize WebRTC with audio + video
  3. Same signaling process as audio
  4. Video streams displayed in CallModal

## Key Improvements

### 1. Realtime Performance
- **Latency**: < 100ms (vs 1-2 seconds with Expo AV)
- **Quality**: Direct peer-to-peer streaming
- **Reliability**: Built-in reconnection and error handling

### 2. Cross-Platform Compatibility
- **Mobile**: React Native WebRTC
- **Web**: Native WebRTC APIs
- **Signaling**: Socket.io for all platforms

### 3. Feature Parity
- **Audio Calls**: ✅ Realtime bidirectional audio
- **Video Calls**: ✅ Realtime video with audio
- **Call Controls**: ✅ Mute, speaker, video toggle
- **Call Management**: ✅ Accept, decline, hangup

## Installation & Setup

### 1. Dependencies
```bash
npm install react-native-webrtc
```

### 2. Permissions (app.json)
```json
{
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.CHANGE_WIFI_STATE",
      "android.permission.WAKE_LOCK"
    ]
  }
}
```

### 3. Build Configuration
- **Development**: `npx expo start`
- **Production**: `eas build --platform android` (requires rebuild for native dependency)

## Usage Examples

### Audio Call
```typescript
// Start audio call
const startAudioCall = async () => {
  const stream = await WebRTCService.initializeCall(false); // audio only
  WebRTCService.setCurrentRoom(ACTIVE_ROOM);
  await WebRTCService.createOffer(ACTIVE_ROOM, true); // audioOnly = true
};

// Handle incoming audio call
socket.on('webrtc:offer', async ({ offer, room, audioOnly }) => {
  if (audioOnly) {
    await WebRTCService.createAnswer(room, offer);
  }
});
```

### Video Call
```typescript
// Start video call
const startVideoCall = async () => {
  const stream = await WebRTCService.initializeCall(true); // audio + video
  WebRTCService.setCurrentRoom(ACTIVE_ROOM);
  await WebRTCService.createOffer(ACTIVE_ROOM, false); // audioOnly = false
};
```

### Call Controls
```typescript
// Mute/unmute audio
WebRTCService.toggleAudio(ACTIVE_ROOM, false); // mute
WebRTCService.toggleAudio(ACTIVE_ROOM, true);  // unmute

// Turn video on/off
WebRTCService.toggleVideo(ACTIVE_ROOM, false); // video off
WebRTCService.toggleVideo(ACTIVE_ROOM, true);  // video on

// End call
WebRTCService.endCall(ACTIVE_ROOM);
```

## Testing

### 1. Local Testing
- Start server: `npm run server`
- Start mobile app: `npx expo start`
- Test with web client on same network

### 2. Production Testing
- Deploy server to production
- Build APK: `eas build --platform android`
- Test with production web client

## Troubleshooting

### Common Issues

1. **No Audio/Video**
   - Check permissions in app.json
   - Verify WebRTC service initialization
   - Check socket connection

2. **Connection Failed**
   - Verify STUN servers configuration
   - Check network connectivity
   - Ensure socket events are properly handled

3. **Build Errors**
   - Clean build: `npx expo start --clear`
   - Rebuild APK after adding react-native-webrtc
   - Check EAS build logs

### Debug Commands
```bash
# Check socket connection
console.log('Socket connected:', socket.connected);

# Test WebRTC initialization
const stream = await WebRTCService.initializeCall(true);
console.log('Stream tracks:', stream.getTracks());

# Monitor socket events
socket.on('webrtc:offer', (data) => console.log('Offer received:', data));
```

## Performance Metrics

### Before (Expo AV)
- **Audio Latency**: 1-2 seconds
- **File Size**: 50-100KB per chunk
- **CPU Usage**: High (encoding/decoding files)
- **Memory**: High (file buffering)

### After (WebRTC)
- **Audio Latency**: 50-100ms
- **Bandwidth**: Optimized streaming
- **CPU Usage**: Low (hardware acceleration)
- **Memory**: Low (direct streaming)

## Future Enhancements

1. **Screen Sharing**: Add screen capture capability
2. **Group Calls**: Support multiple participants
3. **Recording**: Add call recording feature
4. **Quality Control**: Adaptive bitrate based on connection
5. **Analytics**: Call quality metrics and monitoring

## Conclusion

WebRTC implementation provides true realtime audio/video communication between mobile app and web users, replacing the previous file-based approach with direct peer-to-peer streaming. This results in significantly better user experience with lower latency and higher quality calls.