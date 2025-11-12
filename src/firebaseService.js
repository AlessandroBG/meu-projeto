// firebaseService.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Funções de Autenticação
export const authService = {
  // Criar nova conta
  signUp: async (email, password) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  // Fazer login
  login: async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  // Login com Google
  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  },

  // Fazer logout
  logout: async () => {
    return await signOut(auth);
  },

  // Obter auth instance
  getAuth: () => auth
};

// Funções do Firestore
export const firestoreService = {
  // Carregar notas do usuário
  loadNotes: async (userId) => {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    return notes;
  },

  // Adicionar nova nota
  addNote: async (userId, text) => {
    return await addDoc(collection(db, 'notes'), {
      text: text,
      userId: userId,
      createdAt: new Date().toISOString()
    });
  },

  // Deletar nota
  deleteNote: async (noteId) => {
    return await deleteDoc(doc(db, 'notes', noteId));
  }
};