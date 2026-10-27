import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

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
import KYC from "./pages/KYCFlow";

// Investor
import InvestorProfile from "./pages/InvestorProfile";
import InvestorForm from "./pages/InvestorForm";

// Investor Pages
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";

// Other
import Funding from "./pages/Funding";
import Matchmaking from "./pages/Matchmaking";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// Admin
import AdminPage from "./pages/AdminPage";

// Shortcuts so the route list below stays readable
const BUSINESS_ONLY = ["business"];
const INVESTOR_ONLY = ["investor"];
const BUSINESS_OR_INVESTOR = ["business", "investor"];

function LegacyMessagesRedirect() {
  let destination = "/login";
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "business") destination = "/business-matches";
    else if (user?.role === "investor") destination = "/matchmaking";
    else if (user) destination = "/home";
  } catch { /* Send malformed or missing local sessions to sign-in. */ }
  return <Navigate to={destination} replace />;
}

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

        {/* Home (any logged-in user) */}
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

        {/* Browse Businesses (public: backend only returns approved ones) */}
        <Route path="/browse" element={<BrowseBusinesses />} />

        {/* Business details (public: approved businesses only) */}
        <Route path="/business/:id" element={<BusinessDetails />} />

        {/* Business-only pages */}
        <Route
          path="/business-profile"
          element={
            <ProtectedRoute roles={BUSINESS_ONLY}>
              <BusinessProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business/create"
          element={
            <ProtectedRoute roles={BUSINESS_ONLY}>
              <BusinessForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/business-matches"
          element={
            <ProtectedRoute roles={BUSINESS_ONLY}>
              <BusinessMatches />
            </ProtectedRoute>
          }
        />

        {/* KYC: the brief requires it for both businesses and investors */}
        <Route
          path="/kyc"
          element={
            <ProtectedRoute roles={BUSINESS_OR_INVESTOR}>
              <KYC />
            </ProtectedRoute>
          }
        />

        {/* Investor-only pages */}
        <Route
          path="/investor-profile"
          element={
            <ProtectedRoute roles={INVESTOR_ONLY}>
              <InvestorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/investor/create"
          element={
            <ProtectedRoute roles={INVESTOR_ONLY}>
              <InvestorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute roles={INVESTOR_ONLY}>
              <Watchlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute roles={INVESTOR_ONLY}>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        {/* Shared pages */}
        <Route path="/messages" element={<LegacyMessagesRedirect />} />

        <Route
          path="/funding"
          element={
            <ProtectedRoute roles={BUSINESS_OR_INVESTOR}>
              <Funding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/matchmaking"
          element={
            <ProtectedRoute roles={BUSINESS_OR_INVESTOR}>
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
