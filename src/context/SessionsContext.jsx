import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SessionsContext = createContext();
const STORAGE_KEY = "study_tracker_sessions";

export const SessionsProvider = ({ children }) => {
    const [sessions, setSessions] = useState([]);
    const [loaded, setLoaded] = useState(false);

    //Load sessions from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed) && parsed.length > 0) {
                setSessions(parsed);
                console.log("Loaded sessions from LocalStorage:", JSON.parse(stored));
            } else {
                console.log("LocalStorage had an empty or invalid sessions array, ignoring.")
            }
        }

        setLoaded(true);
    }, []);

    // Save sessions to localStorage only after they are loaded from storage
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
            console.log("Sessions updated:", sessions);
        }
    }, [sessions, loaded]);

    // CRUD functions
    const addSession = (session) => {
        setSessions(prev => [...prev, session]);
        console.log("addSession called", session);
    };

    const updateSession = (updated) => {
        setSessions(prev =>
            prev.map((s) => (s.id === updated.id ? updated : s))
        );
        console.log("updateSession called:", updated);
    };

    const removeSession = (id) => {
        setSessions(prev => prev.filter((s) => s.id !== id));
        console.log("deleteSession called for ID:", id);
    };

    const value = useMemo(
        () => ({ sessions, addSession, updateSession, removeSession }),
        [sessions]
    );

    return (
        <SessionsContext.Provider
            value={value}>
            {children} {/* Render child components inside the provider */}
        </SessionsContext.Provider>
    );
};

export const useSessions = () => {
    const context = useContext(SessionsContext);
    if (!context) {
        throw new Error("useSessions must be used within a SessionsProvider");
    }
    return context;
};

