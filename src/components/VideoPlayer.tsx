import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { PlayIcon, PauseIcon, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    onTrimChange?: (range: { start: number; end: number }) => void;
}

const minGap = 0.1;

function VideoPlayer({ src, onTrimChange }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

    const stateRef = useRef({ start, end, duration });

    useEffect(() => {
        stateRef.current = { start, end, duration };
    }, [start, end, duration]);

    useEffect(() => {
        setStart(0);
        setEnd(0);
        setCurrentTime(0);
        setIsPlaying(false);
    }, [src]);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!progressBarRef.current) return;
            const { start, end, duration } = stateRef.current;
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const time = Math.max(0, Math.min(1, pos)) * duration;

            if (isDragging === 'start') {
                const newStart = Math.min(time, end - minGap);
                const clampedStart = Math.max(0, newStart);
                setStart(clampedStart);
                onTrimChange?.({
                    start: clampedStart,
                    end
                });
                setCurrentTime(clampedStart);
                if (videoRef.current) {
                    videoRef.current.currentTime = clampedStart;
                }
            } else {
                const newEnd = Math.max(time, start + minGap);
                const clampedEnd = Math.min(duration, newEnd);
                setEnd(clampedEnd);
                onTrimChange?.({
                    start,
                    end: clampedEnd
                });
                setCurrentTime(clampedEnd);
                if (videoRef.current) {
                    videoRef.current.currentTime = clampedEnd;
                }
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
    }, [isDragging, onTrimChange]);

    const handlePointerDown = (
        e: React.PointerEvent,
        type: 'start' | 'end'
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(type);
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setDuration(dur);
            setEnd(dur);
            onTrimChange?.({ start: 0, end: dur });
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);

            if (videoRef.current.currentTime >= stateRef.current.end) {
                videoRef.current.pause();
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                if (currentTime + minGap >= end || currentTime < start) {
                    videoRef.current.currentTime = start;
                }
                videoRef.current.play();
            }
        }
    };

    const handleReset = () => {
        setStart(0);
        setCurrentTime(0);
        setEnd(duration);
        onTrimChange?.({ start: 0, end: duration });
    };

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="relative w-full h-full">
                <video
                    muted
                    playsInline
                    disablePictureInPicture={true}
                    controls={false}
                    ref={videoRef}
                    src={src}
                    className="absolute w-full h-full rounded-md bg-black"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>
            <div className="flex flex-col gap-1">
                <div
                    ref={progressBarRef}
                    className="group relative h-2 w-full cursor-pointer"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        if (videoRef.current) {
                            videoRef.current.currentTime = pos * duration;
                        }
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
                        className="pointer-events-none absolute top-0 h-full
                            border-x-2 border-green-500 bg-green-500/30"
                        style={{
                            left: `${(start / duration) * 100}%`,
                            width: `${((end - start) / duration) * 100}%`
                        }}
                    />

                    {/* Start Handle */}
                    <div
                        className="absolute top-0 z-10 h-full w-4
                            -translate-x-1/2 cursor-ew-resize select-none
                            touch-none flex items-center justify-center"
                        style={{ left: `${(start / (duration || 1)) * 100}%` }}
                        onPointerDown={(e) => handlePointerDown(e, 'start')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="h-4 w-4 rounded-full border-2
                                border-primary bg-background shadow-sm"
                        />
                    </div>

                    {/* End Handle */}
                    <div
                        className="absolute top-0 z-10 h-full w-4
                            -translate-x-1/2 cursor-ew-resize select-none
                            touch-none flex items-center justify-center"
                        style={{ left: `${(end / (duration || 1)) * 100}%` }}
                        onPointerDown={(e) => handlePointerDown(e, 'end')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="h-4 w-4 rounded-full border-2
                                border-primary bg-background shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <PauseIcon className="size-5" />
                            ) : (
                                <PlayIcon className="size-5" />
                            )}
                        </Button>
                        <span
                            className="text-sm font-mono text-muted-foreground"
                        >
                            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleReset}
                            title="Reset Trim"
                        >
                            <RotateCcw className="size-4" />
                        </Button>
                    </div>
                </div>
                <div
                    className="flex justify-between px-1 text-xs
                        text-muted-foreground"
                >
                    <span>Trim Start: {start.toFixed(1)}s</span>
                    <span>Trim End: {end.toFixed(1)}s</span>
                </div>
            </div>
        </div>
    );
}

export default VideoPlayer;
