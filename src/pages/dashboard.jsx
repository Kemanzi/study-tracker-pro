import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTags } from "../context/TagsContext";
import { useSessions } from "../context/SessionsContext";

const getDateKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
};
const Dashboard = () => {
    const { sessions } = useSessions();
    const { tags } = useTags();
    const navigate = useNavigate();

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);

    const [todayMinutes, setTodayMinutes] = useState(0);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);
    const [mostUsedTag, setMostUsedTag] = useState("—");
    const [weeklyGoal, setWeeklyGoal] = useState(0);
    const [dailyMinimum, setDailyMinimum] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);

    // Build totals per date ONCE
    const totalsByDate = useMemo(() => {
        const map = {};
        sessions.forEach(s => {
            const key = getDateKey(s.date);
            map[key] = (map[key] || 0) + (Number.parseInt(s.minutes) || 0);
        });
        return map;
    }, [sessions]);

    // Days that meet daily minimum (for calendar highlights)
    const sessionDates = useMemo(() => {
        return new Set(
            Object.entries(totalsByDate)
                .filter(([, mins]) => mins >= dailyMinimum)
                .map(([date]) => date)
        );
    }, [totalsByDate, dailyMinimum]);

    useEffect(() => {
        const goal = Number.parseInt(localStorage.getItem("weeklyGoal") || "0");
        const minimum = Number.parseInt(localStorage.getItem("dailyMinimum") || "0");

        setWeeklyGoal(goal);
        setDailyMinimum(minimum);

        const today = new Date();
        const todayKey = getDateKey(today);

        // Monday start of week
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        startOfWeek.setDate(today.getDate() + diffToMonday + weekOffset * 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        let todayTotal = 0;
        let weeklyTotal = 0;
        let tagCounts = {};
        let dailyTotals = Array(7).fill(0);

        //---build totaols per day for streaks & calendar

        sessions.forEach(session => {
            const sessionDate = new Date(session.date);
            const minutes = Number.parseInt(session.minutes) || 0;
            const key = getDateKey(sessionDate);

            if (sessionDate >= startOfWeek && sessionDate < endOfWeek) {
                weeklyTotal += minutes;

                const dayIndex = (sessionDate.getDay() + 6) % 7;
                dailyTotals[dayIndex] += minutes;
            }

            session.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Most used tag
        const mostTag = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])[0];

        setMostUsedTag(mostTag ? mostTag[0] : "—");

        // ---------- STREAK CALCULATION ----------
        const validDays = Object.entries(totalsByDate)
            .filter(([, mins]) => mins >= minimum)
            .map(([date]) => new Date(date))
            .sort((a, b) => a - b);

        let streak = 0;
        let best = 0;
        let prev = null;

        validDays.forEach(date => {
            if (!prev) {
                streak = 1;
            } else {
                const diffDays = Math.floor(
                    (date - prev) / (1000 * 60 * 60 * 24));
                streak = diffDays === 1 ? streak + 1 : 1;
            }
            if (streak > best) best = streak;
            prev = date;
        });

        // if today doesnt meet minimum streak resets
        if ((totalsByDate[todayKey] || 0) < minimum) {
            streak = 0;
        }

        // ---------- STATE UPDATES ----------
        setTodayMinutes(todayTotal);
        setWeeklyMinutes(weeklyTotal);
        setChartData(dailyTotals);
        setCurrentStreak(streak);
        setBestStreak(best);

    }, [sessions, weekOffset, totalsByDate]);

    //------Calendar session days 
    const generateCalendarDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startOffset = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push(date);
        }

        return days;
    };

    const goPrevMonth = () => {
        setCalendarDate(prev =>
            new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
    };

    const goNextMonth = () => {
        setCalendarDate(prev =>
            new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
    };


    const calendarDays = generateCalendarDays();

    // ---------- EMPTY STATE ----------
    if (sessions.length === 0) {
        return (
            <div className="dashboard-empty-state">
                <h2 style={{ textAlign: "center" }}>
                    Your dashboard is ready!
                </h2>
                <p className="dash-mid-text">
                    Start your first study session to begin tracking progress.
                </p>
                <button
                    className="dash-btn"
                    onClick={() => navigate("/sessions")}
                >
                    Log Session
                </button>
            </div>
        );
    }


    return (
        <div className="dashboard-page">
            <h1>Dashboard</h1>
            {/* Study Calendar */}
            <div className="study-calendar">
                <div className="calendar-header-bar">
                    <button onClick={goPrevMonth}>◀</button>

                    <h3>
                        {calendarDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric"
                        })}
                    </h3>

                    <button onClick={goNextMonth}>▶</button>
                </div>


                <div className="calendar-grid">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d =>
                        <div key={d} className="calendar-header">{d}</div>
                    )}

                    {calendarDays.map((date, i) => {
                        if (!date)
                            return <div key={i} className="calendar-cell empty" />;

                        const key = getDateKey(date);
                        const hasSession = sessionDates.has(key);

                        return (
                            <div
                                key={i}
                                className={`calendar-cell ${hasSession ? "active-day" : ""}`}
                            >
                                {date.getDate()}
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Top Row */}
            <div className="dashboard-top-row">
                {/* Donut Goal */}
                <div className="goal-card">
                    <h3>Weekly Goal</h3>

                    <div className="donut-wrapper">
                        <svg width="140" height="140">
                            <circle cx="70" cy="70" r="60" className="donut-bg" />

                            <circle
                                cx="70"
                                cy="70"
                                r="60"
                                className="donut-progress"
                                style={{
                                    strokeDasharray: 377,
                                    strokeDashoffset:
                                        377 -
                                        (Math.min(weeklyMinutes, weeklyGoal) /
                                            (weeklyGoal || 1)) *
                                        377
                                }} />
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dy=".3em"
                                className="donut-text"
                            >
                                {weeklyMinutes}
                            </text>
                        </svg>

                        <p>{weeklyMinutes} / {weeklyGoal} min</p>
                    </div>
                </div>

                {/* Streak */}
                <div className="metric-card">
                    <h3>Study Streak</h3>

                    <div className="streak-values">
                        <div>
                            <span className="streak-number">{currentStreak}</span>
                            <span className="streak-label">Current</span>
                        </div>
                        <div>
                            <span className="streak-number">{bestStreak}</span>
                            <span className="streak-label">Best</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="metrics-row">
                <div className="metric-card">
                    <h3>Minutes Today</h3>
                    <p>{todayMinutes} min</p>
                </div>

                <div className="metric-card">
                    <h3>Minutes This Week</h3>
                    <p>{weeklyMinutes} min</p>
                </div>

                <div className="metric-card">
                    <h3>Most Used Tag</h3>
                    <p>{mostUsedTag}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="chart-week-nav">
                <button onClick={() => setWeekOffset(w => w - 1)}>◀</button>
                <button onClick={() => setWeekOffset(0)}>Current</button>
                <button onClick={() => setWeekOffset(w => w + 1)}>▶</button>
            </div>
            <div className="line-chart">
                <h3>Minutes per Day</h3>
                <div className="chart-container">
                    {chartData.map((minutes, i) => (
                        <div key={i} className="chart-bar" style={{ height: `${minutes}px` }}>
                            <span>{minutes}</span>
                        </div>
                    ))}
                </div>

                <div className="chart-labels">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                        <span key={d}>{d}</span>
                    ))}
                </div>
            </div>
        </div>
    );

};

export default Dashboard;
