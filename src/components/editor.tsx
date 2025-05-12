//  React hooks and refs
import { useEffect, useRef, useState } from "react";

//  WebRTC provider for peer-to-peer syncing
import { WebrtcProvider } from "y-webrtc";

//  Yjs document and collaborative structures
import * as Y from "yjs";

//  Binding Quill to Yjs shared text
import { QuillBinding } from "y-quill";

//  Quill rich text editor
import Quill from "quill";
import "quill/dist/quill.snow.css"; //  Import default Quill styling (Snow theme)

//  Define expected props for the Editor component
interface EditorProps {
  username: string; // 👤 The name of the current user
}

//  Functional component for the collaborative editor
const Editor: React.FC<EditorProps> = ({ username }) => {
  //  Reference to the editor container DOM element
  const editorRef = useRef<HTMLDivElement | null>(null);

  //  Reference to the Quill instance
  const quillInstance = useRef<Quill | null>(null);

  //  Ensure Quill is initialized only once
  const initializedRef = useRef(false);

  //  State to track list of online users (excluding current user)
  const [users, setUsers] = useState<{ name: string; color: string }[]>([]);

  //  Side-effect for setting up the collaborative editor on mount
  useEffect(() => {
    //  Exit if editor is already initialized or editor DOM is not available
    if (!editorRef.current || initializedRef.current) return;

    //  Clear previous content to avoid duplicate Quill editors on hot reload
    editorRef.current.innerHTML = "";

    //  Create a new div for Quill to mount into (inside the parent container)
    const container = document.createElement("div");
    editorRef.current.appendChild(container);

    //  Mark as initialized to prevent re-initialization
    initializedRef.current = true;

    //  Create a Yjs document that manages shared data
    const ydoc = new Y.Doc();

    //  Set up WebRTC-based real-time communication using a shared "room-id"
    const provider = new WebrtcProvider("room-id", ydoc);

    //  Get a shared text type (used to sync editor content)
    const ytext = ydoc.getText("quill");

    // Initialize Quill editor with toolbar options
    quillInstance.current = new Quill(container, {
      theme: "snow", //  Snow is the default light theme
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],       // Header dropdown (H1, H2, Normal)
          ["bold", "italic", "underline"],   // Text formatting options
          ["link", "image"],                 // Insert link and image
          [{ list: "ordered" }, { list: "bullet" }], // Ordered & unordered lists
          ["clean"],                         // Remove formatting
        ],
      },
    });

    //  Connect Yjs shared text with the Quill instance + awareness API
    new QuillBinding(ytext, quillInstance.current, provider.awareness);

    // Generate a random hex color for this user
    const userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    //  Set the local user's presence (name + color) in the awareness API
    provider.awareness.setLocalStateField("user", {
      name: username,
      color: userColor,
    });

    //  Function to update the list of online users (excluding self)
    const updateUsers = () => {
      // Get all awareness states (from all connected users)
      const states = Array.from(provider.awareness.getStates().values());

      // Extract and filter unique user info (excluding current user)
      const uniqueUsers = states
        .map((state: any) => state.user)
        .filter((user: any) => user?.name && user.name !== username) as {
          name: string;
          color: string;
        }[];

      //  Update state with filtered users
      setUsers(uniqueUsers);
    };

    //  Listen for awareness changes (user joins/leaves/updates)
    provider.awareness.on("change", updateUsers);

    //  Run once initially to populate the users list
    updateUsers();

    //  Cleanup function when component unmounts
    return () => {
      console.log("Cleaning up Quill editor and WebRTC provider");

      // Remove awareness event listener
      provider.awareness.off("change", updateUsers);

      // Destroy WebRTC provider connection
      provider.destroy();

      // Destroy the Yjs document
      ydoc.destroy();

      // Clear the Quill instance
      quillInstance.current = null;

      // Allow reinitialization on future mount
      initializedRef.current = false;
    };
  }, [username]); //  Dependency: re-run only if username changes

  return (
    <>
      {/*  Editor container wrapper with styling */}
      <div className="max-w-4xl mx-auto mt-4 p-4 bg-black rounded-lg shadow-xl">
        
        {/*  Header for online users section */}
        <h1 className="text-lg font-semibold mb-3 text-white">Online Users</h1>

        {/*  Show users if any are online */}
        {users.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 mb-2 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: user.color }} // 🎨 User's assigned color
              >
                {user.name}
              </div>
            ))}
          </div>
        ) : (
          //  No other users online yet
          <p className="text-sm mb-1 text-white">" No one else is online yet."</p>
        )}

        {/*  Actual Quill editor mount point */}
        <div
          className="h-120 w-200 overflow-hidden rounded-md sm:w-100 lg:w-200 bg-black text-white p-4 quill-container"
          ref={editorRef} //  Editor ref (target for Quill mounting)
        ></div>
      </div>
    </>
  );
};

export default Editor; //  Export component for use in the app
