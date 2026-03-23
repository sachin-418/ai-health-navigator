import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Image as ImageIcon, X, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import EmergencyButton from "@/components/EmergencyButton";
import type { ChatMessage } from "@/store/appStore";

const MOCK_RESPONSES = [
  "Based on the symptoms you've described, this could indicate a mild viral infection. Common symptoms include fever, body ache, and fatigue.",
  "I understand you're experiencing skin irritation. This could be related to a fungal infection or allergic reaction. Uploading an image would help me provide a more accurate assessment.",
  "Thank you for sharing. The symptoms suggest a possible respiratory condition. I'd recommend getting a proper check-up. Would you like to proceed with a full health assessment?",
  "Based on the information provided, I can see some concerning patterns. Let me analyze this further. I recommend proceeding to the check-up for a detailed health score and diagnosis.",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const { chatMessages, addChatMessage, patientProfile } = useAppContext();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = (content: string, type: "text" | "voice" | "image" = "text", imageUrl?: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      type,
      imageUrl,
      timestamp: new Date(),
    };
    addChatMessage(userMsg);

    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        type: "text",
        timestamp: new Date(),
      };
      addChatMessage(aiMsg);
      scrollToBottom();
    }, 1200);

    setInput("");
    setUploadedImage(null);
    scrollToBottom();
  };

  const handleSend = () => {
    if (!input.trim() && !uploadedImage) return;
    if (uploadedImage) {
      sendMessage(input || "Please analyze this image", "image", uploadedImage);
    } else {
      sendMessage(input);
    }
  };

  const handleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      sendMessage("I have been experiencing headache and mild fever for 2 days", "voice");
    } else {
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-2xl">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {chatMessages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI Health Assistant</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Tell me about your health condition via text, voice, or upload an image. I'll provide an initial assessment.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground"
                    : "glass-card"
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Upload" className="rounded-lg mb-2 max-h-48 w-auto" />
                  )}
                  {msg.type === "voice" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Mic className="h-3 w-3" />
                      <span className="text-xs opacity-75">Voice message</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Check-up button */}
        {chatMessages.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-3 flex justify-center">
            <button onClick={() => navigate("/checkup")}
              className="gradient-success text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
              🩺 Get Check-up Report
            </button>
          </motion.div>
        )}

        {/* Voice recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-3 py-4">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div key={i} className="w-1 bg-destructive rounded-full"
                    animate={{ height: [8, 24, 8] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
              <span className="text-sm text-destructive font-medium">Listening...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image preview */}
        {uploadedImage && (
          <div className="relative inline-block mb-2">
            <img src={uploadedImage} alt="Preview" className="h-20 rounded-lg border border-border" />
            <button onClick={() => setUploadedImage(null)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="glass-card p-3 flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-lg hover:bg-muted transition-colors">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          <input
            type="text"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
          />

          <button onClick={handleVoice}
            className={`p-2.5 rounded-lg transition-colors ${isRecording ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"}`}>
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button onClick={handleSend}
            className="gradient-primary p-2.5 rounded-lg text-primary-foreground">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      <EmergencyButton />
    </div>
  );
}
