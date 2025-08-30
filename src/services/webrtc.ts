import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import { getSocket } from "../realtime/socket";

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket = getSocket();
  private currentRoom: string | null = null;
  private isCallActive: boolean = false;
  private callStartTime: number | null = null;
  private isSpeakerEnabled: boolean = true; // Default to speaker for audio calls

  private configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:34.50.84.251:3478" }, // +1 baris
      {
        // +2 baris
        urls: "turn:34.50.84.251:3478", // +3 baris
        username: "bcare-user",
        credential: "bcare-secret-key-2024",
      },
    ],
  };

  async initializeCall() {
    try {
      // Setup audio session for proper routing
      await this.setupAudioSession();

      // Audio only with enhanced settings for better audio quality
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.peerConnection = new RTCPeerConnection(this.configuration);

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Handle ICE candidate events
      (this.peerConnection as any).addEventListener(
        "icecandidate",
        (event: any) => {
          if (event.candidate && this.currentRoom) {
            this.socket.emit("webrtc:ice-candidate", {
              room: this.currentRoom,
              candidate: event.candidate,
            });
          }
        }
      );

      // Handle incoming audio track with proper routing
      (this.peerConnection as any).addEventListener("track", (event: any) => {
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          const audioTracks = remoteStream.getAudioTracks();

          // Store remote stream for audio playback
          this.remoteStream = remoteStream;

          audioTracks.forEach((track: any) => {
            // Enable remote audio track
            track.enabled = true;

            // Monitor track state for stability
            track.addEventListener("ended", () => {
              if (__DEV__) console.log("Remote audio track ended");
            });

            track.addEventListener("mute", () => {
              if (__DEV__) console.log("Remote audio track muted");
            });

            track.addEventListener("unmute", () => {
              if (__DEV__) console.log("Remote audio track unmuted");
            });
          });

          // Setup remote audio playback
          this.setupRemoteAudioPlayback(remoteStream);

          // Ensure audio routing to speaker
          this.setAudioOutputToSpeaker().catch((error) => {
            if (__DEV__) console.log("Audio routing error:", error);
          });

          if (__DEV__) {
            console.log("🎧 WebRTC Track Event - Remote stream connected");
            console.log("Audio tracks count:", audioTracks.length);
            console.log("Speaker enabled:", this.isSpeakerEnabled);
          }
        }
      });

      // Setup server compatibility event handlers
      this.setupServerCompatibility();

      return this.localStream;
    } catch (error) {
      console.error("Error initializing call:", error);
      throw error;
    }
  }

  async createOffer(room: string) {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");

    // Notify server about call start
    this.notifyCallStart(room);

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit("webrtc:offer", { room, offer, audioOnly: true });
    return offer;
  }

  async createAnswer(room: string, offer: RTCSessionDescription) {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socket.emit("webrtc:answer", { room, answer });
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescription) {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate: RTCIceCandidate) {
    if (!this.peerConnection)
      throw new Error("Peer connection not initialized");
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  endCall(room?: string) {
    if (room) {
      // Emit both WebRTC and server-compatible events
      this.socket.emit("webrtc:end-call", { room });
      this.socket.emit("call:hangup", { room });
    }

    // Stop audio streaming if active
    if (this.isCallActive && this.currentRoom) {
      this.socket.emit("audio:stop", { room: this.currentRoom });
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.isCallActive = false;
    this.callStartTime = null;
    this.isSpeakerEnabled = false; // Reset speaker state
  }

  setCurrentRoom(room: string) {
    this.currentRoom = room;
  }

  toggleAudio(room: string, enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = enabled;
      });

      // Emit both WebRTC and server-compatible events
      this.socket.emit("webrtc:audio-toggle", { room, enabled });

      if (enabled) {
        this.socket.emit("audio:start", { room });
      } else {
        this.socket.emit("audio:stop", { room });
      }
    }
  }

  toggleSpeaker(room: string, enabled: boolean) {
    this.isSpeakerEnabled = enabled;

    // Set audio output routing (async)
    this.setAudioOutputRouting(enabled).catch((error) => {
      if (__DEV__) console.log("Speaker toggle error:", error);
    });

    // Emit to inform other participants about speaker status
    this.socket.emit("webrtc:speaker-toggle", { room, enabled });
  }

  // Audio session setup for proper device routing
  private async setupAudioSession() {
    try {
      // Default to speaker for audio calls
      this.isSpeakerEnabled = true;

      if (__DEV__) {
        console.log("Audio session configured for WebRTC calls");
      }
    } catch (error) {
      if (__DEV__) console.log("Audio session setup warning:", error);
    }
  }

  // Set audio output routing (speaker vs earpiece)
  private async setAudioOutputRouting(toSpeaker: boolean) {
    try {
      // Use native routing if available
      if ((mediaDevices as any).setSpeakerphoneOn) {
        (mediaDevices as any).setSpeakerphoneOn(toSpeaker);
      }

      this.isSpeakerEnabled = toSpeaker;

      if (__DEV__) {
        console.log(`Audio routed to: ${toSpeaker ? "Speaker" : "Earpiece"}`);
      }
    } catch (error) {
      if (__DEV__) console.log("Audio routing warning:", error);
    }
  }

  // Force audio to speaker (for initial call setup)
  private async setAudioOutputToSpeaker() {
    await this.setAudioOutputRouting(true);
  }

  // Setup remote audio playback to ensure sound works
  private setupRemoteAudioPlayback(remoteStream: MediaStream) {
    try {
      // In React Native WebRTC, remote audio is automatically played
      // We just need to ensure the stream is properly configured
      const audioTracks = remoteStream.getAudioTracks();

      audioTracks.forEach((track: any) => {
        // Ensure track is enabled and playing
        track.enabled = true;

        // Set audio constraints for better quality
        if (track.applyConstraints) {
          track
            .applyConstraints({
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            })
            .catch((error: any) => {
              if (__DEV__) console.log("Audio constraints warning:", error);
            });
        }
      });

      // Force speaker output for remote audio
      this.setAudioOutputToSpeaker();

      if (__DEV__) {
        console.log("Remote audio playback configured");
        console.log("Remote audio tracks:", audioTracks.length);
      }
    } catch (error) {
      if (__DEV__) console.log("Remote audio setup error:", error);
    }
  }

  // Server compatibility methods
  private setupServerCompatibility() {
    // Handle server call events
    this.socket.on("call:ringing", (data: any) => {
      if (__DEV__) console.log("[WEBRTC] Call ringing from:", data.fromUserId);
    });

    this.socket.on("call:incoming", (data: any) => {
      if (__DEV__) console.log("[WEBRTC] Incoming call from:", data.fromUserId, "room:", data.room);
    });

    this.socket.on("call:accepted", () => {
      this.isCallActive = true;
      this.callStartTime = Date.now();

      // Start audio streaming notification to server
      if (this.currentRoom) {
        this.socket.emit("audio:start", { room: this.currentRoom });
      }
      
      if (__DEV__) console.log("[WEBRTC] Call accepted, audio started");
    });

    this.socket.on("call:declined", () => {
      if (__DEV__) console.log("[WEBRTC] Call declined");
      this.endCall(this.currentRoom || undefined);
    });

    this.socket.on("call:ended", () => {
      if (__DEV__) console.log("[WEBRTC] Call ended by server");
      this.endCall();
    });

    // Audio streaming handlers (for server compatibility)
    this.socket.on("audio:started", (data: any) => {
      if (__DEV__) console.log("[WEBRTC] Remote audio started from:", data.fromUserId);
    });

    this.socket.on("audio:stopped", (data: any) => {
      if (__DEV__) console.log("[WEBRTC] Remote audio stopped from:", data.fromUserId);
    });

    this.socket.on("audio:chunk", (data: any) => {
      // Audio chunks are handled by WebRTC, but log for debugging
      if (__DEV__) console.log("[WEBRTC] Audio chunk received, size:", data.data?.length);
    });
  }

  private notifyCallStart(room: string) {
    // Notify server about call initiation using server's expected format
    this.socket.emit("call:invite", { room });
  }

  // Method to accept call with server notification
  acceptCall(room: string) {
    this.socket.emit("call:accept", { room });
    this.isCallActive = true;
    this.callStartTime = Date.now();

    // Start audio streaming notification
    this.socket.emit("audio:start", { room });

    // Ensure audio is routed to speaker for audio calls
    this.setAudioOutputToSpeaker().catch((error) => {
      if (__DEV__) console.log("Audio routing error:", error);
    });
  }

  // Method to decline call with server notification
  declineCall(room: string) {
    this.socket.emit("call:decline", { room });
    this.endCall(room);
  }

  // Get call status for UI
  getCallStatus() {
    return {
      isActive: this.isCallActive,
      startTime: this.callStartTime,
      room: this.currentRoom,
      isSpeakerEnabled: this.isSpeakerEnabled,
    };
  }

  // Get connection state for debugging
  getConnectionState() {
    return this.peerConnection?.connectionState || "closed";
  }

  // Audio stream verification - Development only
  verifyAudioStream() {
    const status = {
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      localAudioTracks: this.localStream
        ? this.localStream.getAudioTracks().length
        : 0,
      remoteAudioTracks: this.remoteStream
        ? this.remoteStream.getAudioTracks().length
        : 0,
      localAudioEnabled: false,
      remoteAudioEnabled: false,
      peerConnectionState: this.peerConnection?.connectionState || "closed",
      iceConnectionState: this.peerConnection?.iceConnectionState || "closed",
      isSpeakerEnabled: this.isSpeakerEnabled,
    };

    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      status.localAudioEnabled = audioTracks.some(
        (track: any) => track.enabled
      );
    }

    if (this.remoteStream) {
      const audioTracks = this.remoteStream.getAudioTracks();
      status.remoteAudioEnabled = audioTracks.some(
        (track: any) => track.enabled
      );
    }

    if (__DEV__) {
      console.log("Audio Stream Status:", status);
    }
    return status;
  }

  // Force audio reconnection if needed - Development only
  async forceAudioReconnection(room: string) {
    if (__DEV__) {
      console.log("Forcing audio reconnection...");
    }

    if (this.localStream) {
      // Re-enable all audio tracks
      this.localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = true;
      });

      // Notify server about audio restart
      this.socket.emit("audio:start", { room });
    }
  }
}

export default new WebRTCService();
