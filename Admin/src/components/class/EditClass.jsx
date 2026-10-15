import { useState, useEffect } from "react";
import { updateClass } from "../../Apis/ApiCalls";

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

const EditClass = ({
  fetchData,
  handleModalClose,
  categories,
  trainers,
  location,
  data,
}) => {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    active: true,
    images: [],
    availability: [],
    offerPrice: 0,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        category:
          typeof data.category === "string"
            ? data.category
            : data.category?._id || "",
        description: data.description || "",
        price: data.price || 0,
        active: data.active ?? true,
        images: data.image || [],
        offerPrice: data?.offerPrice || 0,
        availability: Array.isArray(data.availability)
          ? data.availability.map((slot) => ({
              day: slot.day || 0,
              time: slot.time || "",
              duration: slot.duration || 0,
              trainers: Array.isArray(slot.trainers)
                ? slot.trainers
                    .map((t) => (typeof t === "string" ? t : t._id))
                    .filter((t) => t !== undefined)
                : [],
              maxPeople: slot.maxPeople || 0,
              locations: Array.isArray(slot.locations)
                ? slot.locations
                    .map((l) => (typeof l === "string" ? { _id: l } : l))
                    .filter((l) => l !== undefined)
                : [],
            }))
          : [
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
    }
  }, [data]);

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

    if (field === "locations") {
      const selectedLocations = value.map((locationId) => ({
        _id: locationId,
        name: location.find((loc) => loc._id === locationId)?.name || "",
        address: location.find((loc) => loc._id === locationId)?.address || "",
        googleMapLink:
          location.find((loc) => loc._id === locationId)?.googleMapLink || "",
      }));

      newAvailability[index] = {
        ...newAvailability[index],
        locations: selectedLocations,
      };
    } else {
      newAvailability[index] = {
        ...newAvailability[index],
        [field]: value,
      };
    }

    setFormData({ ...formData, availability: newAvailability });
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
    setLoading(true);
    if (!formData.name || !formData.description || !formData.price) {
      setError(true);
      setMessage("Please fill in all required fields");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          if (Array.isArray(value)) {
            value.forEach((file) => {
              if (file instanceof File) {
                formDataToSend.append("images", file);
              }
            });
          }
        } else if (key === "availability") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await updateClass(formDataToSend, data?._id || "");
      if (response.status !== 200) {
        setError(true);
        setMessage("Error updating class");
        setTimeout(() => {
          setError(false);
          setMessage("");
        }, 2000);
        setLoading(false);
        return;
      }

      fetchData();
      handleModalClose();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
      setMessage("Error updating class");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-900 text-white rounded-lg p-8">Updating...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Edit Class</h2>
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
                      value={slot.trainers
                        .map((trainer) =>
                          typeof trainer === "string" ? trainer : trainer._id,
                        )
                        .filter((id) => id !== undefined)}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "trainers",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                    >
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slot.trainers
                        .map((trainer) =>
                          typeof trainer === "string" ? trainer : trainer._id,
                        )
                        .filter((id) => id !== undefined)
                        .map((trainerId) => {
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
                                    (id) =>
                                      (typeof id === "string" ? id : id._id) !==
                                      trainerId,
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
                      value={slot.locations
                        .map((loc) => loc._id)
                        .filter((id) => id !== undefined)}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          index,
                          "locations",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                    >
                      {location.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slot.locations
                        .map((loc) => loc._id)
                        .filter((id) => id !== undefined)
                        .map((locationId) => {
                          const loc = location.find(
                            (l) => l._id === locationId,
                          );
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
                                    (l) => l._id !== locationId,
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
            <label className="block text-sm font-medium mb-2">
              Images (New images will replace existing ones)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {formData.images.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                {formData.images.filter((img) => img instanceof File).length}{" "}
                new file(s) selected
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm font-medium">
              Active
            </label>
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
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClass;
