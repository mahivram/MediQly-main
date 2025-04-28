import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image } from "lucide-react";
import axios from "axios";

const ChatBubble = ({ message }) => {
  return (
    <div
      className={`flex items-end gap-2 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.sender === "bot" && (
        <Image
          //   src="/bot-avatar.png"
          //   alt="Bot"
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div
        className={`relative p-3 max-w-[75%] text-sm rounded-xl shadow-md ${
          message.sender === "user"
            ? "bg-green-500 text-white self-end ml-auto"
            : "bg-gray-200 text-black self-start mr-auto"
        }`}
      >
        {message.text}
        <span className="absolute text-xs text-gray-500 bottom-1 right-2">
          {message.sender === "user" ? "✔✔" : ""}
        </span>
      </div>
      {message.sender === "user" && (
        <Image
          //   src="/user-avatar.png"
          //   alt="User"
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
    </div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("/api/messages");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      await axios.post("/api/messages", newMessage);
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-100 p-4 md:p-6">
      <Card className="w-full max-w-lg mx-auto flex flex-col h-full shadow-lg bg-white rounded-lg overflow-hidden">
        <div className="bg-green-500 text-white p-4 font-bold text-center">
          Chat
        </div>
        <CardContent className="flex flex-col flex-grow p-4 overflow-hidden">
          <ScrollArea className="flex flex-col gap-4 flex-grow overflow-y-auto p-2">
            {/* {messages.map((msg, index) => (
              <ChatBubble key={index} message={msg} />
            ))} */}
          </ScrollArea>
        </CardContent>
        <div className="p-3 border-t flex gap-2 bg-white items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow rounded-full border-gray-300 px-4 py-2"
          />
          <Button
            onClick={sendMessage}
            className="rounded-full bg-green-500 hover:bg-green-600 p-3"
            variant="default"
          >
            <Send size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
