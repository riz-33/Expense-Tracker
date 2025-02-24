import User from "././context/user"
import "./App.css";
import AppRouter from "./config/router";
import { useState, useEffect } from "react";
import { auth, getDoc, onAuthStateChanged, db, doc } from "./config/firebase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    });
  }, []);

  return (
    <User.Provider value={{ user, setUser }}>
      <AppRouter />
    </User.Provider>
  );
}

export default App;