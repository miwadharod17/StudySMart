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
import Marketplace from "./StudentMarketplace";
import MyItems from "./StudentMyItems";
import Orders from "./StudentOrders";
import Forum from "./StudentForum";
import ForumPostDetail from "./StudentForumPostDetail";
import AddItem from "./StudentAddItem";
import EditItem from "./StudentEditItem";
import Cart from "./StudentCart";

// Admin Authentication
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";

// Admin Dashboard
import AdminDashboard from "./AdminDashboard";
import ForumComments from "./AdminForumComments";
import ForumPosts from "./AdminForumPosts";
import MarketItemDetail from "./AdminMarketItemDetail";
import MarketItems from "./AdminMarketItems";
import MarketTransactionDetail from "./AdminMarketTransactionDetail";
import MarketTransactions from "./AdminMarketTransactions";
import MarketUserForm from "./AdminMarketUserForm";
import MarketUsers from "./AdminMarketUsers";

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

        {/* Student Dashboard Layout Wrapping Each Feature */}
      <Route path="/student" element={<DashboardLayout />}>
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="myitems" element={<MyItems />} />
      <Route path="cart" element={<Cart />} />
      <Route path="orders" element={<Orders />} />
      <Route path="forum" element={<Forum />} />
      <Route path="forum/:postId" element={<ForumPostDetail />} />
      <Route path="additem" element={<AddItem />} />
      <Route path="edititem/:itemId" element={<EditItem />} />
      {/* ❌ Remove the redirect line below */}
      {/* <Route index element={<Navigate to="marketplace" />} /> */}
    </Route>


        {/* Admin Authentication */}
        <Route path="/Adminlogin" element={<AdminLogin />} />
        <Route path="/Adminregister" element={<AdminRegister />} />

        {/* Admin Dashboard */}
        <Route path="/Admindashboard" element={<AdminDashboard />}>
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
