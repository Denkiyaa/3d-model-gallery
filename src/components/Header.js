import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DarkModeContext } from './Context/DarkModeContext';
import { LanguageContext } from './Context/LanguageContext';
import translations from '../translations';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { currentLanguage, toggleLanguage } = useContext(LanguageContext);

  if (!translations) {
    return <div>Loading...</div>;
  }

  return (
    <header className={`header ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Make the title clickable to go back to the main page */}
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
        Craftedfromfilament
      </Link>
      <div className="settings-container">
        <button id="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? '🌞' : '🌙'}
        </button>
        <button id="language-toggle" onClick={toggleLanguage}>
          {currentLanguage.toUpperCase()}
        </button>
      </div>
    </header>
  );
};

export default Header;
