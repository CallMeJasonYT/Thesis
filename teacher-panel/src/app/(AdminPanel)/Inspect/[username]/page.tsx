"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Screenshot from "@/components/Screenshot";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useNotification } from "@/contexts/NotificationContext";

const InspectPage = () => {
  const params = useParams();
  const username = params.username as string;
  const [hint, setHint] = useState("");
  const { sendMessage } = useWebSocket();
  const { removeNotification } = useNotification();
  const router = useRouter();

  const handleSendMessage = () => {
    if (!hint.trim()) {
      alert("Hint message cannot be empty!");
      return;
    } else {
      sendMessage({
        type: "SendHint",
        username: username,
        message: hint,
      });
    }

    setHint("");
  };

  const handleDismiss = () => {
    sendMessage({
      type: "DismissNotification",
      username: username,
    });

    removeNotification(username);

    router.push("/");
  };

  return (
    <div className="container mx-auto p-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-left">
          Player Inspection
        </h1>
        <p className="text-zinc-400 mt-2">
          View player activity and provide assistance
        </p>
      </header>

      <div className="bg-neutral shadow-lg rounded-lg border p-6 w-full mx-auto max-w-3xl">
        <p className="font-bold mb-4 flex items-center gap-2">
          Currently viewing:
          <span className="text-primary">{username}</span>
        </p>

        <Screenshot username={username} />

        <div className="mt-6">
          <label className="font-medium mb-2">💡 Enter a hint message:</label>
          <textarea
            className="w-full p-3 rounded-lg focus:ring-2 border focus:ring-primary focus:outline-hidden transition-all"
            placeholder="Type a hint message for the player..."
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            rows={3}
          ></textarea>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-primary font-semibold text-white rounded-md hover:bg-green-600 transition-all cursor-pointer"
            onClick={handleSendMessage}
          >
            Send Message
          </button>

          <button
            className="px-4 py-2 bg-secondary font-semibold text-white rounded-md hover:bg-red-600 transition-all cursor-pointer"
            onClick={handleDismiss}
          >
            Dismiss Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectPage;
