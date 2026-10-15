import React, { useState, useEffect } from "react";
import { getCategories, getClasses, getPackages } from "../../Apis/ApiCalls";
import PackageDisplay from "./ViewPackage";
import EditPackage from "./Editpackage";
import AddPackage from "./Addpackage";
import PackageTable from "./PackageTable";
import { Plus, RefreshCcw, Search } from "lucide-react";

const PackageList = () => {
  const [classes, setClasses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedClass, setSelectedClass] = useState();

  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const resClasses = await getClasses();
      const resPackages = await getPackages();
      const resCategory = await getCategories();

      if (resClasses?.status === 200) setClasses(resClasses.data || []);
      if (resPackages?.status === 200)
        setPackages(resPackages.data?.reverse() || []);
      if (resCategory?.status === 200) setCategory(resCategory.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic for search
  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Packages Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all your packages in one place
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm flex-1 md:flex-none"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm flex-1 md:flex-none"
          >
            <Plus size={18} />
            Add Package
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <PackageTable
        packages={filteredPackages}
        editModal={() => setEditModal(true)}
        viewModal={() => setViewModal(true)}
        selectedPackage={(e) => setSelectedClass(e)}
        setPackages={setPackages} // Pass setter for delete updates
      />

      {/* Modals */}
      {openModal && (
        <AddPackage
          fetchData={fetchData}
          classes={classes}
          handleModalClose={() => setOpenModal(false)}
          category={category}
        />
      )}

      {editModal && (
        <EditPackage
          fetchData={fetchData}
          handleModalClose={() => setEditModal(false)}
          classes={classes}
          category={category}
          data={selectedClass}
        />
      )}

      {viewModal && (
        <PackageDisplay
          data={selectedClass}
          handleModalClose={() => setViewModal(false)}
        />
      )}
    </div>
  );
};

export default PackageList;
