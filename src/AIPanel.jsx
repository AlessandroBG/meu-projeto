// src/components/AIPanel.jsx
// Componente do painel de AI

import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

const AIPanel = () => {
  const { 
    loading, 
    error, 
    result, 
    classifyImage, 
    detectText, 
    analyzeSentiment,
    translateText 
  } = useAI();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Handlers para imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassifyImage = async () => {
    if (!selectedImage) return;
    await classifyImage(selectedImage);
  };

  const handleDetectText = async () => {
    if (!selectedImage) return;
    await detectText(selectedImage);
  };

  const handleAnalyzeSentiment = async () => {
    if (!textInput.trim()) return;
    await analyzeSentiment(textInput);
  };

  const handleTranslate = async () => {
    if (!textInput.trim()) return;
    await translateText(textInput, targetLanguage);
  };

  return (
    <div style={{padding: '20px'}}>
      <h2>Firebase AI/ML</h2>

      {error && (
        <div style={{
          background: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          marginBottom: '15px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Seção de Visão Computacional */}
      <div style={{
        background: '#f5f5f5', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h3>Análise de Imagem</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{marginBottom: '10px', display: 'block'}}
        />

        {imagePreview && (
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{
              maxWidth: '300px', 
              maxHeight: '200px', 
              marginBottom: '10px',
              display: 'block',
              borderRadius: '4px'
            }} 
          />
        )}

        {selectedImage && (
          <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <button
              onClick={handleClassifyImage}
              disabled={loading}
              style={{
                padding: '8px 16px', 
                background: '#4caf50', 
                color: 'white', 
                border: 'none', 
                cursor: loading ? 'wait' : 'pointer',
                borderRadius: '4px'
              }}
            >
              {loading ? 'Processando...' : 'Classificar'}
            </button>
            
            <button
              onClick={handleDetectText}
              disabled={loading}
              style={{
                padding: '8px 16px', 
                background: '#ff9800', 
                color: 'white', 
                border: 'none', 
                cursor: loading ? 'wait' : 'pointer',
                borderRadius: '4px'
              }}
            >
              {loading ? 'Processando...' : 'Detectar Texto'}
            </button>
          </div>
        )}

        {result && result.labels && (
          <div style={{
            background: 'white', 
            padding: '10px', 
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            <strong>Labels detectados:</strong>
            <ul>
              {result.labels.map((label, index) => (
                <li key={index}>
                  {label.description} - {(label.score * 100).toFixed(1)}%
                </li>
              ))}
            </ul>
          </div>
        )}

        {result && result.text && (
          <div style={{
            background: 'white', 
            padding: '10px', 
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            <strong>Texto detectado:</strong>
            <p>{result.text}</p>
          </div>
        )}
      </div>

      {/* Seção de Processamento de Linguagem */}
      <div style={{
        background: '#f5f5f5', 
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3>Processamento de Texto</h3>
        
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Digite um texto..."
          style={{
            width: '100%', 
            padding: '10px', 
            fontSize: '14px', 
            minHeight: '100px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
          <button
            onClick={handleAnalyzeSentiment}
            disabled={loading}
            style={{
              padding: '8px 16px', 
              background: '#9c27b0', 
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'wait' : 'pointer',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Analisando...' : 'Analisar Sentimento'}
          </button>

          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
            <option value="fr">Francês</option>
            <option value="de">Alemão</option>
            <option value="it">Italiano</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={loading}
            style={{
              padding: '8px 16px', 
              background: '#2196f3', 
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'wait' : 'pointer',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Traduzindo...' : 'Traduzir'}
          </button>
        </div>

        {result && result.sentiment && (
          <div style={{
            background: 'white', 
            padding: '10px', 
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            <strong>Análise de Sentimento:</strong>
            <p>Sentimento: {result.sentiment}</p>
            <p>Score: {result.score?.toFixed(2)}</p>
            <p>Descrição: {result.description}</p>
          </div>
        )}

        {result && result.translatedText && (
          <div style={{
            background: 'white', 
            padding: '10px', 
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            <strong>Tradução:</strong>
            <p>{result.translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPanel;