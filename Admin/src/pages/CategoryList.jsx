import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { getCategories } from "../Apis/ApiCalls";
import CategoryStatusTable from "../components/CategoryStatusTable";
import AddCategory from "../components/AddCategory";

const CategoryList = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCategories();
      if (res?.status !== 200) {
        setError(res?.message || "Failed to fetch categories");
        toast.error(res?.message || "Failed to fetch categories");
        return;
      }
      setCats(res?.data?.reverse() || []);
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching categories");
      toast.error("An error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleCategoryAdded = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Failed to load categories
            </h3>
            <p className="text-gray-600 max-w-md">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gradient-to-r from-[#0D47A1] to-[#5472D3] hover:from-[#0D3A7A] hover:to-[#4162C5] text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Table */}
      <CategoryStatusTable cats={cats} onCategoryAdded={handleCategoryAdded} />
    </div>
  );
};

export default CategoryList;
