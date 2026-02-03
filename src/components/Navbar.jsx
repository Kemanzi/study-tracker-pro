import { Link, useLocation } from "react-router-dom";

const Navbar = ({ onOpenSettings }) => {
    const location = useLocation();

    return (
        <nav className="navbar">
            {/*Left:Logo*/}
            <div className="navbar-left">
                <span className="logo-image">📓</span>
                <span className="logo-text">My Study Tracker</span>
            </div>

            {/*Center: Navigation*/}
            <ul className="navbar-center" >
                <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
                <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>Dashboard</Link>
                <Link to="/sessions" className={location.pathname === "/sessions" ? "active" : ""}>My Sessions</Link>
                <Link to="/create" className={location.pathname === "/create" ? "active" : ""}>Create</Link>
            </ul>



            {/*Right: Settings*/}
            <button
                type="button"
                className="navbar-right"
                onClick={onOpenSettings}>
                <span className="settings-icon">⚙️</span>
                <span className="settings-text">Settings</span>
                <span className="dropdown-icon">▾</span>
            </button>
        </nav>
    );
}

export default Navbar;