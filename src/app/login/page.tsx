import React from "react";
// Import the local background image
import backgroundImage from "@/assets/images/loginbg.png"; // Adjust the path based on your file structure relative to this component

export default function Page() {
  // Placeholder logo URL - replace with your actual logo path if local
  const logoImage = 'https://placehold.co/100x100/ffffff/000000?text=Logo'; // Example placeholder logo

  return (
    // The outer container fills the screen height and uses flexbox
    // to arrange its children horizontally.
    <div className="flex h-screen bg-gray-400">
      {/*
        The first inner div uses flex-grow and fills its parent's dimensions.
        Background image is added using inline style and Tailwind classes for positioning/sizing.
        The imported image is used directly in the style object.
      */}
      <div
        className="flex flex-col items-center justify-center flex-grow w-full h-full p-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImage.src}')` }} // Use the imported image variable
      >
        {/* Add an overlay div for better text readability on top of the image */}
        <div className="bg-black bg-opacity-50 p-6 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-gray-200 text-lg">To keep connected with us, please login or sign up.</p>
        </div>
      </div>
      {/*
        The second inner div contains the Sign Up form.
        It uses flex-grow and fills its parent's dimensions.
      */}
      <div className="flex flex-col items-center justify-center flex-grow w-full h-full bg-gray-300 p-8"> {/* Increased padding */}
        {/* Logo added above the heading */}
        <img src={logoImage} alt="Company Logo" className="mb-6 w-24 h-24 object-contain" /> {/* Placeholder logo */}

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up to Zatix</h2> {/* Added some basic text styling */}
        <form className="flex flex-col items-center w-full max-w-sm"> {/* Form container */}
          <div className="mb-4 w-full"> {/* Email input group */}
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              aria-label="Email" // Added for accessibility
            />
          </div>
          <div className="mb-6 w-full"> {/* Password input group */}
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="********"
              aria-label="Password" // Added for accessibility
            />
          </div>
          <button
            className="bg-[#002547] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="button" // Changed to type="button" for now, change to "submit" if implementing form submission
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
