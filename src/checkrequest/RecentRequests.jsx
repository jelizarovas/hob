import React from "react";

const RecentRequests = ({
  recentRequests,
  onSelectRecent,
  onClearRecent,
  onClearAll,
}) => {
  if (recentRequests.length === 0) return <div>No recent check requests.</div>;

  return (
    <div>
      {recentRequests.map((req, index) => (
        <div
          key={index}
          className="border p-2 my-1 flex justify-between items-center cursor-pointer"
          onClick={() => onSelectRecent(req)}
        >
          <div>
            <div className="font-semibold">
              {req.name} - {req.amount}
            </div>
            {req.description && (
              <div className="text-sm">{req.description}</div>
            )}
            <div className="text-sm">{req.detailsExplanation}</div>
            {req.submittedAt && (
              <div className="text-xs text-gray-400">
                {new Date(req.submittedAt).toLocaleString()}
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearRecent(index);
            }}
            className="text-red-500 underline"
          >
            Clear
          </button>
        </div>
      ))}
      <button
        onClick={onClearAll}
        className="mt-2 bg-red-600 px-3 py-1 rounded"
      >
        Clear All
      </button>
    </div>
  );
};

export default RecentRequests;
