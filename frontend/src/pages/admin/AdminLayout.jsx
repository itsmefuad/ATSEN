import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
