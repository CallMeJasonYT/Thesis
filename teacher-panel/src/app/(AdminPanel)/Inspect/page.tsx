"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Screenshot from "@/components/Screenshot";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useNotification } from "@/contexts/NotificationContext";

const InspectPage = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
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
    <div className="space-y-4 text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl">
      <div className="flex items-center justify-center">
        <div className="bg-neutral shadow-lg rounded-lg p-6 w-full sm:w-[600px] md:w-[700px] lg:w-[900px] xl:w-[1200px]">
          <p className="font-bold mb-4 flex items-center gap-2">
            Inspection Page for
            <span className="text-primary">{username}</span>
          </p>

          <Screenshot />

          <div className="mt-6">
            <label className="block font-medium mb-2">
              💡 Enter a hint message:
            </label>
            <textarea
              className="w-full p-3 rounded-lg focus:ring-2 text-black focus:ring-primary focus:outline-none transition-all"
              placeholder="Type a hint message for the player..."
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              rows={3}
            ></textarea>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              className="px-4 py-2 bg-primary font-bold text-white rounded-md hover:bg-green-600 transition-all"
              onClick={handleSendMessage}
            >
              Send Message
            </button>

            <button
              className="px-4 py-2 bg-secondary font-bold text-white rounded-md hover:bg-red-600 transition-all"
              onClick={handleDismiss}
            >
              Dismiss Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectPage;
