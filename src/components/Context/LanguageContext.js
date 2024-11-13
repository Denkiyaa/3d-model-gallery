import React, { createContext, useState } from 'react';
import translations from '../../translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const toggleLanguage = () => {
    setCurrentLanguage(prevLanguage => (prevLanguage === 'en' ? 'tr' : 'en'));
  };

  const value = {
    currentLanguage,
    toggleLanguage,
    translations: translations[currentLanguage],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
