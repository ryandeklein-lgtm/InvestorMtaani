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

// 404
import NotFound from "./pages/NotFound";

function Layout() {
  const location = useLocation();

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
        <Route path="/home" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Browse Businesses */}
        <Route path="/browse" element={<BrowseBusinesses />} />

        {/* Business */}
        <Route
          path="/business/:id"
          element={<BusinessDetails />}
        />

        <Route
          path="/business-profile"
          element={<BusinessProfile />}
        />

        <Route
          path="/business/create"
          element={<BusinessForm />}
        />

        <Route
          path="/business-matches"
          element={<BusinessMatches />}
        />

        {/* Investor */}
        <Route
          path="/investor-profile"
          element={<InvestorProfile />}
        />

        <Route
          path="/investor/create"
          element={<InvestorForm />}
        />

        {/* Investor Pages */}
        <Route
          path="/watchlist"
          element={<Watchlist />}
        />

        <Route
          path="/portfolio"
          element={<Portfolio />}
        />

        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* Platform */}
        <Route
          path="/funding"
          element={<Funding />}
        />

        <Route
          path="/matchmaking"
          element={<Matchmaking />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />
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