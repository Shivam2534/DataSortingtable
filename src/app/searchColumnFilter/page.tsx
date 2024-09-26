import React from "react";

function searchColumnFilter({
  columnAttribute,
  handleColumnSelectionFilter,
  searchColumn,
}) {
  return (
    <div className="flex gap-2">
      {columnAttribute.map((column, ind) => (
        <button
          type="button"
          key={ind}
          onClick={() => handleColumnSelectionFilter(column)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            searchColumn === column
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {column.charAt(0).toUpperCase() + column.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default page;
