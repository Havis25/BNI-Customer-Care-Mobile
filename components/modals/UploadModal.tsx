import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, API_BASE } from "@/lib/api";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: (fileName: string, type: 'image' | 'document', downloadUrl?: string) => void;
  ticketId?: string;
  existingFiles?: Array<{
    attachment_id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    upload_time: string;
    file_path: string;
  }>;
  onDeleteFile?: (attachmentId: number) => void;
}

export default function UploadModal({ 
  visible, 
  onClose, 
  onUploadSuccess,
  ticketId,
  existingFiles = [],
  onDeleteFile
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
        quality: 0.5, // Reduced quality for smaller file size
        compress: 0.5, // Additional compression
      });
      
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        // For images, use fileSize property instead of size
        const fileWithSize = {
          ...file,
          size: file.fileSize || file.size
        };
        setSelectedFile(fileWithSize);
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
    

    
    // Validate ticketId exists and is valid
    if (!ticketId || 
        ticketId.trim() === '' || 
        ticketId === 'undefined' || 
        ticketId === 'null') {
      Alert.alert(
        'Tiket Tidak Tersedia', 
        'Silakan buat tiket terlebih dahulu sebelum mengirim attachment.'
      );
      return;
    }
    
    // Validate file size (max 1MB for better compatibility)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    const fileSize = selectedFile.size || selectedFile.fileSize || 0;
    
    if (fileSize > maxSize) {
      Alert.alert(
        'File Terlalu Besar', 
        `Ukuran file maksimal 1MB. File Anda berukuran ${formatFileSize(fileSize)}.`
      );
      return;
    }
    
    if (fileSize === 0) {
      Alert.alert(
        'Error', 
        'Tidak dapat mendeteksi ukuran file. Silakan coba file lain.'
      );
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // Determine proper MIME type
      let mimeType = selectedFile.mimeType || 'application/octet-stream';
      if (fileType === 'image' && !mimeType.startsWith('image/')) {
        mimeType = 'image/jpeg';
      }
      
      const fileName = selectedFile.name || (fileType === 'image' ? 'image.jpg' : 'document.pdf');
      
      // Append file with proper format for React Native
      const fileObject = {
        uri: selectedFile.uri,
        type: mimeType,
        name: fileName,
      };
      
      formData.append('file', fileObject as any);
      
      // Final validation before server request
      if (!ticketId || ticketId.toString().trim() === '' || ticketId === 'undefined' || ticketId === 'null') {
        throw new Error('Invalid ticket ID - cannot upload without valid ticket');
      }
      

      
      // Use ticket attachment endpoint
      const endpoint = `/v1/tickets/${ticketId}/attachments`;
      const fullUrl = `${API_BASE}${endpoint}`;
      
      // Get authorization token from SecureStore
      const token = await SecureStore.getItemAsync('access_token');
      
      if (!token) {
        throw new Error('No authorization token found. Please login again.');
      }
      
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Use fetch directly for FormData with authorization
      const requestHeaders = {
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      };
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
        headers: requestHeaders,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      let result;
      let errorText = '';
      
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            errorText = responseText;
          }
        }
      } catch (textError) {
        errorText = 'Failed to read response';
      }
      
      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText || 'No error text',
          resultMessage: result?.message || 'No result message',
          fileSize: fileSize,
          fileName: fileName
        };
        console.error('Upload failed - Server Response:', errorDetails);
        throw new Error(`Upload failed: ${response.status} - ${errorText || result?.message || response.statusText}`);
      }
      
      if (result) {
        // Use the actual filename that will be saved on server
        const actualFileName = selectedFile.name || (fileType === 'image' ? 'image.jpg' : 'document.pdf');
        
        // Get attachment ID from upload response
        const attachmentId = result.data?.attachments?.[0]?.attachment_id || result.data?.attachment_id;
        
        // Get download URL for later use in chat
        let downloadUrl = null;
        if (attachmentId) {
          try {
            const attachmentEndpoint = `/v1/attachments/${attachmentId}`;
            const attachmentResponse = await fetch(`${API_BASE}${attachmentEndpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': authHeader,
                'ngrok-skip-browser-warning': 'true',
                'Accept': 'application/json',
              },
            });
            
            if (attachmentResponse.ok) {
              const attachmentData = await attachmentResponse.json();
              downloadUrl = attachmentData.data?.download_url;
            }
          } catch (error) {
            // Failed to get download URL, continue without it
          }
        }
        
        onUploadSuccess(actualFileName, fileType, downloadUrl);
        handleClose();
      } else {
        throw new Error('No response data received from server');
      }
      
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat upload';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timeout. Silakan coba lagi.';
      } else if (error.message?.includes('413')) {
        errorMessage = 'File terlalu besar untuk server. Maksimal 1MB.';
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = 'Koneksi internet bermasalah. Silakan cek koneksi Anda.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Silakan coba lagi.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error Upload', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileType(null);
    onClose();
  };

  const handleViewFile = (file: any) => {
    const isImage = file.file_type.startsWith('image/');
    const fileUrl = `${API_BASE}${file.file_path}`;
    
    Alert.alert(
      isImage ? 'Preview Gambar' : 'File Dokumen',
      `Nama: ${file.file_name}\nUkuran: ${formatFileSize(file.file_size)}\nDiupload: ${formatUploadTime(file.upload_time)}\n\nURL: ${fileUrl}`,
      [
        { text: 'Tutup', style: 'cancel' },
        { 
          text: 'Buka File', 
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(fileUrl);
              if (supported) {
                await Linking.openURL(fileUrl);
              } else {
                Alert.alert('Error', 'Tidak dapat membuka file ini');
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal membuka file');
            }
          }
        }
      ]
    );
  };

  const handleDeleteFile = async (attachmentId: number) => {
    Alert.alert(
      'Hapus File',
      'Apakah Anda yakin ingin menghapus file ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => onDeleteFile?.(attachmentId)
        }
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          
          {/* Existing Files */}
          {existingFiles && existingFiles.length > 0 && (
            <View style={styles.existingFilesContainer}>
              <Text style={styles.existingFilesTitle}>File yang sudah dikirim ({existingFiles.length}):</Text>
              {existingFiles.map((file) => (
                <View key={file.attachment_id} style={styles.existingFileItem}>
                  <View style={styles.fileInfo}>
                    <MaterialIcons 
                      name={file.file_type.startsWith('image/') ? 'image' : 'description'} 
                      size={20} 
                      color="#52B5AB" 
                    />
                    <View style={styles.fileDetails}>
                      <Text style={styles.existingFileName} numberOfLines={1}>{file.file_name}</Text>
                      <Text style={styles.fileMetadata}>
                        {formatFileSize(file.file_size)} • {formatUploadTime(file.upload_time)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fileActions}>
                    <TouchableOpacity 
                      onPress={() => handleViewFile(file)}
                      style={styles.viewButton}
                    >
                      <MaterialIcons name="visibility" size={16} color="#52B5AB" />
                    </TouchableOpacity>
                    {onDeleteFile && (
                      <TouchableOpacity 
                        onPress={() => handleDeleteFile(file.attachment_id)}
                        style={styles.deleteButton}
                      >
                        <MaterialIcons name="delete" size={16} color="#FF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* No files message */}
          {existingFiles && existingFiles.length === 0 && (
            <View style={styles.noFilesContainer}>
              <MaterialIcons name="attach-file" size={32} color="#CCC" />
              <Text style={styles.noFilesText}>Belum ada file yang dikirim</Text>
            </View>
          )}

          {!selectedFile ? (
            <>
              <View style={styles.fileLimitInfo}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text style={styles.fileLimitText}>Maksimal ukuran file: 1MB</Text>
              </View>
              
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
                {(selectedFile.size || selectedFile.fileSize) && (
                  <Text style={styles.fileSize}>
                    Ukuran: {formatFileSize(selectedFile.size || selectedFile.fileSize || 0)}
                  </Text>
                )}
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
  fileSize: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: "Poppins",
    marginTop: 4,
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
  existingFilesContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
  },
  existingFilesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    fontFamily: "Poppins",
  },
  existingFileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  existingFileName: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
  },
  fileMetadata: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontFamily: "Poppins",
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
  },
  noFilesContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 20,
  },
  noFilesText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    fontFamily: "Poppins",
  },
  fileLimitInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    gap: 6,
  },
  fileLimitText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins",
  },
});