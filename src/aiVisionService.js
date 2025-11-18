// src/services/aiVisionService.js
// Serviço de Visão Computacional

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebaseConfig';
import { aiConfig } from '../config/aiConfig';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const functions = getFunctions(app);

export const aiVisionService = {
  // Validar imagem
  validateImage: (file) => {
    if (!file) {
      throw new Error('Nenhuma imagem selecionada');
    }
    if (file.size > aiConfig.limits.maxImageSize) {
      throw new Error('Imagem muito grande. Máximo 5MB');
    }
    if (!aiConfig.limits.supportedImageTypes.includes(file.type)) {
      throw new Error('Tipo de imagem não suportado');
    }
    return true;
  },

  // Upload de imagem para Storage
  uploadImage: async (file, folder = 'ai-images') => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return { url, fileName };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Falha no upload da imagem');
    }
  },

  // Classificar imagem (detectar objetos, pessoas, animais)
  classifyImage: async (imageFile) => {
    try {
      aiVisionService.validateImage(imageFile);
      
      const { url } = await aiVisionService.uploadImage(imageFile, 'classify-images');
      
      const classifyFunction = httpsCallable(functions, aiConfig.endpoints.classifyImage);
      const result = await classifyFunction({ imageUrl: url });
      
      return {
        labels: result.data.labels || [],
        imageUrl: url
      };
    } catch (error) {
      console.error('Erro ao classificar imagem:', error);
      throw error;
    }
  },

  // Detectar texto em imagem (OCR)
  detectText: async (imageFile) => {
    try {
      aiVisionService.validateImage(imageFile);
      
      const { url } = await aiVisionService.uploadImage(imageFile, 'ocr-images');
      
      const detectTextFunction = httpsCallable(functions, aiConfig.endpoints.detectText);
      const result = await detectTextFunction({ imageUrl: url });
      
      return {
        text: result.data.text || '',
        imageUrl: url
      };
    } catch (error) {
      console.error('Erro ao detectar texto:', error);
      throw error;
    }
  },

  // Análise completa de imagem
  analyzeImage: async (imageFile) => {
    try {
      aiVisionService.validateImage(imageFile);
      
      const { url } = await aiVisionService.uploadImage(imageFile, 'analyze-images');
      
      const analyzeFunction = httpsCallable(functions, aiConfig.endpoints.analyzeImage);
      const result = await analyzeFunction({ imageUrl: url });
      
      return {
        labels: result.data.labels || [],
        faces: result.data.faces || [],
        objects: result.data.objects || [],
        colors: result.data.colors || null,
        imageUrl: url
      };
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      throw error;
    }
  },

  // Detectar faces
  detectFaces: async (imageFile) => {
    try {
      const analysis = await aiVisionService.analyzeImage(imageFile);
      return {
        faces: analysis.faces,
        faceCount: analysis.faces?.length || 0,
        imageUrl: analysis.imageUrl
      };
    } catch (error) {
      console.error('Erro ao detectar faces:', error);
      throw error;
    }
  }
};