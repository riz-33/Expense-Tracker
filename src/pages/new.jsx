const handleAddTransaction = async (values) => {
    console.log("Transaction values:", values);
    try {
      const q = query(
        collection(db, "users", user.uid, "transactions"),
        where("page", "==", "newAccount"),
        where("transMode", "==", values.mode),
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No matching transaction found.");
      } else {
        querySnapshot.forEach((doc) => {
          console.log("Transaction found:", doc.id, "=>", doc.data());
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
