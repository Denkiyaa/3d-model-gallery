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
    <header className={`header ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Make the title clickable to go back to the main page */}
      <Link to="/" className="site-title">
        Craftedfromfilament
      </Link>
      <div className="settings-container">
        <button id="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button id="language-toggle" onClick={toggleLanguage}>
          {currentLanguage.toUpperCase()}
        </button>
      </div>
    </header>
  );
};

export default Header;
