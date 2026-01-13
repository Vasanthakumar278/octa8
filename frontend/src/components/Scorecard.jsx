import React from 'react';

const Scorecard = ({ data, onRestart }) => {
    const getPercentage = (scoreStr) => {
        if (!scoreStr) return 0;
        const match = scoreStr.match(/(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            return Math.min(Math.max(num * 10, 0), 100);
        }
        return 0;
    };

    const techPercent = getPercentage(data.technicalScore);
    const commPercent = getPercentage(data.communicationScore);

    return (
        <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-bold mb-2 text-gradient">
                    Interview Complete
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Here's your performance summary</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
                {/* Technical Score */}
                <div className="glass-effect p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">💻</span>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Technical Proficiency</h3>
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1.5 px-3 uppercase rounded-full text-cyan-900 bg-cyan-400">
                                Score
                            </span>
                            <span className="text-2xl font-bold text-cyan-400">
                                {data.technicalScore}
                            </span>
                        </div>
                        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                                style={{ width: `${techPercent}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out rounded-full"
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Communication Score */}
                <div className="glass-effect p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">💬</span>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Communication Skills</h3>
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1.5 px-3 uppercase rounded-full text-purple-900 bg-purple-400">
                                Score
                            </span>
                            <span className="text-2xl font-bold text-purple-400">
                                {data.communicationScore}
                            </span>
                        </div>
                        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                                style={{ width: `${commPercent}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out rounded-full"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Feedback */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-effect p-6 rounded-xl border border-green-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">✨</span>
                        <h4 className="text-lg font-bold text-green-400">Strengths</h4>
                    </div>
                    <ul className="space-y-3">
                        {data.strengths.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-effect p-6 rounded-xl border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📈</span>
                        <h4 className="text-lg font-bold text-orange-400">Areas for Improvement</h4>
                    </div>
                    <ul className="space-y-3">
                        {data.improvements.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Summary */}
            <div className="w-full glass-effect p-6 rounded-xl mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📝</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Summary</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{data.summary}"
                </p>
            </div>

            {/* Action Button */}
            <button
                onClick={onRestart}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl text-white font-bold shadow-glow hover:shadow-glow-strong transform transition-all duration-300 hover:scale-105"
            >
                Start New Interview
            </button>
        </div>
    );
};

export default Scorecard;
