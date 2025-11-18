import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';

import { sendPasswordResetEmail } from "firebase/auth";

// Centralized authentication service

// Check if user is authenticated
export const isAuthenticated = (callback: (authState: { userId: string | null; error: string | null }) => void) => {
    const authInstance = getAuth();
    onAuthStateChanged(authInstance, (user) => {
        if (user) {
            callback({ userId: user.uid, error: null });
        } else {
            callback({ userId: null, error: 'User not authenticated. Please log in.' });
        }
    });
};

// Login function
export const login = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data()?.role || 'patient' : 'patient';

        // Get ID token and send to server to create an HttpOnly session cookie
        const idToken = await user.getIdToken();
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
        if (!res.ok) {
            throw new Error('Failed to establish session');
        }

        return { user, role };
    } catch {
        throw new Error('Failed to log in');
    }
};

// Fetch user details function
export async function fetchUserDetails(userId: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data(); // Return user details
        } else {

            return null;
        }
    } catch {
        return null;
    }
}

// Centralized password reset function
export async function resetUserPassword(email: string): Promise<void> {
    if (!email) throw new Error("Email is required to reset password");
    await sendPasswordResetEmail(auth, email);
}