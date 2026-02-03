import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSessions } from "./SessionsContext";

const RecycleBinContext = createContext();

const STORAGE_KEY = "study_tracker_recyclebin";
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7days

export const RecycleBinProvider = ({ children }) => {
    const { addSession, removeSession } = useSessions(); // session context
    const [deletedSessions, setDeletedSessions] = useState({}); // object keyed by session id

    // Load recycle bin on mount
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const now = Date.now();

        // purge expired sessions
        const validSessions = Object.fromEntries(
            Object.entries(stored).filter(
                ([, data]) => now - data.deletedAt < RETENTION_MS
            )
        );

        setDeletedSessions(validSessions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
    }, []);

    // Send a session to the recycle bin
    const sendToRecycleBin = (session) => {
        setDeletedSessions(prev => {
            const updated = {
                ...prev,
                [session.id]: { session, deletedAt: Date.now() }
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        // remove from active sessions
        removeSession(session.id);
    };

    // Restore a session
    const restoreSession = (sessionId) => {
        const deleted = deletedSessions[sessionId];
        if (!deleted) return;

        addSession(deleted.session); // add back to active sessions

        setDeletedSessions(prev => {
            const updated = { ...prev };
            delete updated[sessionId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    // Permanently delete a session
    const deletePermanently = (sessionId) => {
        setDeletedSessions(prev => {
            const updated = { ...prev };
            delete updated[sessionId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    // Clean the entire recycle bin
    const cleanRecycleBin = () => {
        setDeletedSessions({});
        localStorage.removeItem(STORAGE_KEY);
    };

    const value = useMemo(() => ({
        deletedSessions: Object.values(deletedSessions),
        sendToRecycleBin,
        restoreSession,
        deletePermanently,
        cleanRecycleBin,
    }), [deletedSessions, sendToRecycleBin, restoreSession, deletePermanently, cleanRecycleBin]);

    return (
        <RecycleBinContext.Provider value={value}>
            {children}
        </RecycleBinContext.Provider>
    );
};

export const useRecycleBin = () => useContext(RecycleBinContext);
