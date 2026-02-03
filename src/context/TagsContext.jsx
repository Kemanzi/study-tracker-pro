import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TagsContext = createContext();
const STORAGE_KEY = "study_tracker_tags";

const DEFAULT_TAGS = ["Exam", "Assignment", "Reading", "Revision"];

const normalize = (name) => name.trim().toLowerCase();

export const TagsProvider = ({ children }) => {
    const [tags, setTags] = useState({});
    const [loaded, setLoaded] = useState(false);

    // Load tags once
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

        const defaults = Object.fromEntries(
            DEFAULT_TAGS.map(name => [
                normalize(name),
                { id: normalize(name), name, count: 0 }
            ])
        );

        setTags({ ...defaults, ...stored });
        setLoaded(true);
    }, []);

    // Persist only user-created tags
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));

    }, [tags, loaded]);


    const addTagIfMissing = (name) => {
        const id = normalize(name);

        setTags(prev => {
            if (prev[id]) return prev;
            return {
                ...prev,
                [id]: { id, name, count: 0 }
            };
        });
    };

    const incrementTag = (name) => {
        const id = normalize(name);

        setTags(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                count: prev[id].count + 1
            }
        }));
    };

    const decrementTag = (name) => {
        const id = normalize(name);

        setTags(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                count: Math.max(0, prev[id].count - 1)
            }
        }));
    };

    // 🔑 This is gold for editing sessions
    const updateTagUsage = (prevTags = [], nextTags = []) => {
        const removed = prevTags.filter(t => !nextTags.includes(t));
        const added = nextTags.filter(t => !prevTags.includes(t));

        removed.forEach(decrementTag);
        added.forEach(name => {
            addTagIfMissing(name);
            incrementTag(name);
        });
    };

    const value = useMemo(() => ({
        tags: Object.values(tags), // perfect for dropdowns
        addTagIfMissing,
        incrementTag,
        decrementTag,
        updateTagUsage
    }), [tags]);

    return (
        <TagsContext.Provider value={value}>
            {children}
        </TagsContext.Provider>
    );
};

export const useTags = () => useContext(TagsContext);
