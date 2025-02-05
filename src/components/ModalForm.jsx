import {
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import TextArea from "antd/es/input/TextArea";
const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: "1",
    label: "Expense",
    children: (
      <div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="title"
            label="Title"
            style={{ flex: 1 }}
            rules={[
              {
                required: true,
                message: "Please input the title of Expense!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" style={{ flex: 1 }}
                      rules={[
                        {
                          required: true,
                          message: "Please input the category of Expense!",
                        },
                      ]}>
            <Select>
              <Select.Option value="housing">Housing</Select.Option>
              <Select.Option value="food">Food</Select.Option>
              <Select.Option value="transportation">
                Transportation
              </Select.Option>
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
          <Form.Item name="date" label="Select Date" style={{ width: "100%" }}
                      rules={[
                        {
                          required: true,
                          message: "Please input the date of Expense!",
                        },
                      ]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="amount" label="Amount" style={{ width: "100%" }}
                      rules={[
                        {
                          required: true,
                          message: "Please input the amount of Expense!",
                        },
                      ]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="account" label="Account" style={{ width: "100%" }}
                      rules={[
                        {
                          required: true,
                          message: "Please input the account of Expense!",
                        },
                      ]}>
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
    ),
  },
  {
    key: "2",
    label: "Transfer",
    children: (
      <div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="fromAccount"
            label="From Account"
            style={{ flex: 1 }}
          >
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="debit">Debit Card</Select.Option>
              <Select.Option value="credit">Credit Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="toAccount" label="To Account" style={{ flex: 1 }}>
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="debit">Debit Card</Select.Option>
              <Select.Option value="credit">Credit Card</Select.Option>
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
        </div>
        <div>
          <Form.Item name="comments" label="Comments">
            <TextArea rows={2} />
          </Form.Item>
        </div>
      </div>
    ),
  },
  {
    key: "3",
    label: "Income",
    children: (
      <div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="toAccount"
            label="To Account"
            style={{ flex: 1 }}
          >
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="debit">Debit Card</Select.Option>
              <Select.Option value="credit">Credit Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="catogory" label="Category" style={{ flex: 1 }}>
            <Select>
              <Select.Option value="salary">Salary</Select.Option>
              <Select.Option value="bonus">Bonus</Select.Option>
              <Select.Option value="rental">Rental Income</Select.Option>
              <Select.Option value="dividend">Dividend Income</Select.Option>
              <Select.Option value="interest">Interest Earned</Select.Option>
              <Select.Option value="selfEmployed">Self-Employed Income</Select.Option>
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
        </div>
        <div>
          <Form.Item name="comments" label="Comments">
            <TextArea rows={2} />
          </Form.Item>
        </div>
      </div>
    ),
  },
];
const ModalTab = () => (
  <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
);
export default ModalTab;
