import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatSession } from "./types";

/**
 * Recursively removes any keys with `undefined` values from an object or array.
 * This ensures that Firestore setDoc operates cleanly without validation exceptions.
 */
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  } else if (obj !== null && typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Saves a single chat session for a user in Firestore
 */
export async function saveUserSession(uid: string, session: ChatSession): Promise<void> {
  const sessionRef = doc(db, "users", uid, "sessions", session.id);
  // Ensure we store timestamp order or exact metadata
  await setDoc(sessionRef, cleanUndefined({
    ...session,
    updatedAt: Date.now() // addition for sorting if needed
  }));
}

/**
 * Deletes a single chat session for a user in Firestore
 */
export async function deleteUserSession(uid: string, sessionId: string): Promise<void> {
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  await deleteDoc(sessionRef);
}

/**
 * Retrieves all chat sessions for a user, sorted by creation or last update
 */
export async function getUserSessions(uid: string): Promise<ChatSession[]> {
  try {
    const sessionsCol = collection(db, "users", uid, "sessions");
    const q = query(sessionsCol, orderBy("id", "desc")); // sessionId typically begins with date timestamp
    const querySnapshot = await getDocs(q);
    
    const sessions: ChatSession[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      sessions.push({
        id: data.id,
        title: data.title || "Untitled Chat",
        createdAt: data.createdAt || "",
        messages: data.messages || [],
        primaryLanguage: data.primaryLanguage || "all"
      });
    });
    return sessions;
  } catch (error) {
    console.error("Firestore error retrieving sessions:", error);
    return [];
  }
}

/**
 * Batch saves multiple sessions to Firestore (useful for initial offline merge)
 */
export async function saveAllUserSessions(uid: string, sessions: ChatSession[]): Promise<void> {
  const batch = writeBatch(db);
  for (const session of sessions) {
    const sessionRef = doc(db, "users", uid, "sessions", session.id);
    batch.set(sessionRef, cleanUndefined({
      ...session,
      updatedAt: Date.now()
    }));
  }
  await batch.commit();
}
