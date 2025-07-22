import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <p>&copy; {new Date().getFullYear()} AAASC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
