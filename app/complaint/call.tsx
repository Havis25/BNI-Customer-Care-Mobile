import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getSocket } from "@/src/realtime/socket";
import { useAuth } from "@/hooks/useAuth";
export default function CallScreen() {
  const { user } = useAuth();
  const socket = getSocket();
  const uid = String(user?.customer_id || user?.id || "guest");
  const ACTIVE_ROOM = "call:general";
  
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<React.ElementRef<typeof CameraView> | null>(null);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [callDuration, setCallDuration] = useState(0);
  const [remoteFrame, setRemoteFrame] = useState<string | null>(null);
  const [facing] = useState<"front" | "back">("front");
  
  const FPS = 1.5;

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Socket handlers for call
  useEffect(() => {
    const s = socket;
    const onFrame = ({ data }: { data: string }) => setRemoteFrame(data);
    const onEnded = () => {
      stopStreaming();
      router.push("/complaint/chat?callEnded=true");
    };

    s.on("call:frame", onFrame);
    s.on("call:ended", onEnded);
    
    // Join call room and start streaming
    s.emit("join", { room: ACTIVE_ROOM, userId: uid });
    if (permission?.granted) {
      startStreaming();
    }

    return () => {
      s.off("call:frame", onFrame);
      s.off("call:ended", onEnded);
      s.emit("leave", { room: ACTIVE_ROOM, userId: uid });
      stopStreaming();
    };
  }, [socket, uid, ACTIVE_ROOM, permission?.granted]);

  const startStreaming = useCallback(() => {
    if (frameTimer.current) return;
    frameTimer.current = setInterval(async () => {
      try {
        const cam: any = camRef.current;
        if (!cam?.takePictureAsync) return;
        const photo = await cam.takePictureAsync({
          quality: 0.15,
          base64: true,
          skipProcessing: true,
        });
        if (photo?.base64)
          socket.emit("call:frame", { room: ACTIVE_ROOM, data: photo.base64 });
      } catch {}
    }, 1000 / FPS);
  }, [ACTIVE_ROOM, socket]);

  const stopStreaming = useCallback(() => {
    if (frameTimer.current) clearInterval(frameTimer.current);
    frameTimer.current = null;
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      startStreaming();
    } else {
      requestPermission();
    }
  }, [permission?.granted, requestPermission, startStreaming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    socket.emit("call:hangup", { room: ACTIVE_ROOM });
    stopStreaming();
    router.push("/complaint/chat?callEnded=true");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <View style={styles.callInterface}>
        {/* Remote video */}
        <View style={styles.remoteVideo}>
          {remoteFrame ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${remoteFrame}` }}
              style={styles.videoFrame}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noVideoContainer}>
              <MaterialIcons name="account-circle" size={120} color="#666" />
              <Text style={styles.noVideoText}>Menunggu video dari agent...</Text>
            </View>
          )}
        </View>

        {/* Call info overlay */}
        <View style={styles.callInfoOverlay}>
          <Text style={styles.callerName}>BNI Agent</Text>
          <Text style={styles.callStatus}>Sedang Terhubung</Text>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>

        {/* Local camera preview */}
        {permission?.granted && (
          <View style={styles.localVideo}>
            <CameraView
              ref={(r: React.ElementRef<typeof CameraView> | null) => {
                camRef.current = r;
              }}
              facing={facing}
              style={styles.cameraPreview}
            />
          </View>
        )}

        {/* Call controls */}
        <View style={styles.callControls}>
          <TouchableOpacity style={styles.muteButton}>
            <MaterialIcons name="mic" size={30} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <MaterialIcons name="call-end" size={30} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.speakerButton}>
            <MaterialIcons name="volume-up" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  callInterface: {
    flex: 1,
    backgroundColor: "#000",
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: "#111",
  },
  videoFrame: {
    width: "100%",
    height: "100%",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noVideoText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 20,
    fontFamily: "Poppins",
  },
  callInfoOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  callerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Poppins",
  },
  callStatus: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 4,
    fontFamily: "Poppins",
  },
  callDuration: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 4,
    fontFamily: "Poppins",
  },
  localVideo: {
    position: "absolute",
    top: 120,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
  },
  callControls: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  muteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
  speakerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
});