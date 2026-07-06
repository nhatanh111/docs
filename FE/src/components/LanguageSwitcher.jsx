// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const isVi = currentLang === 'vi';

  const toggleLanguage = () => {
    const newLang = isVi ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center w-12 h-6 rounded-full bg-slate-700 border border-slate-600 transition-all duration-300 focus:outline-none shadow-inner"
      title={isVi ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center text-[8px] font-bold text-slate-700 ${
          isVi ? 'translate-x-0' : 'translate-x-6'
        }`}
      >
        {isVi ? 'VN' : 'EN'}
      </span>
    </button>
  );
}