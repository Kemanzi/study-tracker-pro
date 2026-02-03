import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CreateSession from './pages/createSession';
import Sessions from './pages/session';
import { SessionsProvider } from "./context/SessionsContext";
import Home from './pages/Home';
import Dashboard from './pages/dashboard';
import EditSession from './components/EditSession';
import { TagsProvider } from './context/TagsContext';
import RecycleBinPage from './components/RecycleBin';
import { RecycleBinProvider } from './context/RecycleBinContext';
import SettingsSidebar from './pages/Settings';
import NotFound from './components/NotFound';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Router>
      <TagsProvider>
        <SessionsProvider>
          <RecycleBinProvider>
            <div className="App">
              <Navbar onOpenSettings={() => setSettingsOpen(true)} />
              <div className="content">
                <Routes>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/create" element={<CreateSession />} />
                  <Route exact path="/sessions" element={<Sessions />} />
                  <Route exact path="/dashboard" element={<Dashboard />} />
                  <Route exact path="/sessions/edit/:id" element={<EditSession />} />
                  <Route exact path="/recyclebin" element={<RecycleBinPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <SettingsSidebar
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)} />
            </div>
          </RecycleBinProvider>
        </SessionsProvider>
      </TagsProvider>
    </Router>
  );
}

export default App;

