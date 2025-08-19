import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "@/lib/api";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: (fileName: string, type: 'image' | 'document') => void;
  ticketId?: string;
}

export default function UploadModal({ 
  visible, 
  onClose, 
  onUploadSuccess,
  ticketId
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileType, setFileType] = useState<'image' | 'document' | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setFileType('image');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar');
    }
  };

  const handleDocumentSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setFileType('document');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih dokumen');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileType) return;
    
    // Validate ticketId exists
    if (!ticketId) {
      Alert.alert('Error', 'Tidak ada tiket aktif untuk mengirim attachment.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Append file with proper format
      formData.append('file', {
        uri: selectedFile.uri,
        type: fileType === 'image' ? 'image/jpeg' : (selectedFile.mimeType || 'application/octet-stream'),
        name: selectedFile.name || (fileType === 'image' ? 'image.jpg' : 'document.pdf'),
      } as any);
      
      console.log('Uploading to ticket:', ticketId);
      console.log('File info:', {
        name: selectedFile.name,
        type: fileType,
        uri: selectedFile.uri
      });
      
      // Use ticket attachment endpoint
      const endpoint = `/v1/tickets/${ticketId}/attachments`;
      
      // Get authorization token from SecureStore
      const token = await SecureStore.getItemAsync('access_token');
      
      if (!token) {
        throw new Error('No authorization token found. Please login again.');
      }
      
      console.log('Using token for upload:', token.substring(0, 20) + '...');
      console.log('Full API URL:', `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`);
      
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Authorization header:', authHeader.substring(0, 30) + '...');
      
      // Use fetch directly for FormData with authorization
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': authHeader,
          'ngrok-skip-browser-warning': 'true',
          // Don't set Content-Type for FormData
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Upload success for ticket:', ticketId, result);
      
      onUploadSuccess(selectedFile.name || 'file', fileType);
      handleClose();
      
    } catch (error: any) {
      console.log('Upload error for ticket:', ticketId, error);
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileType(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.uploadModal}>
          <View style={styles.uploadHeader}>
            <Text style={styles.uploadTitle}>Upload File</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {!selectedFile ? (
            <>
              <TouchableOpacity style={styles.uploadOption} onPress={handleImageSelect}>
                <MaterialIcons name="photo" size={24} color="#52B5AB" />
                <Text style={styles.uploadOptionText}>Upload Gambar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.uploadOption} onPress={handleDocumentSelect}>
                <MaterialIcons name="attach-file" size={24} color="#52B5AB" />
                <Text style={styles.uploadOptionText}>Upload Dokumen</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.previewContainer}>
              <View style={styles.filePreview}>
                {fileType === 'image' ? (
                  <Image source={{ uri: selectedFile.uri }} style={styles.imagePreview} />
                ) : (
                  <MaterialIcons name="description" size={48} color="#52B5AB" />
                )}
                <Text style={styles.fileName}>{selectedFile.name}</Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setSelectedFile(null);
                    setFileType(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Mengirim...' : 'Selesai'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  uploadModal: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  uploadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins",
  },
  uploadOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  uploadOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    fontFamily: "Poppins",
  },
  previewContainer: {
    alignItems: "center",
  },
  filePreview: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    width: "100%",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    fontFamily: "Poppins",
  },
  uploadButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#52B5AB",
  },
  uploadButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Poppins",
  },
});