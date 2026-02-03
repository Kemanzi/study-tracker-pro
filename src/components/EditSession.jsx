import { useState, useEffect } from "react";
import { useSessions } from "../context/SessionsContext";
import { useNavigate, useParams } from "react-router-dom";
import { useTags } from "../context/TagsContext";

const EditSession = () => {
    const { sessions, updateSession } = useSessions();
    const { tags: availableTags, updateTagUsage } = useTags();
    const navigate = useNavigate();
    const { id } = useParams(); // session ID from route

    // Find session to edit
    const sessionToEdit = sessions.find((s) => s.id === id);

    // Form state
    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // Prefill form when session is loaded
    useEffect(() => {
        if (!sessionToEdit) return;
        setTitle(sessionToEdit.title);
        setMinutes(sessionToEdit.minutes);
        setDate(sessionToEdit.date);
        setNotes(sessionToEdit.notes);
        setTags(sessionToEdit.tags || []);
    }, [sessionToEdit]);

    // Tag helpers
    const formatTag = (tag) =>
        tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault();
            const newTag = formatTag(tagInput.trim());
            if (!tags.includes(newTag)) setTags([...tags, newTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    // Submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sessionToEdit) return alert("Session not found!");
        if (title.trim().length < 3)
            return alert("Title must be at least 3 characters long!");
        if (minutes < 1 || minutes > 600)
            return alert("Minutes must be between 1 and 600");

        const updatedSession = {
            ...sessionToEdit,
            title: title.trim(),
            minutes: Number(minutes),
            date,
            notes,
            tags,
            updatedAt: Date.now(),
        };

        const oldTags = sessionToEdit.tags || [];
        const newTags = updatedSession.tags || [];

        updateTagUsage(oldTags, newTags);


        updateSession(updatedSession);
        navigate("/sessions"); // back to list
    };

    if (!sessionToEdit)
        return <p>Session not found or loading...</p>;
    return (
        <div className="edit-session">
            <h2>Edit Study Session</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    minLength={3}
                ></input>
                <label htmlFor="minutes">Minutes</label>
                <input
                    id="minutes"
                    type="number"
                    required
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    min={1}
                    max={600}
                ></input>
                <label htmlFor="date">Date</label>
                <input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                ></input>
                {/*Tags input section*/}
                <label htmlFor="tags">Tags</label>
                <select
                    id="tags"
                    className="tag-dropdown"
                    onChange={(e) => {
                        const selectedTag = e.target.value;

                        if (selectedTag && !tags.includes(selectedTag)) {
                            setTags([...tags, selectedTag]);
                            e.target.value = "";
                        }
                    }}
                >
                    <option value="">Select a tag</option>
                    {availableTags
                        .filter(tag => !tags.includes(tag.name))
                        .map((tag) => (
                            <option key={tag.id} value={tag.name}>
                                {tag.name}
                            </option>
                        ))}
                </select>

                <div className="tags-input-container">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            style={{
                                background: '#AC746C',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: 'small'
                            }}
                            onClick={() => removeTag(tag)}
                        >
                            {tag} ×
                        </button>
                    ))}

                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type a new tag name and press Enter"
                    />
                </div>
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={200}
                ></textarea>
                <div className="form-actions">
                    <button type="button" onClick={() => navigate("/sessions")}>Cancel</button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </div >
    );
}

export default EditSession;