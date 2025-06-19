interface BalancesProps {
  balances: any[];
  group?: { name: string };
}

const Balances = ({ balances, group }: BalancesProps) => {
  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-lg border border-purple-700">
      {group && (
        <h3 className="text-lg font-semibold text-purple-400 mb-4 drop-shadow-md">
          💰 Balances for Group: <span className="text-white">{group.name}</span>
        </h3>
      )}

      {balances.length === 0 ? (
        <p className="text-gray-400">No balances yet.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {balances.map((b, i) => (
            <li
              key={i}
              className="text-sm text-purple-200 bg-gray-800 px-3 py-1 rounded-md shadow-md"
            >
              👤 User {b.from_} owes 👤 User {b.to}: <span className="text-green-400 font-bold">₹{b.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Balances;
