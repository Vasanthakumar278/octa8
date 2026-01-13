import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LandingPage = ({ onStart }) => {
    const [mode, setMode] = useState('interview');
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const { token, logout } = useAuth(); // Get logout function

    // Fetch sessions on mount
    React.useEffect(() => {
        if (token) {
            fetch('http://localhost:3000/api/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        logout(); // Auto-logout if session is invalid on load
                        return [];
                    }
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) setSessions(data);
                })
                .catch(err => console.error(err));
        }
    }, [token, logout]);

    const handleResume = (session) => {
        onStart({
            sessionId: session.id,
            mode: session.mode,
            resume: true
        });
    };

    const handleDelete = async (e, sessionId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this session history?')) return;

        setDeletingId(sessionId);
        try {
            const url = `http://localhost:3000/api/session/${sessionId}`;
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert('Failed to delete session: ' + (errorData.error || res.statusText));
            }
        } catch (err) {
            console.error('❌ Network error deleting session:', err);
            alert('Network error. Is the backend running?');
        } finally {
            setDeletingId(null);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a resume.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('mode', mode);

        try {
            const response = await fetch('http://localhost:3000/api/init', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Combine error and details for maximum context
                const combinedError = errorData.details
                    ? `${errorData.error}: ${errorData.details}`
                    : (errorData.error || 'Failed to start session');

                if (response.status === 403 || combinedError.toLowerCase().includes('invalid token')) {
                    logout();
                    return;
                }
                throw new Error(combinedError);
            }

            const data = await response.json();
            onStart({ ...data, mode });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to connect to the backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-6 transition-colors duration-500">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-5xl font-bold mb-3 text-gradient">
                        OCTA8 Agent
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Your AI-powered interview and career mentor</p>
                </div>

                {/* Main Card */}
                <div className="glass-effect-strong p-8 rounded-2xl shadow-2xl animate-fade-in transition-all">
                    {/* Recent Sessions */}
                    {sessions.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <span>📋</span> Recent Sessions
                            </h3>
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleResume(session)}
                                        className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700/60 p-4 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/50 shadow-sm transition-all duration-300 flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {session.mode === 'mentor' ? '🧠' : '🎙️'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                    {session.mode === 'mentor' ? 'Career Mentor' : 'Interview Session'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(session.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                disabled={deletingId === session.id}
                                                className={`text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg disabled:opacity-50`}
                                                title="Delete History"
                                            >
                                                {deletingId === session.id ? (
                                                    <span className="animate-spin inline-block">⏳</span>
                                                ) : (
                                                    '🗑️'
                                                )}
                                            </button>
                                            <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-700/50 my-6"></div>
                        </div>
                    )}

                    <p className="text-slate-400 text-center mb-6 text-sm">
                        {sessions.length > 0 ? 'Or start a new session below' : 'Get started by uploading your resume'}
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl mb-6 text-sm animate-slide-in">
                            <div className="flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mode Selection */}
                        <div className="bg-slate-800/30 p-1.5 rounded-xl flex gap-2">
                            <button
                                type="button"
                                onClick={() => setMode('interview')}
                                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === 'interview'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🎙️ Interview Mode
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('mentor')}
                                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${mode === 'mentor'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    🧠 Career Mentor
                                </span>
                            </button>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
                                Resume (PDF)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="flex items-center justify-center gap-3 w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-600/50 hover:border-cyan-500/50 rounded-xl p-6 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md dark:shadow-none"
                                >
                                    <span className="text-3xl">📄</span>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {file ? file.name : 'Click to upload resume'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {file ? 'Click to change file' : 'PDF format only'}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
                                Job Description (Optional)
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600/50 rounded-xl p-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all shadow-sm"
                                placeholder="Paste the job description here to get tailored questions..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${loading
                                ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                                : mode === 'interview'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-glow hover:shadow-glow-strong transform hover:scale-[1.02]'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Starting Session...
                                </span>
                            ) : (
                                `Start ${mode === 'interview' ? 'Interview' : 'Mentorship'}`
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
