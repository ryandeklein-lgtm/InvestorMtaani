import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Load route pages only when a visitor opens them to keep the first page fast.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const BrowseBusinesses = lazy(() => import("./pages/BrowseBusinesses"));
const BusinessDetails = lazy(() => import("./pages/BusinessDetails"));
const BusinessForm = lazy(() => import("./pages/BusinessForm"));
const BusinessMatches = lazy(() => import("./pages/BusinessMatches"));
const BusinessProfile = lazy(() => import("./pages/BusinessProfile"));
const KYC = lazy(() => import("./pages/KYCFlow"));
const AdminKYC = lazy(() => import("./pages/AdminKYC"));
const InvestorProfile = lazy(() => import("./pages/InvestorProfile"));
const InvestorForm = lazy(() => import("./pages/InvestorForm"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Messages = lazy(() => import("./pages/Messages"));
const Funding = lazy(() => import("./pages/Funding"));
const Matchmaking = lazy(() => import("./pages/Matchmaking"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const Legal = lazy(() => import("./pages/Legal"));

// Shortcuts so the route list below stays readable
const BUSINESS_ONLY = ["business"];
const INVESTOR_ONLY = ["investor"];
const BUSINESS_OR_INVESTOR = ["business", "investor"];

function Layout() {
  const location = useLocation();

  // Hide Navbar on Login and Register pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Suspense fallback={<div className="im-route-loader" role="status"><span className="im-loader-orbit" aria-hidden="true" />Loading your page…</div>}>
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
        <Route
          path="/messages"
          element={
            <ProtectedRoute roles={BUSINESS_OR_INVESTOR}>
              <Messages />
            </ProtectedRoute>
          }
        />

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
        <Route path="/admin/kyc" element={<ProtectedRoute adminOnly><AdminKYC /></ProtectedRoute>} />

        {/* Legal pages (public) */}
        <Route path="/terms" element={<Legal doc="terms" />} />
        <Route path="/privacy" element={<Legal doc="privacy" />} />
        <Route path="/risk-disclosure" element={<Legal doc="risk" />} />
        <Route path="/kyc-policy" element={<Legal doc="kyc" />} />
        <Route path="/contact" element={<Legal doc="contact" />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      {!hideNavbar && <Footer />}
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
