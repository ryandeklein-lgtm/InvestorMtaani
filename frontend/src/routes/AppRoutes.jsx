import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import BusinessProfile from "../pages/BusinessProfile";
import InvestorProfile from "../pages/InvestorProfile";

import BusinessForm from "../pages/BusinessForm";
import BusinessDetails from "../pages/BusinessDetails";
import BrowseBusinesses from "../pages/BrowseBusinesses";

import BusinessMatches from "../pages/BusinessMatches";

import Funding from "../pages/Funding";
import Notifications from "../pages/Notifications";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/ProtectedRoute";


const AppRoutes = () => {

  return (

    <BrowserRouter>

      <Routes>


        {/* Public Routes */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/browse"
          element={<BrowseBusinesses />}
        />


        <Route
          path="/business/:id"
          element={<BusinessDetails />}
        />



        {/* Business Routes */}


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



        {/* Business Matchmaking Requests */}

        <Route
          path="/business-matches"
          element={
            <ProtectedRoute>
              <BusinessMatches />
            </ProtectedRoute>
          }
        />



        {/* Investor Route */}


        <Route
          path="/investor-profile"
          element={
            <ProtectedRoute>
              <InvestorProfile />
            </ProtectedRoute>
          }
        />



        {/* Other Protected Routes */}


        <Route
          path="/funding"
          element={
            <ProtectedRoute>
              <Funding />
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



        {/* 404 */}

        <Route
          path="*"
          element={<NotFound />}
        />


      </Routes>


    </BrowserRouter>

  );

};


export default AppRoutes;