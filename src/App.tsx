//  React import with useState hook
import { useState } from "react";

//  Import the Editor component
import Editor from "./components/editor";

//  Main App component (React.FC = React Functional Component)
const App: React.FC = () => {
  //  State to store the entered username
  const [username, setUsername] = useState<string>("");

  //  State to track if the form is submitted (i.e., user has joined)
  const [submitted, setSubmitted] = useState(false);

  //  Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    if (username.trim()) {
      setSubmitted(true); // Only proceed if username is not empty
    }
  };

  return (
    //  Full-screen background with gradient and center alignment
    <div className="h-screen flex items-center justify-center p-6 bg-gradient-to-r from-purple-500 to-purple-800">
      {!submitted ? (
        //  Form to enter username
        <form onSubmit={handleSubmit} className="space-y-4">
          {/*  Header text */}
          <h1 className="text-4xl font-medium font-serif text-center">
            Collaborative Editor
          </h1>

          {/*  Username input section */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-900 text-2xl font-medium">
              Enter your username:
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 👂 Update username state
              className="border-2 focus:border-black p-2 rounded-md w-64 outline-none transition duration-300"
            />
          </div>

          {/*  Join button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-gray-800 text-white px-5 py-3 font-semibold rounded-lg"
            >
              Join
            </button>
          </div>
        </form>
      ) : (
        //  Once submitted, show the collaborative editor
        <Editor username={username} />
      )}
    </div>
  );
};

export default App; //  Export the App component as default
