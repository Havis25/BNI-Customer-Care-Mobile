import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { getSocket } from '../realtime/socket';

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private socket = getSocket();
  private currentRoom: string | null = null;

  private configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  async initializeCall() {
    try {
      // Audio only with enhanced quality settings
      this.localStream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
        video: false,
      });

      this.peerConnection = new RTCPeerConnection(this.configuration);

      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.currentRoom) {
          this.socket.emit('webrtc:ice-candidate', {
            room: this.currentRoom,
            candidate: event.candidate
          });
        }
      };

      this.peerConnection.ontrack = (event) => {
        
        // Remote audio will be played automatically by WebRTC
      };

      return this.localStream;
    } catch (error) {
      console.error('Error initializing call:', error);
      throw error;
    }
  }

  async createOffer(room: string) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false
    });
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit('webrtc:offer', { room, offer, audioOnly: true });
    return offer;
  }

  async createAnswer(room: string, offer: RTCSessionDescription) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    
    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socket.emit('webrtc:answer', { room, answer });
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescription) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate: RTCIceCandidate) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  endCall(room?: string) {
    if (room) {
      this.socket.emit('webrtc:end-call', { room });
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  setCurrentRoom(room: string) {
    this.currentRoom = room;
  }

  toggleAudio(room: string, enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.socket.emit('webrtc:audio-toggle', { room, enabled });
    }
  }

  // Video functionality removed - audio only implementation
}

export default new WebRTCService();
