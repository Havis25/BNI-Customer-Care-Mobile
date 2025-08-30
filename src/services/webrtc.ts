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
  private socket = getSocket();
  private currentRoom: string | null = null;
  private isCallActive: boolean = false;
  private callStartTime: number | null = null;

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
      // Audio only with basic settings
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

      // Handle incoming audio track
      (this.peerConnection as any).addEventListener("track", (event: any) => {
        // Remote audio will be played automatically by WebRTC
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          const audioTracks = remoteStream.getAudioTracks();

          audioTracks.forEach((track: any) => {
            // Monitor track state for stability
            track.addEventListener("ended", () => {
              if (__DEV__) console.log("Audio track ended");
            });
          });
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

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.isCallActive = false;
    this.callStartTime = null;
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
    // For React Native, speaker toggle is handled by the system
    // We emit this to inform other participants about speaker status
    this.socket.emit("webrtc:speaker-toggle", { room, enabled });
  }

  // Server compatibility methods
  private setupServerCompatibility() {
    // Handle server call events
    this.socket.on("call:ringing", (data: any) => {
      // WebRTC call is already initiated, just handle for compatibility
    });

    this.socket.on("call:incoming", (data: any) => {
      // WebRTC call handling is already in place
    });

    this.socket.on("call:accepted", () => {
      this.isCallActive = true;
      this.callStartTime = Date.now();

      // Start audio streaming notification to server
      if (this.currentRoom) {
        this.socket.emit("audio:start", { room: this.currentRoom });
      }
    });

    this.socket.on("call:declined", () => {
      this.endCall(this.currentRoom || undefined);
    });

    this.socket.on("call:ended", () => {
      this.endCall();
    });

    // Audio streaming handlers (for server compatibility)
    this.socket.on("audio:started", (data: any) => {
      // Remote audio started
    });

    this.socket.on("audio:stopped", (data: any) => {
      // Remote audio stopped
    });

    this.socket.on("audio:chunk", (data: any) => {
      // Audio chunks are handled by WebRTC
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
  }

  // Method to decline call with server notification
  declineCall(room: string) {
    this.socket.emit("call:decline", { room });
  }

  // Get call status for UI
  getCallStatus() {
    return {
      isActive: this.isCallActive,
      startTime: this.callStartTime,
      room: this.currentRoom,
    };
  }

  // Audio stream verification - Development only
  verifyAudioStream() {
    const status = {
      hasLocalStream: !!this.localStream,
      localAudioTracks: this.localStream
        ? this.localStream.getAudioTracks().length
        : 0,
      localAudioEnabled: false,
      peerConnectionState: this.peerConnection?.connectionState || "closed",
      iceConnectionState: this.peerConnection?.iceConnectionState || "closed",
    };

    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      status.localAudioEnabled = audioTracks.some(
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

  // Video functionality removed - audio only implementation
}

export default new WebRTCService();
