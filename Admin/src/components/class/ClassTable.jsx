import { useEffect, useState } from "react";

// Icon component
const IconifyIcon = ({
  icon,
  color = "currentColor",
  fontSize = "1rem",
  className = "",
  onClick = () => {},
}) => {
  const iconMap = {
    "mingcute:user-2-fill": "👤",
    "mdi:category": "📁",
    "mdi:image": "🖼️",
    "mdi:clock": "⏰",
    "mdi:timer": "⏱️",
    "mdi:account-group": "👥",
    "mdi:location": "📍",
    "mdi:toggle-switch": "🔘",
    "mingcute:eye-2-line": "👁️",
    "mingcute:edit-line": "✏️",
    "mingcute:delete-3-fill": "🗑️",
  };

  return (
    <span
      className={className}
      style={{
        color,
        fontSize,
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      {iconMap[icon] || icon}
    </span>
  );
};

const ClassTable = ({
  classes,
  editModal,
  viewModal,
  selectedClass,
  imageApi,
  deleteClass,
}) => {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRows(classes || []);
  }, [classes]);

  const handleDeleteClick = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"?\nThis action cannot be undone!`,
      )
    ) {
      return;
    }

    setLoading(true);
    setSelectedId(id);
    setError(null);

    try {
      const del = await deleteClass(id.toString());

      if (del?.status !== 200) {
        setError("Failed to delete class. Please try again.");
        return;
      }

      // Show success message
      alert(`${name} has been deleted successfully.`);

      // Remove from UI
      setRows(rows.filter((row) => row._id !== id));
    } catch (err) {
      console.log(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TableHeader = ({ icon, text }) => (
    <div className="flex items-center gap-2">
      <IconifyIcon icon={icon} fontSize="0.875rem" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  const columns = [
    {
      key: "name",
      label: <TableHeader icon="mingcute:user-2-fill" text="Name" />,
      width: "15%",
      render: (row) => row.name || "N/A",
    },
    {
      key: "category",
      label: <TableHeader icon="mdi:category" text="Category" />,
      width: "12%",
      render: (row) => row.category?.title || "N/A",
    },
    {
      key: "image",
      label: <TableHeader icon="mdi:image" text="Images" />,
      width: "15%",
      render: (row) => (
        <div className="flex gap-2">
          {row.image?.map((img, index) => (
            <div key={index} className="w-12 h-12 flex-shrink-0">
              <img
                src={imageApi + img}
                alt={`Class ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "active",
      label: <TableHeader icon="mdi:toggle-switch" text="Status" />,
      width: "10%",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      width: "15%",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              selectedClass(row);
              viewModal();
            }}
            className="p-2 hover:bg-blue-50 rounded text-blue-600"
            title="View"
          >
            <IconifyIcon icon="mingcute:eye-2-line" />
          </button>
          <button
            onClick={() => {
              selectedClass(row);
              editModal();
            }}
            className="p-2 hover:bg-yellow-50 rounded text-yellow-600"
            title="Edit"
          >
            <IconifyIcon icon="mingcute:edit-line" />
          </button>
          <button
            onClick={() => handleDeleteClick(row._id, row.name)}
            disabled={loading && selectedId === row._id}
            className="p-2 hover:bg-red-50 rounded text-red-600 disabled:opacity-50"
            title="Delete"
          >
            {loading && selectedId === row._id ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <IconifyIcon icon="mingcute:delete-3-fill" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No classes found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{rows.length}</span> of{" "}
            <span className="font-medium">{rows.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border rounded text-sm">1</button>
            <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTable;
