import { useState, useEffect } from "react";
import axios from "axios";
import GroupForm from "./components/GroupForm";
import ExpenseForm from "./components/ExpenseForm";
import Balances from "./components/Balances";

function App() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/groups").then((res) => setGroups(res.data));
  }, []);

  const refreshBalances = async (groupId: number) => {
    try {
      const res = await axios.get(`http://localhost:8000/groups/${groupId}/balances`);
      setBalances(res.data);
    } catch (error) {
      console.error("Failed to fetch balances", error);
      setBalances([]);
    }
  };

  const refreshExpenses = async (groupId: number) => {
    try {
      const res = await axios.get(`http://localhost:8000/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
      setExpenses([]);
    }
  };

  const handleGroupSelect = (group: any) => {
    setSelectedGroup(group);
    refreshBalances(group.id);
    refreshExpenses(group.id);
  };

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
          Splitwise Clone 💸
        </h1>

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
