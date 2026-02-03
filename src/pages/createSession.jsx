import { useState } from "react";
import { useTags } from "../context/TagsContext";
import { useSessions } from "../context/SessionsContext";
import { useNavigate } from "react-router-dom";
const CreateSession = () => {

    const { addSession } = useSessions();
    const navigate = useNavigate();

    const { tags: availableTags, addTagIfMissing, incrementTag } = useTags();
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    const [title, setTitle] = useState("");
    const [minutes, setMinutes] = useState(0);
    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [notes, setNotes] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();// prevent page refresh

        /*extra enforced validation for title and minutes*/
        if (title.trim().length < 3) {
            return alert("Title must be at least 3 characters long!");
        };
        if (minutes < 1 || minutes > 600) {
            return alert("Minutes must be between 1 and 600");
        };

        tags.forEach(tag => {
            addTagIfMissing(tag);
            incrementTag(tag);
        });


        const newSession = {
            id: crypto.randomUUID(),
            title: title.trim(),
            minutes: Number(minutes),
            date,
            tags,
            notes,
            createdAt: Date.now(), // fixed at creation
            updatedAt: Date.now(), // changes when session is modified
        };

        console.log("New session created!");
        console.log("newSession");

        /*Create a new session object*/
        addSession(newSession);

        navigate("/sessions")

    }




    const formatTag = (tag) => {
        return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();

    }

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            e.preventDefault();

            const newTag = formatTag(tagInput.trim());

            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="create-session">
            <h2>New Session</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What did you study?"
                    minLength={3}
                ></input>
                <label htmlFor="minutes">Minutes</label>
                <input
                    id="minutes"
                    type="number"
                    required
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    placeholder="How long did you study for?"
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
                        }

                        e.target.value = "";
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
                <button type="submit">Add Session</button>
            </form>
        </div>
    );
};

export default CreateSession;