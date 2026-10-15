import { useState } from "react";
import { createClass } from "../../Apis/ApiCalls";

// Icon component
const IconifyIcon = ({
  icon,
  color = "currentColor",
  fontSize = "1rem",
  className = "",
  onClick = () => {},
}) => {
  const iconMap = {
    "mingcute:close-fill": "✕",
    "mingcute:delete-3-fill": "🗑️",
    "mingcute:add-line": "+",
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

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const AddClass = ({
  fetchData,
  handleModalClose,
  categories,
  trainers,
  location,
}) => {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    offerPrice: "",
    name: "",
    category: "",
    description: "",
    price: "",
    active: true,
    images: [],
    availability: [
      {
        day: "",
        time: "",
        duration: "",
        trainers: [],
        maxPeople: "",
        locations: [],
      },
    ],
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData({ ...formData, images: [...Array.from(e.target.files)] });
    }
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value,
    };
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleTrainersChange = (index, event) => {
    const value = event.target.value;
    handleAvailabilityChange(
      index,
      "trainers",
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const handleLocationsChange = (index, event) => {
    const value = event.target.value;
    handleAvailabilityChange(
      index,
      "locations",
      typeof value === "string" ? value.split(",") : value,
    );
  };

  const addAvailabilitySlot = () => {
    setFormData({
      ...formData,
      availability: [
        ...formData.availability,
        {
          day: 0,
          time: "",
          duration: 0,
          trainers: [],
          maxPeople: 0,
          locations: [],
        },
      ],
    });
  };

  const removeAvailabilitySlot = (index) => {
    const newAvailability = formData.availability.filter((_, i) => i !== index);
    setFormData({ ...formData, availability: newAvailability });
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      formData.images.length === 0
    ) {
      setError(true);
      setMessage("Please fill in all required fields");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          if (Array.isArray(value)) {
            value.forEach((file) => {
              formDataToSend.append("images", file);
            });
          }
        } else if (key === "availability") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await createClass(formDataToSend);
      if (response.status !== 200) {
        setError(true);
        setMessage("Error creating class");
        setTimeout(() => {
          setError(false);
          setMessage("");
        }, 2000);
        return;
      }

      fetchData();
      handleModalClose();
    } catch (error) {
      console.error(error);
      setError(true);
      setMessage("Error creating class");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Add New Class</h2>
          <button
            onClick={handleModalClose}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <IconifyIcon icon="mingcute:close-fill" fontSize="1.25rem" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price before Offer
              </label>
              <input
                type="number"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Availability Slots */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Availability Slots</h3>
            {formData.availability.map((slot, index) => (
              <div
                key={index}
                className="mb-4 p-4 border border-gray-700 rounded"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Slot {index + 1}</h4>
                  {formData.availability.length > 1 && (
                    <button
                      onClick={() => removeAvailabilitySlot(index)}
                      className="p-1 text-red-500 hover:text-red-400"
                    >
                      <IconifyIcon icon="mingcute:delete-3-fill" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Day
                    </label>
                    <select
                      value={slot.day}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "day",
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Day</option>
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "time",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={slot.duration}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "duration",
                            Number(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Max People
                      </label>
                      <input
                        type="number"
                        value={slot.maxPeople}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            index,
                            "maxPeople",
                            Number(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trainers
                    </label>
                    <select
                      multiple
                      value={slot.trainers}
                      onChange={(e) => handleTrainersChange(index, e)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                    >
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slot.trainers.map((trainerId) => {
                        const trainer = trainers.find(
                          (t) => t._id === trainerId,
                        );
                        return trainer ? (
                          <span
                            key={trainerId}
                            className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-sm"
                          >
                            {trainer.name}
                            <button
                              type="button"
                              onClick={() => {
                                const newTrainers = slot.trainers.filter(
                                  (id) => id !== trainerId,
                                );
                                handleAvailabilityChange(
                                  index,
                                  "trainers",
                                  newTrainers,
                                );
                              }}
                              className="ml-2 text-blue-400 hover:text-blue-300"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Locations
                    </label>
                    <select
                      multiple
                      value={slot.locations}
                      onChange={(e) => handleLocationsChange(index, e)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                    >
                      {location.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slot.locations.map((locationId) => {
                        const loc = location.find((l) => l._id === locationId);
                        return loc ? (
                          <span
                            key={locationId}
                            className="px-2 py-1 bg-green-900 text-green-200 rounded text-sm"
                          >
                            {loc.name}
                            <button
                              type="button"
                              onClick={() => {
                                const newLocations = slot.locations.filter(
                                  (id) => id !== locationId,
                                );
                                handleAvailabilityChange(
                                  index,
                                  "locations",
                                  newLocations,
                                );
                              }}
                              className="ml-2 text-green-400 hover:text-green-300"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addAvailabilitySlot}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded hover:bg-gray-800"
            >
              <IconifyIcon icon="mingcute:add-line" />
              Add Availability Slot
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Images *</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {formData.images.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                {formData.images.length} file(s) selected
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900 text-red-200 rounded">{message}</div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClass;
