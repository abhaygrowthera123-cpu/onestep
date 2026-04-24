import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        profile: 'Profile',
        catalogs: 'Catalogs',
        orders: 'Orders',
        favourites: 'Favourites',
        notification: 'Notification',
        buyAgain: 'Buy Again',
        language: 'Language',
        return: 'Return',
        addresses: 'Addresses',
        myAccount: 'My Account',
        edit: 'Edit',
        remainingCod: 'Remaining COD limit',
        memberSince: 'Member since'
    },
    hi: {
        profile: 'प्रोफ़ाइल',
        catalogs: 'कैटलॉग',
        orders: 'ऑर्डर',
        favourites: 'पसंदीदा',
        notification: 'सूचनाएं',
        buyAgain: 'फिर से खरीदें',
        language: 'भाषा',
        return: 'वापसी',
        more: 'अधिक',
        addresses: 'पते',
        myAccount: 'मेरा खाता',
        edit: 'बदलाव करें',
        remainingCod: 'शेष COD सीमा',
        memberSince: 'सदस्यता वर्ष'
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
