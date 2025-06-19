import { useState } from "react";
import axios from "axios";

interface ExpenseFormProps {
  groups: any[];
  onGroupSelect: (group: any) => void;
  onExpenseAdded?: () => void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ExpenseForm = ({ groups, onGroupSelect, onExpenseAdded }: ExpenseFormProps) => {
  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splitRatios, setSplitRatios] = useState<{ user_id: number; percentage?: number }[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGroupChange = (id: string) => {
    setGroupId(id);
    const selected = groups.find((g) => g.id.toString() === id);
    if (selected) {
      const initRatios = selected.users.map((u: any) => ({
        user_id: u.id,
        percentage: undefined,
      }));
      setSplitRatios(initRatios);
      onGroupSelect(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      description,
      amount: parseFloat(amount),
      paid_by: parseInt(paidBy),
      split_type: splitType,
      splits:
        splitType === "equal"
          ? splitRatios.map((s) => ({ user_id: s.user_id }))
          : splitRatios,
    };

    try {
      await axios.post(`${BASE_URL}/groups/${groupId}/expenses`, payload);
      setSuccessMsg("✅ Expense added successfully!");
      if (onExpenseAdded) onExpenseAdded();

      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitRatios([]);
    } catch (err) {
      console.error("❌ Failed to add expense:", err);
      setErrorMsg("❌ Failed to add expense. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && <p className="text-green-400 font-semibold">{successMsg}</p>}
      {errorMsg && <p className="text-red-400 font-semibold">{errorMsg}</p>}

      <select
        className="w-full bg-gray-900 text-white border border-purple-500 rounded-xl px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => handleGroupChange(e.target.value)}
        required
      >
        <option value="">Select Group</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-gray-900 text-white border border-purple-500 rounded-xl px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full bg-gray-900 text-white border border-purple-500 rounded-xl px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

      <input
        type="text"
        placeholder="Paid By (User ID)"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        className="w-full bg-gray-900 text-white border border-purple-500 rounded-xl px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

      <select
        className="w-full bg-gray-900 text-white border border-purple-500 rounded-xl px-3 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
      >
        <option value="equal">Equal</option>
        <option value="percentage">Percentage</option>
      </select>

      {splitType === "percentage" && (
        <div className="space-y-2">
          {splitRatios.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="text-sm text-white">User {s.user_id}</label>
              <input
                type="number"
                placeholder="% share"
                className="border bg-gray-900 text-white px-2 py-1 rounded w-full border-purple-500 shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) => {
                  const newRatios = [...splitRatios];
                  newRatios[i].percentage = parseFloat(e.target.value);
                  setSplitRatios(newRatios);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="bg-purple-700 text-white font-bold px-4 py-2 rounded-xl hover:bg-purple-600 shadow-md hover:shadow-purple-500 transition"
      >
        ➕ Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
