import React, { useState, useEffect } from 'react';

const App = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  const saveConfig = async () => {
    if (!config.apiKey || !config.projectId) {
      setError('Preencha pelo menos API Key e Project ID');
      return;
    }

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const app = initializeApp(config);
      const auth = getAuth(app);
      const db = getFirestore(app);

      window.firebaseAuth = auth;
      window.firebaseDB = db;
      window.firebaseModules = {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        signInWithPopup,
        GoogleAuthProvider,
        signOut,
        collection,
        addDoc,
        getDocs,
        deleteDoc,
        doc,
        query,
        where,
        orderBy
      };

      setStep(2);
      setError('');

      onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await loadNotes(currentUser.uid);
          setStep(3);
        }
      });
    } catch (err) {
      setError('Erro: ' + err.message);
    }
  };

  const loadNotes = async (userId) => {
    try {
      const { collection, query, where, orderBy, getDocs } = window.firebaseModules;
      const notesRef = collection(window.firebaseDB, 'notes');
      const q = query(notesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedNotes = [];
      querySnapshot.forEach((doc) => {
        loadedNotes.push({ id: doc.id, ...doc.data() });
      });
      setNotes(loadedNotes);
    } catch (err) {
      console.error('Erro ao carregar notas:', err);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }
    try {
      const { createUserWithEmailAndPassword } = window.firebaseModules;
      await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }
    try {
      const { signInWithEmailAndPassword } = window.firebaseModules;
      await signInWithEmailAndPassword(window.firebaseAuth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { signInWithPopup, GoogleAuthProvider } = window.firebaseModules;
      const provider = new GoogleAuthProvider();
      await signInWithPopup(window.firebaseAuth, provider);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { signOut } = window.firebaseModules;
      await signOut(window.firebaseAuth);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const { collection, addDoc } = window.firebaseModules;
      await addDoc(collection(window.firebaseDB, 'notes'), {
        text: newNote,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setNewNote('');
      await loadNotes(user.uid);
    } catch (err) {
      setError('Erro ao adicionar nota');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { deleteDoc, doc } = window.firebaseModules;
      await deleteDoc(doc(window.firebaseDB, 'notes', noteId));
      await loadNotes(user.uid);
    } catch (err) {
      setError('Erro ao deletar nota');
    }
  };

  if (step === 1) {
    return (
      <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
        <h1>Passo 1: Configure o Firebase</h1>
        
        <div style={{background: '#e3f2fd', padding: '15px', marginBottom: '20px', borderLeft: '4px solid #2196f3'}}>
          <h3>Siga estas etapas:</h3>
          <ol style={{lineHeight: '1.8'}}>
            <li>Acesse: <a href="https://console.firebase.google.com" target="_blank">console.firebase.google.com</a></li>
            <li>Clique em "Adicionar projeto"</li>
            <li>Dê um nome e clique "Continuar" 3 vezes</li>
            <li>Menu: <strong>Authentication</strong> - Começar - Ative <strong>Google</strong> e <strong>Email/senha</strong></li>
            <li>Menu: <strong>Firestore Database</strong> - Criar banco - Modo teste - Ativar</li>
            <li>Clique na engrenagem - Configurações do projeto</li>
            <li>Em "Seus apps", clique no ícone de código</li>
            <li>Registre o app e copie os valores abaixo:</li>
          </ol>
        </div>

        {error && <div style={{background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px'}}>{error}</div>}

        <div>
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>apiKey *</label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              placeholder="AIzaSyD..."
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>authDomain</label>
            <input
              type="text"
              value={config.authDomain}
              onChange={(e) => setConfig({...config, authDomain: e.target.value})}
              placeholder="seu-projeto.firebaseapp.com"
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>projectId *</label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => setConfig({...config, projectId: e.target.value})}
              placeholder="seu-projeto"
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>storageBucket</label>
            <input
              type="text"
              value={config.storageBucket}
              onChange={(e) => setConfig({...config, storageBucket: e.target.value})}
              placeholder="seu-projeto.appspot.com"
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>messagingSenderId</label>
            <input
              type="text"
              value={config.messagingSenderId}
              onChange={(e) => setConfig({...config, messagingSenderId: e.target.value})}
              placeholder="123456789"
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>appId</label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => setConfig({...config, appId: e.target.value})}
              placeholder="1:123456:web:abc123"
              style={{width: '100%', padding: '8px', fontSize: '14px'}}
            />
          </div>

          <button
            onClick={saveConfig}
            style={{width: '100%', padding: '12px', background: '#2196f3', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}
          >
            Conectar ao Firebase
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{padding: '20px', maxWidth: '400px', margin: '50px auto'}}>
        <h2 style={{textAlign: 'center'}}>Autenticação</h2>

        {error && <div style={{background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px'}}>{error}</div>}

        <div style={{marginBottom: '15px'}}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{width: '100%', padding: '10px', fontSize: '14px'}}
          />
        </div>

        <div style={{marginBottom: '15px'}}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha (mínimo 6 caracteres)"
            style={{width: '100%', padding: '10px', fontSize: '14px'}}
          />
        </div>

        <button
          onClick={handleSignUp}
          style={{width: '100%', padding: '10px', background: '#4caf50', color: 'white', border: 'none', marginBottom: '10px', cursor: 'pointer'}}
        >
          Criar Nova Conta
        </button>
        
        <button
          onClick={handleLogin}
          style={{width: '100%', padding: '10px', background: '#2196f3', color: 'white', border: 'none', marginBottom: '10px', cursor: 'pointer'}}
        >
          Fazer Login
        </button>

        <div style={{textAlign: 'center', margin: '15px 0'}}>ou</div>

        <button
          onClick={handleGoogleLogin}
          style={{width: '100%', padding: '10px', background: 'white', border: '1px solid #ccc', cursor: 'pointer'}}
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <div style={{background: '#f5f5f5', padding: '15px', marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <strong>Conectado</strong>
            <div style={{fontSize: '14px', color: '#666'}}>{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer'}}
          >
            Sair
          </button>
        </div>
      </div>

      <h2>Minhas Notas no Firestore</h2>

      {error && <div style={{background: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '15px'}}>{error}</div>}

      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Digite uma nova nota..."
          style={{flex: 1, padding: '10px', fontSize: '14px'}}
        />
        <button
          onClick={handleAddNote}
          style={{padding: '10px 20px', background: '#2196f3', color: 'white', border: 'none', cursor: 'pointer'}}
        >
          Adicionar
        </button>
      </div>

      <div>
        {notes.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            <p>Nenhuma nota ainda</p>
            <p>Crie sua primeira nota acima</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              style={{background: '#f5f5f5', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            >
              <span>{note.text}</span>
              <button
                onClick={() => handleDeleteNote(note.id)}
                style={{padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer'}}
              >
                Deletar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;