import { useState } from "react";
import axios from "axios";

// Access your backend base URL from the environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GroupForm = ({ onGroupCreated }: { onGroupCreated: (group: any) => void }) => {
  const [name, setName] = useState("");
  const [userNames, setUserNames] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const users = userNames.split(",").map((name) => ({ name: name.trim() }));

    try {
      const res = await axios.post(`${BASE_URL}/groups`, { name, users });
      onGroupCreated(res.data);
      setName("");
      setUserNames("");
    } catch (err) {
      console.error("❌ Failed to create group:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl border border-purple-700 space-y-4"
    >
      <h3 className="text-xl font-bold text-purple-400 drop-shadow">🎯 Create a New Group</h3>

      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 text-white border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

      <input
        type="text"
        placeholder="User names (comma separated)"
        value={userNames}
        onChange={(e) => setUserNames(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 text-white border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />

      <button
        type="submit"
        className="w-full bg-purple-700 hover:bg-purple-800 transition duration-200 text-white py-2 rounded-lg shadow-md"
      >
        🚀 Create Group
      </button>
    </form>
  );
};

export default GroupForm;
