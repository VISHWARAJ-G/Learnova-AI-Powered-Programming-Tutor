import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [lightTheme, setLightTheme] = useState(true);
  return (
    <ThemeContext.Provider value={{ lightTheme, setLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
