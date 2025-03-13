import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const AddAdminUser = () => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log("Admin user created:", userCredential.user);
      alert("Admin user created successfully!");
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      console.error("Error creating admin user:", error);
      alert("Error creating admin user: " + error.message);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-4 text-slate-100 flex items-center">
        Add Admin User
      </h3>
      <form onSubmit={handleAddAdmin} className="bg-gray-700 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="p-2 bg-gray-600 text-slate-100 rounded-lg focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Add Admin
        </button>
      </form>
    </div>
  );
};

export default AddAdminUser;