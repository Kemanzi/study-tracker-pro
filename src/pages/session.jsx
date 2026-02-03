import { useState, useMemo } from "react";
import { useSessions } from "../context/SessionsContext";
import { useNavigate } from "react-router-dom";
import { useRecycleBin } from "../context/RecycleBinContext";

const Sessions = () => {
    const { sessions } = useSessions();
    const { sendToRecycleBin } = useRecycleBin();
    const navigate = useNavigate();

    /*....search bar....*/
    const [openPopover, setOpenPopover] = useState(null);

    /*....delete...*/
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    const handleDeleteClick = (session) => {
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!sessionToDelete) return;
        setShowDeleteModal(false);

        const session = sessionToDelete;
        setSessionToDelete(null);
        sendToRecycleBin(session);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSessionToDelete(null);
    };

    /*...filters...*/
    const [filters, setFilters] = useState({
        search: "",
        tags: [],
        range: "all",
        startDate: "",
        endDate: ""
    });

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev, [key]: value
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            search: "",
            tags: [],
            range: "all",
            startDate: "",
            endDate: ""
        });
    };

    /*....sorting...*/

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt).getTime();
            return bTime - aTime;
        });
    }, [sessions]);

    /*....filter helpers....*/
    const matchesSearch = (session) => {
        if (!filters.search) return true;

        const q = filters.search.toLowerCase();
        const inTitle = session.title?.toLowerCase().includes(q);
        const inNotes = session.notes?.toLowerCase().includes(q);
        const inTags = session.tags?.some(tag =>
            tag.toLowerCase().includes(q)
        );

        return inTitle || inNotes || inTags;

    };

    const matchesSelectedTags = (session) => {
        if (filters.tags.length === 0) return true;

        return filters.tags.every(tag =>
            session.tags.includes(tag)
        );
    };


    const matchesDateRange = (session) => {
        if (!filters.range || filters.range === "all") return true;

        const sessionDate = new Date(session.date);
        const now = new Date();

        if (filters.range === "today") {
            return sessionDate.toDateString() === now.toDateString();
        }

        if (filters.range === "7d") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return sessionDate >= sevenDaysAgo;
        }

        if (filters.range === "month") {
            return (
                sessionDate.getMonth() === now.getMonth() &&
                sessionDate.getFullYear() === now.getFullYear()
            );
        }

        if (
            filters.range === "custom" &&
            filters.startDate &&
            filters.endDate
        ) {
            return (
                sessionDate >= new Date(filters.startDate) &&
                sessionDate <= new Date(filters.endDate)
            );
        }

        return true;
    };

    const handleTagSelection = (tag) => {
        const isSelected = filters.tags.includes(tag);
        const updatedTags = isSelected
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        setFilters(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };

    /*....derived filtered sessions.....*/
    const filteredSessions = useMemo(() => {
        return sortedSessions.filter(session =>
            matchesSearch(session) &&
            matchesSelectedTags(session) &&
            matchesDateRange(session)
        );
    }, [sortedSessions, filters])

    /*....empty state....*/

    if (sessions.length === 0) {
        return (
            <div className="sessions-page empty-state">
                <h2 style={{ textAlign: "center" }}>No sessions logged yet!</h2>
                <p className="mid-text">Start your first study session to see progress here.</p>
                <button
                    onClick={() => navigate("/create")} className="add-session-btn">Add New Session</button>
            </div>
        );
    }

    return (
        <div className="sessions-page">
            <h2>My Sessions</h2>

            {/*....Search only appears when sessions exist....*/}
            <div className="smart-search-bar">

                <div className="search-main">
                    <span className="search-icon">🔍︎</span>
                    {/* Text search */}
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="search-input"
                    />

                    {/* Selected tag chips */}
                    {filters.tags.map(tag => (
                        <span key={tag} className="tag-chip">
                            {tag}
                            <button
                                onClick={() => {
                                    const newTags = filters.tags.filter(t => t !== tag);
                                    setFilters(prev => ({
                                        ...prev,
                                        tags: newTags
                                    }));
                                }}
                            >×</button>
                        </span>
                    ))}

                    {/* Clear all filters */}
                    {(filters.search || filters.tags.length > 0 || filters.range !== "all") && (
                        <button
                            className="clear-filters-btn"
                            onClick={clearAllFilters}
                            title="Clear all filters"
                        >
                            ✕
                        </button>
                    )}

                </div>

                {/* Tag selector */}
                <div className="search-actions">
                    <div className="icon-button">
                        <button
                            type="button"
                            aria-haspopup="true"
                            aria-expanded={openPopover === "tags"}
                            onClick={() =>
                                setOpenPopover(openPopover === "tags" ? null : "tags")
                            }>🏷️ ▾</button>

                        {openPopover === "tags" && (
                            <div className="popover tag-popover">
                                {[...new Set(sessions.flatMap(s => s.tags))].map(tag => {
                                    const isSelected = filters.tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`selectable-tag ${isSelected ? "selected" : ""}`}
                                            onClick={() => handleTagSelection(tag)}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Date selector */}
                    <div className="icon-button">
                        <button
                            type="button"
                            aria-haspopup="true"
                            aria-expanded={openPopover === "date"}
                            onClick={() =>
                                setOpenPopover(openPopover === "date" ? null : "date")
                            }
                        >
                            🗓️ ▾
                        </button>

                        {openPopover === "date" && (
                            <div className="popover">
                                <button onClick={() => updateFilter("range", "today")}>Today</button>
                                <button onClick={() => updateFilter("range", "7d")}>Last 7 days</button>
                                <button onClick={() => updateFilter("range", "month")}>This month</button>

                                <div className="date-inputs">
                                    <label className="date-field">
                                        <span>Start</span>
                                        <input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    startDate: e.target.value,
                                                    range: "custom"
                                                }))
                                            }
                                        />
                                    </label>

                                    <label className="date-field">
                                        <span>End</span>
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) =>
                                                setFilters(prev => ({
                                                    ...prev,
                                                    endDate: e.target.value,
                                                    range: "custom"
                                                }))
                                            }
                                        />
                                    </label>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>


            {filteredSessions.length === 0 && (
                <p style={{ textAlign: "center", color: "#999", marginTop: "1rem" }}>
                    No sessions match your search or filters.
                </p>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredSessions.map((session) => (
                    <li className="session-card" key={session.id}>
                        <h3>{session.title}</h3>
                        <div className="tags">
                            {session.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                        </div>
                        <div className="session-info">
                            <span>Date: {session.date}</span>
                            {session.updatedAt !== session.createdAt && (
                                <span className="session-updated">
                                    Updated: {new Date(session.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="time-spent">
                            <span className="time-label">Time spent: </span>
                            <span>{session.minutes} min</span>
                        </div>
                        <p>Notes:</p>
                        <hr />
                        <p className="notes">{session.notes || "No notes"}</p>
                        <div className="actions">
                            <span>
                                <button className="edit" onClick={() => navigate(`/sessions/edit/${session.id}`)}>Edit</button>
                            </span>
                            <span>
                                <button className="delete" onClick={() => handleDeleteClick(session)}>Delete</button>
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <button
                className="fab-add-session"
                onClick={() => navigate("/create")}
                aria-label="Add new session"
            >
                <span className="fab-icon">＋</span>
                <span className="fab-tooltip">Add Session</span>
            </button>

            {/* Modal goes here, outside the map */}
            {showDeleteModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Delete Session?</h3>
                        <p>Are you sure you want to delete "{sessionToDelete?.title}"? It can be restored from the Recycle Bin.</p>
                        <button className="confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
                        <button onClick={cancelDelete}>Cancel</button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Sessions;
