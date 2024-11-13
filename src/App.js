import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ModelGallery from './components/ModelGallery';
import ModelViewer from './components/ModelViewer';
import Header from './components/Header';
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
              {/* Route to the Model Gallery page */}
              <Route path="/" element={<ModelGallery />} />

              {/* Route to the Model Viewer page for the selected model */}
              <Route path="/model/:modelPath" element={<ModelViewer />} />
            </Routes>
          </div>
        </Router>
      </DarkModeProvider>
    </LanguageProvider>
  );
}

export default App;
