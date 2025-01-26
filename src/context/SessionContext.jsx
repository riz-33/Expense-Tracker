import { createContext, useContext, useState } from "react";

// Create the SessionContext
export const SessionContext = createContext({
  session: null,
  setSession: () => {},
  loading: true,
});

// Custom hook for using the context
export const useSession = () => useContext(SessionContext);

// SessionProvider component to wrap children
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <SessionContext.Provider value={{ session, setSession, loading }}>
      {children}
    </SessionContext.Provider>
  );
};
