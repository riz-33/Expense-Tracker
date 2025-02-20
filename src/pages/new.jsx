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


  function EnhancedTableToolbar(props) {
    const { numSelected, selected, setSelected, transactions } = props;
    const { user } = useContext(User);
    const [editForm] = Form.useForm();
    const [openEdit, setOpenEdit] = useState(false);
    const [activeTab, setActiveTab] = useState("expense");
    const [open, setOpen] = useState(false);
    const [expenseForm] = Form.useForm();
    const [transferForm] = Form.useForm();
    const [incomeForm] = Form.useForm();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
  
    console.log(selectedTransaction);
    const onCreate = async (data) => {
      await handleAddTransaction(data);
      await handleTransferTransaction(data);
      console.log("Created Transaction:", data);
    };
  
    const resetForms = () => {
      expenseForm.resetFields();
      transferForm.resetFields();
      incomeForm.resetFields();
    };
  
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
      setLoading(true); // Start loading
      try {
        let values;
  
        if (activeTab === "expense") {
          values = await expenseForm.validateFields();
        } else if (activeTab === "transfer") {
          values = await transferForm.validateFields();
        } else if (activeTab === "income") {
          values = await incomeForm.validateFields();
        }
        // await handleAddTransaction(values);
  
        const selectedDate = new Date(values.date);
        let transactionData = {
          date: Timestamp.fromDate(selectedDate),
          amount: values.amount,
          comments: values.comments || "",
          createdAt: serverTimestamp(),
        };
  
        if (activeTab === "expense") {
          transactionData = {
            ...transactionData,
            title: values.title,
            category: values.category,
            mode: values.mode,
            type: "Expense",
            comments: values.comments
              ? values.comments.toUpperCase()
              : values.title.toUpperCase() + " EXPENSE",
          };
        } else if (activeTab === "transfer") {
          transactionData = {
            ...transactionData,
            fromAccount: values.fromAccount,
            toAccount: values.toAccount,
            type: "Transfer",
            comments: values.comments
              ? values.comments.toUpperCase()
              : "Transfer from " + values.fromAccount,
          };
        } else if (activeTab === "income") {
          transactionData = {
            ...transactionData,
            mode: values.toAccount,
            category: values.category,
            type: "Income",
            comments: values.comments
              ? values.comments.toUpperCase()
              : values.category.toUpperCase(),
          };
        }
  
        await addDoc(
          collection(db, "users", user.uid, "transactions"),
          transactionData
        );
        message.success("Transaction created successfully!");
        onCreate({ type: activeTab, values });
        setOpen(false);
        resetForms();
      } catch (error) {
        message.error("Failed to create transaction.");
        console.error("Validation or submission error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const handleAddTransaction = async (data) => {
      console.log("expense amount====>", data);
      try {
        const accountQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where("transMode", "==", data.values.mode || data.values.toAccount),
          where("page", "==", "newAccount")
        );
  
        const querySnapshot = await getDocs(accountQuery);
        if (!querySnapshot.empty) {
          const accountDoc = querySnapshot.docs[0];
          const accountData = accountDoc.data();
          console.log(accountData);
  
          let updatedAmount = accountData.amount || 0;
          if (data.type === "income") {
            updatedAmount += data.values.amount;
          } else if (data.type === "expense") {
            updatedAmount -= data.values.amount;
          }
  
          await updateDoc(accountDoc.ref, { amount: updatedAmount });
          console.log("✅ Account balance updated successfully!");
        } else {
          console.warn("⚠️ No matching account found for mode:");
        }
      } catch (error) {
        console.error("❌ Error updating account balance:", error);
      }
    };
  
    // ✅ Transfer Function (Handles Transfer Amount Updates)
    const handleTransferTransaction = async (data) => {
      console.log("Transfer ===>", data);
      try {
        const { fromAccount, toAccount, amount } = data.values;
  
        if (!fromAccount || !toAccount || !amount) {
          console.warn("⚠️ Missing transfer details!");
          return;
        }
  
        // Fetch accounts
        const fromAccountQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where("transMode", "==", fromAccount),
          where("page", "==", "newAccount")
        );
  
        const toAccountQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where("transMode", "==", toAccount),
          where("page", "==", "newAccount")
        );
  
        const [fromSnapshot, toSnapshot] = await Promise.all([
          getDocs(fromAccountQuery),
          getDocs(toAccountQuery),
        ]);
  
        if (!fromSnapshot.empty && !toSnapshot.empty) {
          const fromDoc = fromSnapshot.docs[0];
          const toDoc = toSnapshot.docs[0];
  
          const fromData = fromDoc.data();
          const toData = toDoc.data();
  
          // Update balances
          await updateDoc(fromDoc.ref, {
            amount: (fromData.amount || 0) - amount,
          });
          await updateDoc(toDoc.ref, { amount: (toData.amount || 0) + amount });
  
          console.log("✅ Transfer completed successfully!");
        } else {
          console.warn("⚠️ One or both accounts not found!");
        }
      } catch (error) {
        console.error("❌ Error processing transfer:", error);
      }
    };
  
    const showDeleteConfirm = () => {
      Modal.confirm({
        title: "Are you sure you want to delete the selected transaction(s)?",
        icon: <ExclamationCircleFilled />,
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            const transactionsToDelete = await Promise.all(
              selected.map(async (id) => {
                const docRef = doc(db, "users", user.uid, "transactions", id);
                const docSnap = await getDoc(docRef);
                return { id, ...docSnap.data() };
              })
            );
  
            await Promise.all(
              transactionsToDelete.map(async (transaction) => {
                const accountQuery = query(
                  collection(db, "users", user.uid, "transactions"),
                  where(
                    "transMode",
                    "==",
                    transaction.mode || transaction.toAccount
                  ),
                  where("page", "==", "newAccount")
                );
  
                const querySnapshot = await getDocs(accountQuery);
                if (!querySnapshot.empty) {
                  const accountDoc = querySnapshot.docs[0];
                  const accountData = accountDoc.data();
                  let updatedAmount = accountData.amount || 0;
  
                  if (transaction.type === "Income") {
                    updatedAmount -= transaction.amount;
                  } else if (transaction.type === "Expense") {
                    updatedAmount += transaction.amount;
                  } else if (transaction.type === "Transfer") {
                    const fromQuery = query(
                      collection(db, "users", user.uid, "transactions"),
                      where("transMode", "==", transaction.fromAccount),
                      where("page", "==", "newAccount")
                    );
                    const fromSnapshot = await getDocs(fromQuery);
                    if (!fromSnapshot.empty) {
                      const fromDoc = fromSnapshot.docs[0];
                      await updateDoc(fromDoc.ref, {
                        amount: (fromDoc.data().amount || 0) + transaction.amount,
                      });
                    }
  
                    const toQuery = query(
                      collection(db, "users", user.uid, "transactions"),
                      where("transMode", "==", transaction.toAccount),
                      where("page", "==", "newAccount")
                    );
                    const toSnapshot = await getDocs(toQuery);
                    if (!toSnapshot.empty) {
                      const toDoc = toSnapshot.docs[0];
                      await updateDoc(toDoc.ref, {
                        amount: (toDoc.data().amount || 0) - transaction.amount,
                      });
                    }
                  }
  
                  await updateDoc(accountDoc.ref, { amount: updatedAmount });
                }
  
                await deleteDoc(
                  doc(db, "users", user.uid, "transactions", transaction.id)
                );
              })
            );
  
            message.info("Transaction(s) deleted successfully!");
            setSelected([]);
          } catch (error) {
            console.error("❌ Error deleting transaction(s):", error);
            message.error("Failed to delete transaction(s).");
          }
        },
      });
    };
  
    const handleEdit = (transaction) => {
      setSelectedTransaction(transaction);
      editForm.setFieldsValue({
        title: transaction.title || transaction.type,
        category: transaction.category || transaction.type,
        date: transaction.date ? moment(transaction.date.seconds * 1000) : null,
        amount: transaction.amount,
        mode: transaction.mode || transaction.fromAccount,
        comments: transaction.comments,
      });
      setOpenEdit(true);
    };
  
    const onUpdate = async (values) => {
      if (!selectedTransaction) return;
  
      setLoading(true);
      try {
        const transactionRef = doc(
          db,
          "users",
          user.uid,
          "transactions",
          selectedTransaction.id
        );
        const transactionSnap = await getDoc(transactionRef);
        if (!transactionSnap.exists()) {
          message.error("Transaction not found.");
          return;
        }
  
        const prevTransaction = transactionSnap.data();
  
        // Restore previous balance before updating
        const accountQuery = query(
          collection(db, "users", user.uid, "transactions"),
          where(
            "transMode",
            "==",
            prevTransaction.mode || prevTransaction.toAccount
          ),
          where("page", "==", "newAccount")
        );
  
        const querySnapshot = await getDocs(accountQuery);
        if (!querySnapshot.empty) {
          const accountDoc = querySnapshot.docs[0];
          let updatedAmount = accountDoc.data().amount || 0;
  
          // Reverse old amount
          if (prevTransaction.type === "Income") {
            updatedAmount -= prevTransaction.amount;
          } else if (prevTransaction.type === "Expense") {
            updatedAmount += prevTransaction.amount;
          }
  
          // Apply new amount
          if (values.type === "Income") {
            updatedAmount += values.amount;
          } else if (values.type === "Expense") {
            updatedAmount -= values.amount;
          }
  
          await updateDoc(accountDoc.ref, { amount: updatedAmount });
        }
  
        await updateDoc(transactionRef, values);
        message.success("Transaction updated successfully!");
        setOpenEdit(false);
      } catch (error) {
        console.error("❌ Error updating transaction:", error);
        message.error("Failed to update transaction.");
      } finally {
        setLoading(false);
      }
    };
  
    const [options, setOptions] = useState([]);
    const [fromAccount, setFromAccount] = useState(null);
  
    useEffect(() => {
      const fetchModes = async () => {
        try {
          const q = query(
            collection(db, "users", user.uid, "transactions"),
            where("type", "==", "Income"),
            where("page", "==", "newAccount")
          );
  
          const querySnapshot = await getDocs(q);
          const modeSet = new Set();
  
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const modeTitle = `${data.mode}-${data.title}`; // Combine mode and title
            modeSet.add(modeTitle);
          });
          setOptions([...modeSet]); // Convert set to array
        } catch (error) {
          console.error("Error fetching modes:", error);
        }
      };
  
      fetchModes();
    }, []);
  
    return (
      <Toolbar
        sx={[
          { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
          numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          },
        ]}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle">
            Transactions Activity
          </Typography>
        )}
  
        {numSelected > 0 ? (
          <>
            <Tooltip title="Edit">
              <span>
                <IconButton
                  disabled={selected.length !== 1}
                  onClick={() =>
                    handleEdit(transactions.find((t) => t.id === selected[0]))
                  }
                >
                  <ModeEditIcon />
                </IconButton>
              </span>
            </Tooltip>
  
            <Modal
              open={openEdit}
              title="Edit Transaction"
              okText="Update"
              cancelText="Cancel"
              destroyOnClose
              onCancel={() => setOpenEdit(false)}
              onOk={() => editForm.submit()}
              confirmLoading={loading}
              okButtonProps={{ disabled: loading }}
            >
              <Form
                layout="vertical"
                form={editForm}
                name="edit_form_modal"
                onFinish={onUpdate}
              >
                <Form.Item
                  name="title"
                  label="Title"
                  style={{ flex: 1 }}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    // rules={[{ required: true }]}
                    name="category"
                    label="Category"
                    style={{ flex: 1 }}
                  >
                    <Select>
                      <Select.Option value="Housing">Housing</Select.Option>
                      <Select.Option value="Food">Food</Select.Option>
                      <Select.Option value="Transportation">
                        Transportation
                      </Select.Option>
                      <Select.Option value="Health">Health</Select.Option>
                      <Select.Option value="Kids">Kids</Select.Option>
                      <Select.Option value="Personal Care">
                        Personal Care
                      </Select.Option>
                      <Select.Option value="Clothing">Clothing</Select.Option>
                      <Select.Option value="Gifths">Gifts</Select.Option>
                      <Select.Option value="Savings">Savings</Select.Option>
                      <Select.Option value="Debts Payments">
                        Debts Payments
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="mode"
                    label="Mode"
                    style={{ flex: 1 }}
                  >
                    <Select>
                      {options.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="date"
                    label="Select Date"
                    style={{ width: "100%" }}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    rules={[{ required: true }]}
                    name="amount"
                    label="Amount"
                    style={{ width: "100%" }}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <div>
                  <Form.Item
                    name="comments"
                    // rules={[{ required: true }]}
                    label="Comments"
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                </div>
              </Form>
            </Modal>
  
            {/* <EditForm selectedTransaction={selectedTransaction} /> */}
            <Tooltip title="Delete">
              <IconButton onClick={showDeleteConfirm}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Add Expense">
            <IconButton onClick={() => setOpen(true)}>
              <AddBoxIcon />
            </IconButton>
          </Tooltip>
        )}
  
        <Modal
          open={open}
          title="New Transaction"
          okText="Create"
          cancelText="Cancel"
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          destroyOnClose
          confirmLoading={loading}
          okButtonProps={{ disabled: loading }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Expense" key="expense">
              <Form form={expenseForm} layout="vertical">
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true }]}
                  style={{ flex: 1 }}
                >
                  <Input />
                </Form.Item>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      <Select.Option value="Housing">Housing</Select.Option>
                      <Select.Option value="Food">Food</Select.Option>
                      <Select.Option value="Transportation">
                        Transportation
                      </Select.Option>
                      <Select.Option value="Health">Health</Select.Option>
                      <Select.Option value="Kids">Kids</Select.Option>
                      <Select.Option value="Personal Care">
                        Personal Care
                      </Select.Option>
                      <Select.Option value="Clothing">Clothing</Select.Option>
                      <Select.Option value="Gifts">Gifts</Select.Option>
                      <Select.Option value="Savings">Savings</Select.Option>
                      <Select.Option value="Debts Payments">
                        Debts Payments
                      </Select.Option>
                    </Select>
                  </Form.Item>
  
                  <Form.Item
                    name="mode"
                    label="Mode"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      {options.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </TabPane>
  
            <TabPane tab="Transfer" key="transfer">
              <Form form={transferForm} layout="vertical">
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="fromAccount"
                    label="From Account"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select onChange={(value) => setFromAccount(value)}>
                      {options.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="toAccount"
                    label="To Account"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      {options
                        .filter((option) => option !== fromAccount)
                        .map((option) => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </TabPane>
  
            <TabPane tab="Income" key="income">
              <Form form={incomeForm} layout="vertical">
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="toAccount"
                    label="To Account"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      {options.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true }]}
                    style={{ flex: 1 }}
                  >
                    <Select>
                      <Select.Option value="Salary">Salary</Select.Option>
                      <Select.Option value="Bonus">Bonus</Select.Option>
                      <Select.Option value="Rental Income">
                        Rental Income
                      </Select.Option>
                      <Select.Option value="Dividend Income">
                        Dividend Income
                      </Select.Option>
                      <Select.Option value="Interest Earned">
                        Interest Earned
                      </Select.Option>
                      <Select.Option value="Self Employed">
                        Self-Employed Income
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true }]}
                    style={{ width: "100%" }}
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </div>
                <Form.Item name="comments" label="Comments">
                  <TextArea rows={2} />
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Modal>
      </Toolbar>
    );
  }