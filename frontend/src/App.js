import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import SearchResults from "./pages/SearchResults";
import Deals from "./pages/Deals";
import Notifications from "./pages/Notifications";
import Rewards from "./pages/Rewards";
import Jobs from "./pages/Jobs";
import JobApply from "./pages/JobApply";
import MyApplications from "./pages/MyApplications";
import DietPlanner from "./pages/DietPlanner";
import Support from "./pages/Support";
import SupportTicket from "./pages/SupportTicket";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import AdminLayout from "./pages/admin/AdminLayout";
import MerchantRegister from "./pages/merchant/MerchantRegister";
import MerchantLayout from "./pages/merchant/MerchantLayout";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantMenu from "./pages/merchant/MerchantMenu";
import MerchantDonations from "./pages/merchant/MerchantDonations";
import MerchantWastage from "./pages/merchant/MerchantWastage";
import MerchantJobs from "./pages/merchant/MerchantJobs";
import MerchantApplications from "./pages/merchant/MerchantApplications";
import Dashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRestaurants from "./pages/admin/ManageRestaurants";
import ManageMenu from "./pages/admin/ManageMenu";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageCharities from "./pages/admin/ManageCharities";
import ManageDonations from "./pages/admin/ManageDonations";
import ManageNotifications from "./pages/admin/ManageNotifications";
import ManageWastage from "./pages/admin/ManageWastage";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageReviews from "./pages/admin/ManageReviews";
import ManageSupport from "./pages/admin/ManageSupport";
import AdminSupportTicket from "./pages/admin/AdminSupportTicket";
import ManageSettings from "./pages/admin/ManageSettings";

const App = () => {
  return (
    <div>
      <Toaster position="top-center" />
      <Routes>
        {/* Admin Routes — no Navbar/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="restaurants" element={<ManageRestaurants />} />
          <Route path="restaurants/:id/menu" element={<ManageMenu />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="charities" element={<ManageCharities />} />
          <Route path="donations" element={<ManageDonations />} />
          <Route path="notifications" element={<ManageNotifications />} />
          <Route path="wastage" element={<ManageWastage />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="support" element={<ManageSupport />} />
          <Route path="support/:id" element={<AdminSupportTicket />} />
          <Route path="settings" element={<ManageSettings />} />
        </Route>

        {/* Merchant Routes — no Navbar/Footer */}
        <Route path="/merchant/register" element={<MerchantRegister />} />
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route index element={<MerchantDashboard />} />
          <Route path="menu" element={<MerchantMenu />} />
          <Route path="donations" element={<MerchantDonations />} />
          <Route path="wastage" element={<MerchantWastage />} />
          <Route path="jobs" element={<MerchantJobs />} />
          <Route path="jobs/:id/applications" element={<MerchantApplications />} />
        </Route>

        {/* User Routes — with Navbar/Footer */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id/apply" element={<JobApply />} />
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/diet-plan" element={<DietPlanner />} />
                <Route path="/support" element={<Support />} />
                <Route path="/support/:id" element={<SupportTicket />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/orders/:id/track" element={<OrderTracking />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
