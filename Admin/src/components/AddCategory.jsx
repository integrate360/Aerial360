import { useState } from "react";
import { createCategories } from "../Apis/ApiCalls";

const AddCategory = ({ fetchData }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const createHandler = async () => {
    if (!title || !description || !image) {
      setError(true);
      setMessage("All fields, including an image, are required!");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image);

      const create = await createCategories(formData);
      if (create.status !== 200) {
        setError(true);
        setMessage("Error creating Category");
        setTimeout(() => {
          setError(false);
          setMessage("");
        }, 2000);
        return;
      }

      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Refresh data
      await fetchData();

      // Show success message
      toast.success("Category created successfully!");
    } catch (error) {
      console.log(error);
      setError(true);
      setMessage("An error occurred while creating the category");
      setTimeout(() => {
        setError(false);
        setMessage("");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {error ? (
                <span className="text-red-600">{message}</span>
              ) : (
                "Categories"
              )}
            </h1>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Title Input */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
                className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Description Input */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="relative w-full sm:w-auto">
              <label className="cursor-pointer">
                <div className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {image && (
                <p className="mt-2 text-sm text-gray-600 truncate">
                  Selected: {image.name}
                </p>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={createHandler}
              disabled={isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
