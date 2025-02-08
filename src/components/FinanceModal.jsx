import React, { useState } from "react";
import { Modal, Tabs, Form, Input, Select, DatePicker, InputNumber } from "antd";

const { TextArea } = Input;
const { TabPane } = Tabs;

const FinanceModal = ({ open, setOpen, onCreate }) => {
  const [activeTab, setActiveTab] = useState("expense");

  const [expenseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [incomeForm] = Form.useForm();

  const handleSubmit = async () => {
    try {
      let values;
      if (activeTab === "expense") {
        values = await expenseForm.validateFields();
      } else if (activeTab === "transfer") {
        values = await transferForm.validateFields();
      } else if (activeTab === "income") {
        values = await incomeForm.validateFields();
      }
      onCreate({ type: activeTab, values });
      setOpen(false);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      title="New Transaction"
      okText="Create"
      cancelText="Cancel"
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Expense" key="expense">
          <Form form={expenseForm} layout="vertical">
            <Form.Item name="title" label="Title" rules={[{ required: true }]}> <Input /> </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}> <DatePicker style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}> <InputNumber style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="account" label="Account" rules={[{ required: true }]}> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="comments" label="Comments"> <TextArea rows={2} /> </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Transfer" key="transfer">
          <Form form={transferForm} layout="vertical">
            <Form.Item name="fromAccount" label="From Account"> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="toAccount" label="To Account"> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="date" label="Date"> <DatePicker style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="amount" label="Amount"> <InputNumber style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="comments" label="Comments"> <TextArea rows={2} /> </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Income" key="income">
          <Form form={incomeForm} layout="vertical">
            <Form.Item name="toAccount" label="To Account"> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="category" label="Category"> <Select> {/* options */} </Select> </Form.Item>
            <Form.Item name="date" label="Date"> <DatePicker style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="amount" label="Amount"> <InputNumber style={{ width: "100%" }} /> </Form.Item>
            <Form.Item name="comments" label="Comments"> <TextArea rows={2} /> </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default FinanceModal;
