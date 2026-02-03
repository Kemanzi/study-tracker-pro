import { useState } from "react";
import { useRecycleBin } from "../context/RecycleBinContext";
import { useNavigate } from "react-router-dom";

const RecycleBinPage = () => {
    const {
        deletedSessions,
        restoreSession,
        deletePermanently,
        cleanRecycleBin } = useRecycleBin();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEraseModal, setShowEraseModal] = useState(false);
    const navigate = useNavigate();

    if (deletedSessions.length === 0) {
        return (
            <div className="recycle-bin-page empty-state">
                <h2 style={{ color: "#561C24", textAlign: "center" }}>Recycle Bin is empty</h2>
                <p className="mid-text">Deleted sessions will appear here temporarily before permanent removal.</p>
                <button onClick={() => navigate("/sessions")} className="add-session-btn">
                    Back to Sessions
                </button>
            </div>
        );
    }

    return (
        <div className="recycle-bin-page">
            <div className="recycle-header">
                <h2>Recycle Bin</h2>
                <button
                    className="clean-bin"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Empty Recycle Bin
                </button>
            </div>


            <ul style={{ listStyle: "none", padding: 0 }}>
                {deletedSessions.map(({ session, deletedAt }) => (
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
                            <span style={{ marginLeft: "1rem", fontStyle: "italic", color: "#666" }}>
                                Deleted {Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24))} days ago
                            </span>
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
                                <button
                                    className="restore"
                                    onClick={() => restoreSession(session.id)}
                                >
                                    Restore
                                </button>
                            </span>
                            <span>
                                <button
                                    className="delete-permanent"
                                    onClick={() => {
                                        setShowEraseModal(true)
                                    }}
                                >
                                    Delete Permanently
                                </button>
                            </span>
                            {showDeleteModal && (
                                <div className="modal-backdrop">
                                    <div className="modal">
                                        <h3>Empty Recycle Bin?</h3>
                                        <p>
                                            All sessions in the recycle bin will be permanently deleted.
                                            This action cannot be undone.
                                        </p>

                                        <button
                                            className="confirm-delete"
                                            onClick={() => {
                                                cleanRecycleBin();
                                                setShowDeleteModal(false);
                                            }}
                                        >
                                            Yes, Delete All
                                        </button>

                                        <button onClick={() => setShowDeleteModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                            {showEraseModal && (
                                <div className="modal-backdrop">
                                    <div className="modal">
                                        <h3>Delete Permanently?</h3>
                                        <p>
                                            This action cannot be undone.
                                        </p>

                                        <button
                                            className="confirm-delete"
                                            onClick={() => {
                                                deletePermanently(session.id);
                                                setShowDeleteModal(false);
                                            }}
                                        >
                                            Yes, Delete
                                        </button>

                                        <button onClick={() => setShowEraseModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecycleBinPage;
