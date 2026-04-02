import { createContext, useContext, useState } from "react";

export const NameContext = createContext();

export const useName = () => useContext(NameContext);

export const NameProvider = ({ children }) => {
  const [tableDetails, setTableDetails] = useState({
    full_name: "",
    email: "",
  });
  return (
    <NameContext.Provider value={{ tableDetails, setTableDetails }}>
      {children}
    </NameContext.Provider>
  );
};
