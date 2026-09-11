import { useEffect, useState, useRef } from "react";
import { Bot, X } from "lucide-react";

// ... (keep everything from API_URL through showSuggestions exactly as it was — unchanged)

// Point these at your deployed chatbot backend — never hardcode localhost.
const API_URL = import.meta.env.VITE_CHAT_API_URL;
const WS_URL = import.meta.env.VITE_CHAT_WS_URL;

function ChatWidget() {
    const [messages, setMessages] = useState([]);
    const [menu, setMenu] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [stage, setStage] = useState(null);
    const [needsResume, setNeedsResume] = useState(false);
    const [jobOptions, setJobOptions] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const fileInputRef = useRef(null);
    const isOpenRef = useRef(isOpen);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    const sessionIdRef = useRef(
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
    );

    useEffect(() => {
        fetch(`${API_URL}/menu`)
            .then((response) => response.json())
            .then((data) => setMenu(data))
            .catch((error) => console.error("Failed to load menu:", error));
    }, []);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}/ws/${sessionIdRef.current}`);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = (error) => console.error("WebSocket error:", error);

        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (error) {
                console.error("Failed to parse WS message:", error);
                return;
            }

            setLoading(false);
            setStage(data.stage || null);
            setNeedsResume(Boolean(data.needs_resume));
            setJobOptions(data.job_options || []);

            const sender = data.sender || "bot";
            setMessages((prev) => [...prev, { sender, text: data.text }]);

            if (!isOpenRef.current && sender === "bot") {
                setUnreadCount((count) => count + 1);
            }
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = (question) => {
        if (!question.trim() || loading) return;

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Still connecting — please try again in a moment." },
            ]);
            return;
        }

        setMessages((prev) => [...prev, { sender: "user", text: question }]);
        setInput("");
        setLoading(true);
        setJobOptions([]);

        wsRef.current.send(JSON.stringify({ text: question }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        const numericOnly = /^\d+$/.test(trimmed);
        if (numericOnly) {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(trimmed)) {
                setMessages((prev) => [
                    ...prev,
                    { sender: "bot", text: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9." },
                ]);
                return;
            }
        }
        sendMessage(input);
    };

    const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
    const MAX_FILE_SIZE_MB = 5;

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const ext = "." + file.name.split(".").pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Please attach a PDF or Word document (.pdf, .doc, .docx)." },
            ]);
            return;
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: `That file is too large — please keep it under ${MAX_FILE_SIZE_MB}MB.` },
            ]);
            return;
        }

        setUploading(true);
        setMessages((prev) => [...prev, { sender: "user", text: `📎 ${file.name}` }]);

        const formData = new FormData();
        formData.append("session_id", sessionIdRef.current);
        formData.append("file", file);

        try {
            const response = await fetch(`${API_URL}/api/upload-resume`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || "Upload failed");
            }

            setNeedsResume(false);
        } catch (error) {
            console.error("Resume upload error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Sorry, that upload didn't go through. Please try again." },
            ]);
        } finally {
            setUploading(false);
        }
    };

    const trimmedInput = input.trim();
    const isNumericInput = /^\d+$/.test(trimmedInput);
    const isValidMobile = !isNumericInput ? true : /^[6-9]\d{9}$/.test(trimmedInput);
    const showSuggestions = stage === "READY" && messages.length <= 4;
    return (
        <div className="fixed right-3 sm:right-6 top-[calc(50%+67px)] sm:top-[calc(50%+76px)] z-50">
            <div className="relative">
                {isOpen && (
                    <div className="absolute bottom-full right-0 mb-2 flex h-[600px] max-h-[calc(60vh-10px)] w-[92vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-[380px]">
                        {/* Header */}
                        <div className="flex items-center gap-3 bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 py-4">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
                                🎓
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="m-0 text-[15px] font-semibold text-white">School Assistant</h1>
                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/85">
                  <span
                      className={`inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                          connected ? "opacity-100" : "opacity-30"
                      }`}
                  ></span>
                                    {connected ? "Online" : "Connecting…"}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/30"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-neutral-50 px-3.5 py-4">
                            {messages.length === 0 && !loading && (
                                <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center text-neutral-400">
                                    <Bot size={32} className="text-indigo-400" />
                                    <p className="m-0 text-[13.5px] leading-relaxed">
                                        Hi there! Ask me anything about admissions, fees, or open positions.
                                    </p>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex max-w-[80%] flex-col gap-1.5 ${
                                            message.sender === "user" ? "items-end" : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                                message.sender === "user"
                                                    ? "rounded-br-md bg-gradient-to-br from-indigo-600 to-indigo-500 text-white"
                                                    : "rounded-bl-md border border-neutral-200 bg-white text-neutral-900"
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex w-full justify-start">
                                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-3.5 py-3">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:0.15s]"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:0.3s]"></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {showSuggestions && (
                            <div className="bg-neutral-50 px-3.5 pb-3">
                                <p className="mb-2 ml-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-neutral-400">
                                    Try asking
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {menu.slice(0, 6).map((item) => (
                                        <button
                                            key={item.question_id}
                                            onClick={() => sendMessage(item.question)}
                                            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-200"
                                        >
                                            {item.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Job opening options */}
                        {jobOptions.length > 0 && (
                            <div className="bg-neutral-50 px-3.5 pb-3">
                                <p className="mb-2 ml-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-neutral-400">
                                    Choose a role
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {jobOptions.map((title) => (
                                        <button
                                            key={title}
                                            onClick={() => sendMessage(title)}
                                            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-200"
                                        >
                                            {title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume attachment prompt */}
                        {needsResume && (
                            <div className="bg-neutral-50 px-3.5 pb-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileSelected}
                                />
                                <button
                                    type="button"
                                    onClick={handleAttachClick}
                                    disabled={uploading}
                                    className="w-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {uploading ? "Uploading…" : "📎 Attach your resume"}
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-neutral-100 bg-white p-3">
                            <input
                                type="text"
                                placeholder="Ask something..."
                                value={input}
                                onChange={(event) => {
                                    const val = event.target.value;
                                    if (/^\d*$/.test(val)) {
                                        // only digits entered — limit to 10
                                        setInput(val.slice(0, 10));
                                    } else {
                                        setInput(val);
                                    }
                                }}
                                disabled={loading}
                                className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-300 focus:bg-white disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim() || (isNumericInput && !isValidMobile)}
                                className="flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 px-4.5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:bg-none disabled:opacity-100"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                )}

                {/* Floating launcher — fixed anchor point, never moves when panel opens */}
                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-label={isOpen ? "Close chat" : "Open chat"}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:scale-105 ${
                        isOpen ? "bg-neutral-900" : "bg-gradient-to-br from-indigo-600 to-indigo-500"
                    }`}
                >
                    {isOpen ? <X size={22} /> : <Bot size={24} />}
                    {!isOpen && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ChatWidget;