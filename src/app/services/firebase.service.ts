import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Campo } from '../models/campo.model';
import { Tarea } from '../models/tarea.model';
import { Solicitud } from '../models/solicitud.model';
import { UtilsService } from './utils.service';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  // ======== AUTENTICACIÓN ========
  getAuthInstance() {
    return this.auth;
  }

  signIn(user: User) {
    return this.auth.signInWithEmailAndPassword(user.email, user.password!);
  }

  signUp(user: User) {
    return this.auth.createUserWithEmailAndPassword(user.email, user.password!);
  }

  signOut() {
    this.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.utilsSvc.routerLink('/auth');
    }).catch(console.error);
  }

  updateUser(displayName: string) {
    return this.auth.currentUser.then((user: FirebaseUser | null) => {
      if (user) return updateProfile(user, { displayName });
      throw new Error('No hay usuario autenticado');
    });
  }

  sendRecoveryEmail(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  async getCurrentUser() {
    return await this.auth.currentUser;
  }

  // ========= FIRESTORE =========
  getCampos(): Observable<Campo[]> {
    return this.firestore.collection<Campo>('campos').valueChanges({ idField: 'id' });
  }

  getCamposAsignados(uid: string): Observable<Campo[]> {
    return this.firestore.collection<Campo>('campos', ref => ref.where('colaboradores', 'array-contains', uid))
      .valueChanges({ idField: 'id' });
  }

  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('users').valueChanges({ idField: 'uid' });
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data, { merge: true });
  }

  updateDocument(path: string, data: any) {
    return updateDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  async deleteCampo(id: string) {
    return this.firestore.collection('campos').doc(id).delete();
  }

  getTareas(): Observable<Tarea[]> {
    return this.firestore.collection<Tarea>('tareas').valueChanges({ idField: 'id' });
  }

  getTareasAsignadas(uid: string): Observable<Tarea[]> {
    return this.firestore.collection<Tarea>('tareas', ref => ref.where('asignadoA', '==', uid))
      .valueChanges({ idField: 'id' });
  }

  getSolicitudes(): Observable<Solicitud[]> {
    return this.firestore.collection<Solicitud>('solicitudes').valueChanges({ idField: 'id' });
  }

  updateSolicitud(id: string, data: any) {
    return updateDoc(doc(getFirestore(), `solicitudes/${id}`), data);
  }

  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  async updateTarea(id: string, data: any) {
    return updateDoc(doc(getFirestore(), `tareas/${id}`), data);
  }

  // ===== Subir archivo =====
  async uploadFile(path: string, file: File): Promise<string> {
    const fileRef = this.storage.ref(path);
    const task = this.storage.upload(path, file);
    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(async () => {
          const url = await fileRef.getDownloadURL().toPromise();
          resolve(url);
        })
      ).subscribe({ error: reject });
    });
  }

  // ====== ENVIAR NOTIFICACIÓN (vía servidor Node.js o Vercel) ======
  async sendPushNotification(token: string, title: string, body: string) {
    try {
      const res = await fetch('http://localhost:3000/notify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceToken: token,
          taskTitle: title,
          taskDeadline: body,  // usamos "body" como fecha/mensaje
        }),
      });
      return await res.json();
    } catch (err) {
      console.error('Error enviando notificación:', err);
      return null;
    }
  }
}
