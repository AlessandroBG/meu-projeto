// src/App.jsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { authService, firestoreService } from "./services/firebaseService";
import AIPanel from "./components/AIPanel";

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notes"); // 'notes' ou 'ai'

  useEffect(() => {
    const auth = authService.getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadNotes(currentUser.uid);
      } else {
        setNotes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadNotes = async (userId) => {
    try {
      const loadedNotes = await firestoreService.loadNotes(userId);
      setNotes(loadedNotes);
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Preencha email e senha");
      return;
    }
    try {
      await authService.signUp(email, password);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha email e senha");
      return;
    }
    try {
      await authService.login(email, password);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await firestoreService.addNote(user.uid, newNote);
      setNewNote("");
      await loadNotes(user.uid);
    } catch (err) {
      setError("Erro ao adicionar nota");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await firestoreService.deleteNote(noteId);
      await loadNotes(user.uid);
    } catch (err) {
      setError("Erro ao deletar nota");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
        <h2 style={{ textAlign: "center" }}>Autenticação</h2>

        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha (mínimo 6 caracteres)"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          onClick={handleSignUp}
          style={{
            width: "100%",
            padding: "10px",
            background: "#4caf50",
            color: "white",
            border: "none",
            marginBottom: "10px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Criar Nova Conta
        </button>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "#2196f3",
            color: "white",
            border: "none",
            marginBottom: "10px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Fazer Login
        </button>

        <div style={{ textAlign: "center", margin: "15px 0" }}>ou</div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "10px",
            background: "white",
            border: "1px solid #ccc",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Conectado</strong>
            <div style={{ fontSize: "14px", color: "#666" }}>{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#f44336",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        <button
          onClick={() => setActiveTab("notes")}
          style={{
            padding: "10px 20px",
            background: activeTab === "notes" ? "#2196f3" : "transparent",
            color: activeTab === "notes" ? "white" : "#666",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
          }}
        >
          Notas
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          style={{
            padding: "10px 20px",
            background: activeTab === "ai" ? "#2196f3" : "transparent",
            color: activeTab === "ai" ? "white" : "#666",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
          }}
        >
          AI/ML
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* Conteúdo das Tabs */}
      {activeTab === "notes" ? (
        <div>
          <h2>Minhas Notas</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Digite uma nova nota..."
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleAddNote}
              style={{
                padding: "10px 20px",
                background: "#2196f3",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Adicionar
            </button>
          </div>

          <div>
            {notes.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#999" }}
              >
                <p>Nenhuma nota ainda</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    background: "#f5f5f5",
                    padding: "15px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "4px",
                  }}
                >
                  <span>{note.text}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{
                      padding: "5px 10px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Deletar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <AIPanel />
      )}
    </div>
  );
};

export default App;
