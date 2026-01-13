import React, { useRef, useEffect } from 'react';

const AudioVisualizer = ({ isActive }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = 300;
        let height = canvas.height = 100;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            if (!isActive) return;

            const time = Date.now() / 300;
            ctx.fillStyle = '#38bdf8';

            const bars = 20;
            const barWidth = width / bars;

            for (let i = 0; i < bars; i++) {
                const h = Math.abs(Math.sin(time + i * 0.5)) * (height * 0.8);
                const x = i * barWidth;
                const y = (height - h) / 2;

                ctx.fillRect(x + 2, y, barWidth - 4, h);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        if (isActive) {
            draw();
        } else {
            ctx.clearRect(0, 0, width, height);
            // Draw static line
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, height / 2 - 1, width, 2);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive]);

    return (
        <canvas ref={canvasRef} className="w-full max-w-[300px] h-24" />
    );
};

export default AudioVisualizer;
