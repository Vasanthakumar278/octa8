import React, { useState, useEffect, useRef } from 'react';
import AudioVisualizer from '../components/AudioVisualizer';
import Scorecard from '../components/Scorecard';
import ChatBubble from '../components/ChatBubble';

import { useSpeech } from '../hooks/useSpeech';
import { parseScorecard } from '../utils/scorecardParser';
import { useAuth } from '../context/AuthContext';

const InterviewPage = ({ initialData, onEnd }) => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [scorecardData, setScorecardData] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [inputText, setInputText] = useState(''); // Text input state
    const [isReviewing, setIsReviewing] = useState(false); // New state for review mode
    const { token } = useAuth();

    const { isListening, transcript, startListening, stopListening, isSpeaking, speak, cancelSpeech } = useSpeech();

    // To handle the final transcript when stopping
    const transcriptRef = useRef('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiThinking]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const [currentAiMessage, setCurrentAiMessage] = useState('');

    useEffect(() => {
        const loadSession = async () => {
            if (initialData?.resume && initialData?.sessionId) {
                try {
                    const res = await fetch(`http://localhost:3000/api/session/${initialData.sessionId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();

                    if (data.history) {
                        setMessages(data.history);
                        // If it's mentor mode, maybe don't speak the last message automatically on load?
                        // Or maybe just leave it silent on resume.
                    }
                } catch (err) {
                    console.error("Failed to load session history", err);
                    setError("Could not load previous session.");
                }
            } else if (initialData?.message) {
                // New Session Init
                const aiText = initialData.message.reply || initialData.message.text || initialData.message.response || (typeof initialData.message === 'string' ? initialData.message : "Welcome. Let's start.");
                setCurrentAiMessage(aiText);
                // Only speak if NOT in mentor mode
                if (!initialData.mode || initialData.mode === 'interview') {
                    speak(aiText);
                }
            }
        };

        loadSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text }]);
    };

    const handleMicToggle = () => {
        // CASE 1: SENDING (User clicked ➤)
        if (isReviewing) {
            handleSend(transcriptRef.current);
            setIsReviewing(false);
            return;
        }

        // CASE 2: STOPPING (User clicked ⏹)
        if (isListening) {
            stopListening();
            // Do NOT auto-send. Enter review mode.
            setIsReviewing(true);
        }
        // CASE 3: STARTING (User clicked 🎙)
        else {
            cancelSpeech(); // Stop AI from talking if interrupting
            startListening();
        }
    };

    const handleSend = async (text) => {
        if (!text.trim()) return;

        addMessage('user', text);
        setCurrentAiMessage('');
        setIsAiThinking(true);

        const sessionId = initialData?.sessionId; // Get session ID from init data
        const currentMode = initialData?.mode || 'interview';

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text,
                    history: messages, // sending history context
                    sessionId: sessionId,
                    mode: currentMode // Send mode to backend for robustness
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.details || 'Failed to get response';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const aiReply = data.reply || data.message || data.response || "I couldn't generate a response. Please try again.";
            console.log("AI REPLY RAW:", aiReply); // Debugging line

            // Check for Scorecard (Flexible detection)
            if (/\[?SCORECARD\]?/i.test(aiReply) || aiReply.includes('Technical Score:')) {
                const parsed = parseScorecard(aiReply);
                setScorecardData(parsed);
            } else {
                setCurrentAiMessage(aiReply);
                addMessage('ai', aiReply);

                // Only speak if NOT in mentor mode
                if (!initialData?.mode || initialData?.mode === 'interview') {
                    speak(aiReply);
                }
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Connection error');
        } finally {
            setIsAiThinking(false);
        }
    };

    const mode = initialData?.mode || 'interview';
    const isMentor = mode === 'mentor';

    if (scorecardData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-ai-dark flex flex-col items-center justify-center p-4 transition-colors duration-500">
                <Scorecard data={scorecardData} onRestart={onEnd} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-ai-dark flex flex-col p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>

            <header className="flex justify-between items-center mb-6 z-10 w-full max-w-5xl mx-auto">
                <h2 className="text-xl font-bold text-slate-800 dark:text-gray-200 transition-colors">
                    {isMentor ? 'OCTA8 Career Mentor' : 'OCTA8 Interview Agent'}
                </h2>
                <button
                    onClick={() => isMentor ? onEnd() : handleSend('finish')}
                    disabled={isAiThinking || isSpeaking}
                    className="text-sm px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
                >
                    {isMentor ? 'End Session' : 'Finish Interview'}
                </button>
            </header>

            {/* Main Visual Area */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 w-full max-w-4xl mx-auto">

                {/* Avatar / Visualizer */}
                <div className="relative">
                    <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 border-2
                ${isSpeaking
                            ? 'bg-ai-accent/10 border-ai-accent shadow-[0_0_60px_rgba(56,189,248,0.4)] scale-105'
                            : 'bg-white dark:bg-ai-surface border-slate-200 dark:border-gray-700'}
            `}>
                        <div className="text-6xl filter drop-shadow-md">
                            {isSpeaking ? '🤖' : isAiThinking ? '💭' : '🐙'}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-max">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300
                    ${isSpeaking ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' :
                                isAiThinking ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 animate-pulse' :
                                    isListening ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 animate-pulse' :
                                        'bg-slate-100 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-500'}
                `}>
                            {isSpeaking ? (isMentor ? 'Mentor Speaking' : 'OCTA8 Speaking') :
                                isAiThinking ? (isMentor ? 'Mentor Thinking...' : 'OCTA8 Thinking...') :
                                    isListening ? 'Listening...' :
                                        (isMentor ? 'Mentor Ready' : 'OCTA8 Ready')}
                        </span>
                    </div>
                </div>

                {/* MENTOR MODE: Chat Interface */}
                {isMentor ? (
                    <div className="flex-1 w-full max-w-6xl bg-white/60 dark:bg-ai-surface/40 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-gray-700/50 flex flex-col overflow-hidden mb-6 shadow-2xl transition-colors">

                        {/* Scrollable Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            {messages.length === 0 && (
                                <div className="text-slate-400 dark:text-gray-500 text-center mt-20 italic">
                                    <p className="mb-2 text-4xl">👋</p>
                                    <p>Say "Hi" to start your mentorship session...</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <ChatBubble key={idx} message={msg} />
                            ))}
                            {isAiThinking && (
                                <div className="flex w-full justify-start mb-4">
                                    <div className="bg-white dark:bg-ai-surface border border-slate-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-5 py-3 shadow-md flex space-x-2 items-center">
                                        <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-400 dark:bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Integrated Chat Input */}
                        <div className="p-4 bg-white/80 dark:bg-ai-surface/60 border-t border-slate-200 dark:border-gray-700/50 transition-colors">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); setInputText(''); }}
                                className="w-full flex space-x-3"
                            >
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your message..."
                                    disabled={isAiThinking}
                                    className="flex-1 bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-ai-accent focus:ring-1 focus:ring-ai-accent transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isAiThinking}
                                    className="bg-ai-accent text-white dark:text-ai-dark font-bold px-5 py-3 rounded-xl hover:bg-cyan-400 dark:hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                                >
                                    <span className="text-xl">➤</span>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* INTERVIEW MODE: Visualizer & Subtitles */
                    <>
                        {/* AI Text Display (Subtitles) */}
                        <div className="max-w-3xl w-full bg-ai-surface/60 backdrop-blur-md p-8 rounded-3xl border border-gray-700/50 min-h-[180px] flex items-center justify-center text-center shadow-2xl">
                            {isAiThinking ? (
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-ai-accent rounded-full animate-bounce"></div>
                                    <div className="w-3 h-3 bg-ai-accent rounded-full animate-bounce delay-100"></div>
                                    <div className="w-3 h-3 bg-ai-accent rounded-full animate-bounce delay-200"></div>
                                </div>
                            ) : (
                                <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-medium transition-opacity duration-300 ease-in-out">
                                    {currentAiMessage || (isListening ? "Listening..." : "Waiting for your response...")}
                                </p>
                            )}
                        </div>

                        {/* Audio Visualizer */}
                        <div className="h-20 w-full flex items-center justify-center">
                            <AudioVisualizer isActive={isSpeaking || isListening} />
                        </div>

                        {/* Current Transcript (Subtitles style) */}
                        <div className="h-16 w-full text-center px-4 max-w-2xl flex items-center justify-center">
                            {(isListening || isReviewing) && (
                                <p className="text-lg text-gray-400 italic animate-fade-in">
                                    "{transcript}"
                                </p>
                            )}
                        </div>
                    </>
                )}

            </div>

            {/* Controls (Only for Interview Mode) */}
            {!isMentor && (
                <div className="flex justify-center items-center py-8 z-10 space-x-6">
                    {/* Retry / Cancel Button (Visible only when Reviewing) */}
                    {isReviewing && (
                        <button
                            onClick={() => {
                                setIsReviewing(false);
                            }}
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-600 transition-all shadow-lg"
                            title="Retry Recording"
                        >
                            ❌
                        </button>
                    )}

                    {/* Main Mic / Stop / Send Button */}
                    <button
                        onClick={handleMicToggle}
                        disabled={isAiThinking || isSpeaking}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isReviewing
                                ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.6)]' // Send Mode
                                : isListening
                                    ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]' // Stop Mode
                                    : 'bg-ai-surface border-2 border-ai-accent text-ai-accent hover:bg-ai-accent hover:text-ai-dark shadow-lg'} // Record Mode
                `}
                    >
                        {isReviewing ? '➤' : isListening ? '⏹' : '🎙'}
                    </button>

                    {/* Hint Text */}
                    {isReviewing && (
                        <div className="absolute bottom-2 text-sm text-gray-500 dark:text-gray-400 animate-slide-up">
                            Press ➤ to Send or ❌ to Retry
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm animate-fade-in">
                    {error}
                </div>
            )}
        </div>
    );
};

export default InterviewPage;
