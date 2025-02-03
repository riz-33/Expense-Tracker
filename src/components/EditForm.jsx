import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import TextArea from "antd/es/input/TextArea";

export const EditForm = () => {
  return (
    <div>
      <div style={{ display: "flex", gap: "16px" }}>
        <Form.Item
          name="title"
          label="Title"
          style={{ flex: 1 }}
          rules={[
            {
              // required: true,
              message: "Please input the title of Expense!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category" style={{ flex: 1 }}>
          <Select>
            <Select.Option value="housing">Housing</Select.Option>
            <Select.Option value="food">Food</Select.Option>
            <Select.Option value="transportation">Transportation</Select.Option>
            <Select.Option value="health">Health</Select.Option>
            <Select.Option value="kids">Kids</Select.Option>
            <Select.Option value="personal">Personal Care</Select.Option>
            <Select.Option value="clothing">Clothing</Select.Option>
            <Select.Option value="gifths">Gifts</Select.Option>
            <Select.Option value="savings">Savings</Select.Option>
            <Select.Option value="debts">Debts Payments</Select.Option>
          </Select>
        </Form.Item>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <Form.Item name="date" label="Select Date" style={{ width: "100%" }}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="amount" label="Amount" style={{ width: "100%" }}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="account" label="Account" style={{ width: "100%" }}>
          <Select>
            <Select.Option value="cash">Cash</Select.Option>
            <Select.Option value="debit">Debit Card</Select.Option>
            <Select.Option value="credit">Credit Card</Select.Option>
          </Select>
        </Form.Item>
      </div>
      <div>
        <Form.Item name="comments" label="Comments">
          <TextArea rows={2} />
        </Form.Item>
      </div>
    </div>
  );
};
