import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import Sidebar from "./layouts/sidebar";
import Dashboard from "./pages/Dashboard";
import AppVersionsList from "./pages/appVersions/AppversionsList";
import UserList from "./components/UserList";
import BookingsPage from "./components/BookingsPage";
import BacheloretteList from "./components/BacheloretteList";
import EnquiryList from "./components/EnquiryList";
import CategoryList from "./pages/CategoryList";
import NotFound from "./layouts/Notfound";
import PaymentList from "./pages/payments/pyamentList";
import Banner from "./pages/advertisement/adsList";
import LocationsList from "./pages/location/locationsList";
import StaffList from "./pages/staff/StaffList";
import ClassPage from "./pages/ClassPage";
import UserPackageList from "./pages/UserPackageList";
import AddPackage from "./pages/Package/PackageList";
// import Bookings from "./pages/Bookings";
// import UserPackage from "./pages/UserPackage";
// import Class from "./pages/Class";
// import Package from "./pages/Package";
// import Staff from "./pages/Staff";
// import Banner from "./pages/Banner";
// import Locations from "./pages/Locations";
// import Payments from "./pages/Payments";

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Protected Route wrapper for admin routes
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    window.location.href = "/login";
    return null;
  }
  return children;
};

// Public Route wrapper for login page (prevent access if already logged in)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    window.location.href = "/dashboard";
    return null;
  }
  return children;
};

// Admin Layout wrapper
const AdminLayout = ({ children }) => (
  <ProtectedRoute>
    <Sidebar>{children}</Sidebar>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  // Admin routes with layout
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "bookings",
        element: <BookingsPage />,
      },
      {
        path: "userpackage",
        element: <UserPackageList />,
      },
      {
        path: "category",
        element: <CategoryList />,
      },
      {
        path: "class",
        element: <ClassPage />,
      },
    
      {
        path: "staff",
        element: <StaffList />,
      },
       {
        path: 'package',
        element: <AddPackage />,
      },


      {
        path: "enquiry",
        element: <EnquiryList />,
      },
      {
        path: "bachelorette",
        element: <BacheloretteList />,
      },
      {
        path: "banner",
        element: <Banner />,
      },
      {
        path: "locations",
        element: <LocationsList />,
      },
      {
        path: "payments",
        element: <PaymentList />,
      },
      {
        path: "appversionsList",
        element: <AppVersionsList />,
      },
      // Default redirect to dashboard
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
