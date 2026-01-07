import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveSectionContextType {
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
}

const ActiveSectionContext = createContext<ActiveSectionContextType>({
  activeSection: null,
  setActiveSection: () => {},
});

export const useActiveSection = () => useContext(ActiveSectionContext);

interface ActiveSectionProviderProps {
  children: ReactNode;
}

export const ActiveSectionProvider: React.FC<ActiveSectionProviderProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  return (
    <ActiveSectionContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </ActiveSectionContext.Provider>
  );
};
