import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import AuthPage from './pages/AuthPage/AuthPage';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import Hero from './Components/Hero/Hero';
import Program from './Components/Program/Program';
import Title from './Components/Title/Title';
import About from './Components/About/About';
import Uploads from './Components/Uploads/Uploads';


const App = () => {
  useEffect(() => {
    // Create script dynamically
    const script = document.createElement('script');
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '68b71538a629cab2e98a6cfd' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // cleanup when unmounting
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/results" element={<ResultsPage />} />
          
          
          <Route
            path="/"
            element={
              <>
                <Hero />
                <main className="container">
                  <Title subTitle="Our Services" title="Types of Documents" />
                  <Program />
                  <About />
                  <Title subTitle="Try now!!!!" title="Upload your Document Here" />
                  <Uploads />
                </main>
              </>
            }
          />
          {/* This route should be last to catch any non-matching paths */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;