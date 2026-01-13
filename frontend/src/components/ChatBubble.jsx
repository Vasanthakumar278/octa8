import React from 'react';

const ChatBubble = ({ sender, text, message }) => {
    const msgSender = sender || message?.sender;
    const msgText = text || message?.text;
    const isUser = msgSender === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in`}>
            <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-lg transition-colors ${isUser
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'glass-effect text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700/50'
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msgText}
                    </p>
                </div>
                <div className={`text-xs text-slate-500 mt-1.5 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? 'You' : 'OCTA8'}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
