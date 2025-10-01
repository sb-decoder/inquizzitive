import { useState } from "react";

export default function Signin({ onClose,onSigninSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);

    const userData = { name: "John Doe", email }; // example
    if (onSigninSuccess) onSigninSuccess(userData); // notify parent
    onClose(); // close modal
  };


 
  return (
    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-[90%] max-w-md relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
      >
        ✖
      </button>

      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Welcome Back 👋
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        Sign in to continue to{" "}
        <span className="font-semibold text-blue-600">Inquizzitive</span>
      </p>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="you@example.com"
          required
        />
      </div>

      {/* Password */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Submit */}
        <button
        type="submit"
        onClick={handleSubmit}
        className="w-full py-3 rounded-lg font-semibold text-white 
                   bg-gradient-to-r from-blue-500 to-indigo-500 
                   hover:from-blue-600 hover:to-indigo-600 
                   transition-all duration-300 shadow-lg"
      >
        Sign In
      </button>
    </div>
  );
}
