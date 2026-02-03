import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="home">
            <div className="hero-card">
                <h1>Welcome to Study Tracker</h1>
                <p>Track your study sessions, stay consistent and grow</p>
                <p>one focused hour at a time.</p>
                <button className="primary-btn"
                    onClick={() => navigate("/dashboard")}
                >Go to Dashboard</button>
            </div>
        </div>
    );
}

export default Home;