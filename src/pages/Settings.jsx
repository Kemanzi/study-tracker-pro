import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessions } from "../context/SessionsContext";
import { useTags } from "../context/TagsContext";

const SettingsSidebar = ({ isOpen, onClose }) => {
    const { tags, addTagIfMissing } = useTags();
    const { sessions } = useSessions();
    const [newTag, setNewTag] = useState("");
    const [weeklyGoal, setWeeklyGoal] = useState("");
    const [dailyMinimum, setDailyMinimum] = useState("");
    const [theme, setTheme] = useState("light");
    const [importedFileName, setImportedFileName] = useState("");
    const [showSavedToast, setShowSavedToast] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    /*...Save settings to localStorage....*/
    const handleSaveSettings = () => {
        localStorage.setItem("weeklyGoal", weeklyGoal);
        localStorage.setItem("dailyMinimum", dailyMinimum);

        setShowSavedToast(true);

        setTimeout(() => {
            setShowSavedToast(false);
        }, 3000);
    };

    /*...Tags Management...*/

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;
        if (tags.some(tag => tag.name.toLowerCase() === trimmed.toLowerCase())) {
            alert("tag already exists");
            return;
        }
        addTagIfMissing(trimmed);
        setNewTag("");
    };

    const handleDeleteTag = (tagId) => {
        const tag = tags.find(t => t.id === tagId);
        if (!tag) return;

        if (tag.count > 0) {
            alert(`Cannot delete "${tag.name}" because it is in use.`);
            return;
        }

        const updatedTags = tags.filter(t => t.id !== tagId);
        const tagObj = Object.fromEntries(updatedTags.map(t => [t.id, t]));
        localStorage.setItem("study_tracker_tags", JSON.stringify(tagObj));
        globalThis.location.reload();
    };

    /*....Export Sessions....*/
    const handleExport = () => {
        const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sessions.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    /*....Import Sessions....*/
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSessions = JSON.parse(event.target.result);

                if (!Array.isArray(importedSessions)) {
                    console.log("Invalid format: Expected an array of sessions");
                    throw new Error("Invalid format: Expected an array of sessions");
                }

                const existingSessions = JSON.parse(localStorage.getItem("study_tracker_sessions")) || [];
                const existingTagObj = JSON.parse(localStorage.getItem("study_tracker_tags")) || {};

                const existsingTagNames = Object.values(existingTagObj).map(t => t.name.toLowerCase());

                let updatedTags = { ...existingTagObj };
                let updatedSessions = [...existingSessions];

                importedSessions.forEach(session => {
                    // Basic validation
                    if (!session.title || !session.date || !Array.isArray(session.tags)) return;

                    // Prevent duplicate session IDs
                    const alreadyExists = existingSessions.some(s => s.id === session.id);
                    if (alreadyExists) return;

                    // Add session
                    updatedSessions.push(session);

                    // Process tags
                    session.tags.forEach(tagName => {
                        const lower = tagName.toLowerCase();

                        const existingTag = Object.values(updatedTags).find(
                            t => t.name.toLowerCase() === lower
                        );

                        if (existingTag) {
                            existingTag.count += 1;
                        } else {
                            const newId = crypto.randomUUID();
                            updatedTags[newId] = {
                                id: newId,
                                name: tagName,
                                count: 1
                            };
                        }
                    });
                });

                // Save everything back
                localStorage.setItem("study_tracker_sessions", JSON.stringify(updatedSessions));
                localStorage.setItem("study_tracker_tags", JSON.stringify(updatedTags));

                alert("Import successful!");
                globalThis.location.reload();

            } catch (err) {
                console.error("Import failed:", err);
                alert("Invalid JSON file or structure.");
            }
        };
        reader.readAsText(file);
        setImportedFileName(file.name);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Blur overlay */}
            <div
                className="settings-overlay"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <div className={`settings-sidebar ${isOpen ? "open" : ""}`}>
                <div className="settings-header">
                    <span><h2>⚙️ Settings</h2></span>
                    <span><button className="close-btn" onClick={onClose}>✕</button></span>
                </div>

                <div className="settings-section">
                    <h3>Theme</h3>
                    <div className="theme-switch-wrapper">
                        <label className="theme-switch">
                            <input
                                type="checkbox"
                                checked={theme === "dark"}
                                onChange={toggleTheme} />
                            <span className="slider"></span>
                        </label>
                        <span className="theme-label">
                            switch to {theme === "light" ? "Dark" : "Light"} Mode
                        </span>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>♻ Recycle Bin</h3>
                    <button className="settings-btn" onClick={() => navigate("/recyclebin")}>
                        Open Recycle Bin
                    </button>
                </div>

                <div className="settings-section">
                    <h3>Weekly Goal</h3>
                    <p>
                        Set you weekly study time (minutes) target for the week
                    </p>
                    <input
                        type="number"
                        min="0"
                        placeholder="for example 300"
                        value={weeklyGoal}
                        onChange={(e) => setWeeklyGoal(e.target.value)} />
                    <h3>Minimum Study Time</h3>
                    <p>Set your minimum study time (minutes) for your days</p>
                    <input
                        type="number"
                        min="0"
                        placeholder="for example 20"
                        value={dailyMinimum}
                        onChange={(e) => setDailyMinimum(e.target.value)} />

                    <h3>Tags Management</h3>
                    <div className="tags-list-settings">
                        {tags.map((tag) => {
                            const isUsed = tag.count > 0;
                            return (
                                <div key={tag.id} className="tag-item">
                                    <span>{tag.name}</span>
                                    <button
                                        disabled={isUsed}
                                        className="delete-tag-btn"
                                        onClick={() => handleDeleteTag(tag.id)}
                                        title={isUsed ? "Tag in use, cannot delete" : "Delete tag"}
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                        <div className="add-tag">
                            <input
                                type="text"
                                placeholder="New tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                            />
                            <button onClick={handleAddTag}>Add</button>
                        </div>
                    </div>
                    <div className="settings-section">
                        <h3>Import / Export Sessions</h3>
                        <div className="json-import-wrapper">
                            <input
                                type="file"
                                accept="application/json"
                                id="json-import"
                                onChange={handleImport}
                                style={{ display: "none" }} />
                            <label htmlFor="json-import" className="json-import-label">
                                <span className="import-icon"></span>
                                <span className="import-text">Click or drag a JSON file here to import</span>
                            </label>
                            {importedFileName && <div className="imported-file-name">selected: {importedFileName}</div>}
                        </div>
                        <button className="settings-btn" onClick={handleExport}>
                            Export Sessions as JSON
                        </button>
                    </div>
                    <div className="settings-footer" style={{ marginTop: "1rem", textAlign: "center" }}>
                        <button className="settings-btn" onClick={handleSaveSettings} > Save Changes</button>
                    </div>

                </div>

            </div >
            {showSavedToast && (
                <div className="toast-notification">
                    Settings saved successfully  ✓
                </div>
            )}

        </>
    );
};

export default SettingsSidebar;
