// src/hooks/useAI.js
// Hook customizado para funcionalidades de AI

import { useState } from 'react';
import { aiVisionService } from '../services/aiVisionService';
import { aiLanguageService } from '../services/aiLanguageService';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Resetar estado
  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  // Vision AI
  const classifyImage = async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiVisionService.classifyImage(imageFile);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const detectText = async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiVisionService.detectText(imageFile);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiVisionService.analyzeImage(imageFile);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Language AI
  const analyzeSentiment = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiLanguageService.analyzeSentiment(text);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text, targetLanguage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiLanguageService.translateText(text, targetLanguage);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiLanguageService.moderateContent(text);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado
    loading,
    error,
    result,
    reset,
    
    // Vision
    classifyImage,
    detectText,
    analyzeImage,
    
    // Language
    analyzeSentiment,
    translateText,
    moderateContent
  };
};