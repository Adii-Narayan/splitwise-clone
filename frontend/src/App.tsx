import { useState, useEffect } from "react";
import axios from "axios";
import GroupForm from "./components/GroupForm";
import ExpenseForm from "./components/ExpenseForm";
import Balances from "./components/Balances";

// Use environment variable for backend base URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Fetch all groups on first render
  useEffect(() => {
    axios
      .get(`${BASE_URL}/groups`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("❌ Error fetching groups:", err));
  }, []);

  // Fetch balances for a selected group
  const refreshBalances = async (groupId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/${groupId}/balances`);
      setBalances(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch balances", error);
      setBalances([]);
    }
  };

  // Fetch expenses for a selected group
  const refreshExpenses = async (groupId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch expenses", error);
      setExpenses([]);
    }
  };

  // When group is selected in dropdown
  const handleGroupSelect = (group: any) => {
    setSelectedGroup(group);
    refreshBalances(group.id);
    refreshExpenses(group.id);
  };

  // On expense addition, update group data
  const handleExpenseAdded = () => {
    if (selectedGroup) {
      refreshBalances(selectedGroup.id);
      refreshExpenses(selectedGroup.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-300">
          💸 Splitwise Clone
        </h1>

        {/* Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2 text-purple-300">Create Group</h2>
            <GroupForm onGroupCreated={(group: any) => setGroups([...groups, group])} />
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2 text-purple-300">Add Expense</h2>
            <ExpenseForm
              groups={groups}
              onGroupSelect={handleGroupSelect}
              onExpenseAdded={handleExpenseAdded}
            />
          </div>
        </div>

        {/* Expense List */}
        {selectedGroup && expenses.length > 0 && (
          <div className="bg-gray-800 rounded-2xl mt-6 p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-purple-300">
              Expenses in {selectedGroup.name}
            </h2>
            <ul className="space-y-2">
              {expenses.map((e, i) => (
                <li key={i} className="text-white">
                  {e.description} - ₹{e.amount} (Paid by User {e.paid_by})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Balance Summary */}
        <div className="bg-gray-800 rounded-2xl shadow-md mt-6 p-4">
          <h2 className="text-xl font-semibold mb-2 text-purple-300">
            Balances for {selectedGroup ? selectedGroup.name : "Group"}
          </h2>
          {selectedGroup ? (
            <Balances balances={balances} group={selectedGroup} />
          ) : (
            <p className="text-gray-400">Select a group to view balances</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
