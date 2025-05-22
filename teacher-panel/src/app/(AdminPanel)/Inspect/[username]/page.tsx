"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Screenshot from "@/components/Screenshot";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useNotification } from "@/contexts/NotificationContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="container mx-auto p-8 md:py-12"
    >
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
          <Button onClick={handleSendMessage}>Send Message</Button>

          <Button
            className="bg-secondary/70 hover:bg-secondary/90"
            onClick={handleDismiss}
          >
            Dismiss Notification
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InspectPage;
