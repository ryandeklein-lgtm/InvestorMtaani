import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Landing / Home
import Landing from "./pages/Landing";
import Home from "./pages/Home";

// Business
import BrowseBusinesses from "./pages/BrowseBusinesses";
import BusinessDetails from "./pages/BusinessDetails";
import BusinessForm from "./pages/BusinessForm";
import BusinessMatches from "./pages/BusinessMatches";
import BusinessProfile from "./pages/BusinessProfile";

// Investor
import InvestorProfile from "./pages/InvestorProfile";
import InvestorForm from "./pages/InvestorForm";

// Investor Pages
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import Messages from "./pages/Messages";

// Other
import Funding from "./pages/Funding";
import Matchmaking from "./pages/Matchmaking";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// Admin
import AdminPage from "./pages/AdminPage";

function Layout() {
  const location = useLocation();

  // Hide Navbar on Login and Register pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Browse Businesses */}
        <Route path="/browse" element={<BrowseBusinesses />} />

        {/* Business */}
        <Route path="/business/:id" element={<BusinessDetails />} />

        <Route
          path="/business-profile"
          element={
            <ProtectedRoute>
              <BusinessProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business/create"
          element={
            <ProtectedRoute>
              <BusinessForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business-matches"
          element={
            <ProtectedRoute>
              <BusinessMatches />
            </ProtectedRoute>
          }
        />

        {/* Investor */}
        <Route
          path="/investor-profile"
          element={
            <ProtectedRoute>
              <InvestorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/investor/create"
          element={
            <ProtectedRoute>
              <InvestorForm />
            </ProtectedRoute>
          }
        />

        {/* Investor Pages */}
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Platform */}
        <Route
          path="/funding"
          element={
            <ProtectedRoute>
              <Funding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/matchmaking"
          element={
            <ProtectedRoute>
              <Matchmaking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}