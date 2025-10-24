import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Core Layouts
import Layout from "./components/Layout";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Home
import Home from "./Home";

// Student Authentication
import StudentLogin from "./StudentLogin";
import StudentRegister from "./StudentRegister";

// Student Dashboard
import DashboardLayout from "./StudentDashboardLayout";
import AddItem from "./student/AddItem";
import EditItem from "./student/EditItem";
import Forum from "./student/Forum";
import ForumPostDetail from "./student/ForumPostDetail";
import Marketplace from "./student/Marketplace";
import MyItems from "./student/MyItems";
import Orders from "./student/Orders";

// Admin Authentication
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";

// Admin Dashboard
import AdminDashboard from "./AdminDashboard";
import ForumComments from "./admin/ForumComments";
import ForumPosts from "./admin/ForumPosts";
import MarketItemDetail from "./admin/MarketItemDetail";
import MarketItems from "./admin/MarketItems";
import MarketTransactionDetail from "./admin/MarketTransactionDetail";
import MarketTransactions from "./admin/MarketTransactions";
import MarketUserForm from "./admin/MarketUserForm";
import MarketUsers from "./admin/MarketUsers";

// Vendor Authentication
import VendorLogin from "./VendorLogin";
import VendorRegister from "./VendorRegister";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Student Authentication */}
        <Route path="/StudentLogin" element={<StudentLogin />} />
        <Route path="/StudentRegister" element={<StudentRegister />} />

        {/* Student Dashboard */}
        <Route path="/student" element={<DashboardLayout />}>
          <Route index element={<Navigate to="Marketplace" />} />
          <Route path="AddItem" element={<AddItem />} />
          <Route path="edit-item/:itemId" element={<EditItem />} />
          <Route path="MyItems" element={<MyItems />} />
          <Route path="Orders" element={<Orders />} />
          <Route path="Marketplace" element={<Marketplace />} />
          <Route path="Forum" element={<Forum />} />
          <Route path="Forum/:postId" element={<ForumPostDetail />} />
        </Route>

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route index element={<Navigate to="users" />} />
          <Route path="users" element={<MarketUsers />} />
          <Route path="users/add" element={<MarketUserForm />} />
          <Route path="users/edit/:userId" element={<MarketUserForm />} />
          <Route path="items" element={<MarketItems />} />
          <Route path="items/:itemId" element={<MarketItemDetail />} />
          <Route path="transactions" element={<MarketTransactions />} />
          <Route path="transactions/:orderId" element={<MarketTransactionDetail />} />
          <Route path="forum/posts" element={<ForumPosts />} />
          <Route path="forum/comments" element={<ForumComments />} />
        </Route>

        {/* Vendor Authentication */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
