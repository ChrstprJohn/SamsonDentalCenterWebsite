import React from 'react';

export default function ChatLoading() {
    return (
        <div className="h-screen w-full bg-slate-950 flex justify-center overflow-hidden">
            <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-card border-x border-border">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="h-10 w-10 rounded-full bg-slate-800 animate-pulse" />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-slate-800/60 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`h-12 rounded-xl bg-slate-800/60 animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-border">
                    <div className="h-11 bg-slate-800 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
