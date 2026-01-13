import { useEffect, useRef, useState } from 'react';
import ProgressBar from './ProgressBar';
import Controls from './Controls';
import { minProgressGap } from './constants';

interface VideoPlayerProps {
    src: string;
    onTrimChange: (range: { start: number; end: number }) => void;
}

function VideoPlayer({ src, onTrimChange }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);

    const stateRef = useRef({ start, end, duration });

    useEffect(() => {
        stateRef.current = { start, end, duration };
    }, [start, end, duration]);

    // Fix for WebKit bug https://bugs.webkit.org/show_bug.cgi?id=197608
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setDuration(dur);
            setEnd(dur);
            onTrimChange?.({ start: 0, end: dur });
        }
    };

    const handleVideoProgressChange = (progress: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = progress * duration;
        }
    };

    const handleStartChange = (newStart: number) => {
        setStart(newStart);
        onTrimChange({
            start: newStart,
            end
        });
        setCurrentTime(newStart);
        if (videoRef.current) {
            videoRef.current.currentTime = newStart;
        }
    };

    const handleEndChange = (newEnd: number) => {
        setEnd(newEnd);
        onTrimChange({
            start,
            end: newEnd
        });
        setCurrentTime(newEnd);
        if (videoRef.current) {
            videoRef.current.currentTime = newEnd;
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
                if (
                    currentTime + minProgressGap >= end ||
                    currentTime < start
                ) {
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
                <ProgressBar
                    stateRef={stateRef}
                    handleVideoProgressChange={handleVideoProgressChange}
                    handleStartChange={handleStartChange}
                    handleEndChange={handleEndChange}
                    currentTime={currentTime}
                    duration={duration}
                    start={start}
                    end={end}
                />
                <Controls
                    handlePlay={togglePlay}
                    handleReset={handleReset}
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                />
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
