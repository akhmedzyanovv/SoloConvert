import React, { useEffect, useRef, useState } from 'react';
import { minProgressGap } from './constants';

interface ProgressBarProps {
    stateRef: React.RefObject<{
        start: number;
        end: number;
        duration: number;
    }>;
    handleVideoProgressChange: (progress: number) => void;
    handleStartChange: (start: number) => void;
    handleEndChange: (end: number) => void;
    currentTime: number;
    duration: number;
    start: number;
    end: number;
}

function ProgressBar({
    stateRef,
    handleVideoProgressChange,
    handleStartChange,
    handleEndChange,
    currentTime,
    duration,
    start,
    end
}: ProgressBarProps) {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!progressBarRef.current) return;
            const { start, end, duration } = stateRef.current;
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const time = Math.max(0, Math.min(1, pos)) * duration;

            if (isDragging === 'start') {
                const newStart = Math.min(time, end - minProgressGap);
                const clampedStart = Math.max(0, newStart);
                handleStartChange(clampedStart);
            } else {
                const newEnd = Math.max(time, start + minProgressGap);
                const clampedEnd = Math.min(duration, newEnd);
                handleEndChange(clampedEnd);
            }
        };

        const handlePointerUp = () => {
            setIsDragging(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    const handlePointerDown = (
        e: React.PointerEvent,
        type: 'start' | 'end'
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(type);
    };

    return (
        <div
            ref={progressBarRef}
            className="group relative h-2 w-full cursor-pointer"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleVideoProgressChange(pos);
            }}
        >
            <progress
                value={currentTime}
                max={duration || 1}
                className="absolute h-full w-full
                    [&::-webkit-progress-bar]:bg-secondary
                    [&::-webkit-progress-value]:bg-primary/50
                    [&::-moz-progress-bar]:bg-primary/50"
            />

            <div
                className="pointer-events-none absolute top-0 h-full border-x-2
                    border-green-500 bg-green-500/30"
                style={{
                    left: `${(start / duration) * 100}%`,
                    width: `${((end - start) / duration) * 100}%`
                }}
            />

            {/* Start Handle */}
            <div
                className="absolute top-0 z-10 h-full w-4 -translate-x-1/2
                    cursor-ew-resize select-none touch-none flex items-center
                    justify-center"
                style={{ left: `${(start / (duration || 1)) * 100}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'start')}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="h-4 w-4 rounded-full border-2 border-primary
                        bg-background shadow-sm"
                />
            </div>

            {/* End Handle */}
            <div
                className="absolute top-0 z-10 h-full w-4 -translate-x-1/2
                    cursor-ew-resize select-none touch-none flex items-center
                    justify-center"
                style={{ left: `${(end / (duration || 1)) * 100}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'end')}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="h-4 w-4 rounded-full border-2 border-primary
                        bg-background shadow-sm"
                />
            </div>
        </div>
    );
}

export default ProgressBar;
