import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface CallModalProps {
  visible: boolean;
  callStatus: string;
  onStatusChange: (status: string) => void;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  remoteFrame?: string | null;
  onHangup?: () => void;
  camRef?: React.RefObject<React.ElementRef<typeof CameraView>>;
  permission?: any;
}

export default function CallModal({ visible, callStatus, onStatusChange, onClose, onAccept, onDecline, remoteFrame, onHangup, camRef, permission: cameraPermission }: CallModalProps) {
  const [localPermission, requestPermission] = useCameraPermissions();
  const permission = cameraPermission || localPermission;
  const [callDuration, setCallDuration] = useState(0);
  const [facing] = useState<"front" | "back">("front");

  useEffect(() => {
    let interval: number;
    if (callStatus === "in-call") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (onHangup) onHangup();
    onClose();
  };

  if (callStatus === "in-call") {
    return (
      <Modal visible={visible} transparent={false} animationType="slide">
        <View style={styles.fullScreenCall}>
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
            <Text style={styles.callerNameOverlay}>BNI Agent</Text>
            <Text style={styles.callDurationOverlay}>{formatDuration(callDuration)}</Text>
          </View>

          {/* Local camera preview */}
          {permission?.granted && (
            <View style={styles.localVideo}>
              <CameraView
                ref={(r: React.ElementRef<typeof CameraView> | null) => {
                  if (camRef && r) camRef.current = r;
                }}
                facing={facing}
                style={styles.cameraPreview}
              />
            </View>
          )}

          {/* Call controls */}
          <View style={styles.callControlsOverlay}>
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
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.callModal}>
          <MaterialIcons name="account-circle" size={80} color="#666" />
          <Text style={styles.callerName}>BNI Agent</Text>
          <Text style={styles.callStatus}>
            {callStatus === "idle"
              ? "Menghubungi..."
              : callStatus === "ringing"
              ? "Panggilan Masuk..."
              : "Panggilan Berakhir"}
          </Text>

          {callStatus === "ringing" && (
            <View style={styles.callButtons}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => {
                  if (onDecline) {
                    onDecline();
                  } else {
                    onStatusChange("idle");
                    onClose();
                  }
                }}
              >
                <MaterialIcons name="call-end" size={30} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  if (onAccept) {
                    onAccept();
                  } else {
                    onStatusChange("in-call");
                    if (!permission?.granted) {
                      requestPermission();
                    }
                  }
                }}
              >
                <MaterialIcons name="call" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {callStatus === "idle" && (
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  callModal: {
    backgroundColor: "#FFF",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    width: 300,
  },
  callerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    fontFamily: "Poppins",
  },
  callStatus: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 30,
    fontFamily: "Poppins",
  },
  callButtons: {
    flexDirection: "row",
    gap: 40,
  },
  acceptButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  fullScreenCall: {
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
  callerNameOverlay: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Poppins",
  },
  callDurationOverlay: {
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
  callControlsOverlay: {
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