import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ModelViewer from './components/ModelViewer';
import Header from './components/Header';
import React from 'react';
import './App.css';
import { LanguageProvider } from './components/Context/LanguageContext';
import { DarkModeProvider } from './components/Context/DarkModeContext';
import './styles.css';

function App() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Route to the Model Gallery page */}
              <Route path="/model/:modelPath" element={<ModelViewer />} />
            </Routes>
          </div>
        </Router>
      </DarkModeProvider>
    </LanguageProvider>
  );
}

export default App;
