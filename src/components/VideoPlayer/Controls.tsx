import { PauseIcon, PlayIcon, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface ControlsProps {
    handlePlay: () => void;
    handleReset: () => void;
    currentTime: number;
    duration: number;
    isPlaying: boolean;
}

function Controls({handlePlay, handleReset, currentTime, duration, isPlaying}: ControlsProps) {
    return (
        <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handlePlay}
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
    );
}

export default Controls;