#### 📚 Study Tracker Pro

A productivity-focused study tracking web app built with React and Vite that helps users log sessions, monitor progress, and stay consistent with their learning goals.

### 🚀 How to Run the Project

1. Clone the repository

```powershell
git clone https://github.com/Kemanzi/study-tracker-pro.git
cd study-tracker-pro
```

2. Install dependencies

```powershell
npm install
```

3. Start development server

```powershell
npm run dev
```

4. Open the local URL shown in your terminal (usually http://localhost:5173)

### Features Implemented

1. Create, edit, and delete study sessions
2. Tag system with automatic usage tracking
3. Dashboard with:
   Study time metrics
   Weekly progress
   Streak tracking
   Charts & visual insights
4. Search and filtering
5. Recycle bin for deleted sessions
6. Import / Export sessions as JSON
7. Persistent data using LocalStorage
8. Light / Dark mode toggle
9. Responsive layout (mobile-friendly)

### Assumptions & Trade offs

1. Data is stored in LocalStorage, so it is device/browser specific
2. No backend or cloud sync is implemented
3. Importing sessions assumes valid JSON structure
4. Charts are simplified for performance and clarity