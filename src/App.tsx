import { useEffect, useState } from 'react';
import { useFFmpeg } from './hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { ProgressEvent } from '@ffmpeg/ffmpeg';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { ImageIcon } from 'lucide-react';
import type { FileRejection } from 'react-dropzone';
import { Spinner } from '@/components/ui/spinner';
import ActionPanel from '@/components/ActionPanel';
import VideoPlayer from '@/components/VideoPlayer';
import { Progress } from '@/components/ui/progress';

const fileSizeLimit50MB = 1024 * 1024 * 50;
const outputExtension = 'gif';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [trimRange, setTrimRange] = useState<{ start: number; end: number }>({
        start: 0,
        end: 0
    });

    const { ffmpeg, loaded, isLoading } = useFFmpeg();

    useEffect(() => {
        const progressHandler = ({ progress, time }: ProgressEvent) => {
            console.log(
                `${progress * 100} % (transcoded time: ${time / 1000000} s)`
            );
            setProgress(progress * 100);
        };

        ffmpeg.on('progress', progressHandler);

        return () => {
            ffmpeg.off('progress', progressHandler);
        };
    }, [ffmpeg, setProgress]);

    useEffect(() => {
        if (!file) {
            setFileUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setFileUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const maxFileSize = parseInt(
        import.meta.env.VITE_MAX_FILE_SIZE ?? fileSizeLimit50MB,
        10
    );
    const isConvertButtonDisabled = !file || isConverting;

    const fileExtension = file ? file.name.split('.').pop() : '';
    const inputFileName = file ? file.name : '';
    const outputFileName = `${inputFileName.split('.').slice(0, -1).join('.')}.${outputExtension}`;

    const handleFileChange = (file: File) => setFile(file);

    const transcode = async () => {
        try {
            if (!file) return;

            setGifUrl(null);
            setIsConverting(true);

            await ffmpeg.writeFile(
                `input.${fileExtension}`,
                await fetchFile(file)
            );

            const ffmpegArgs = ['-i', `input.${fileExtension}`];

            if (trimRange.end > trimRange.start) {
                ffmpegArgs.push('-ss', trimRange.start.toString());
                ffmpegArgs.push('-to', trimRange.end.toString());
            }

            ffmpegArgs.push('-vf', 'fps=15,scale=320:-1', 'output.gif');

            await ffmpeg.exec(ffmpegArgs);
            const data = await ffmpeg.readFile('output.gif');

            await ffmpeg.deleteFile(`input.${fileExtension}`);
            await ffmpeg.deleteFile('output.gif');

            const url = URL.createObjectURL(
                new Blob([data as BlobPart], { type: 'image/gif' })
            );
            setGifUrl(url);
        } catch (error) {
            console.error(error);
        } finally {
            setIsConverting(false);
        }
    };

    const handleFileReject = (fileRejections: FileRejection[]) =>
        fileRejections.forEach(({ errors }) => console.error(errors));

    const onReset = () => {
        setFile(null);
        setFileUrl(null);
        setGifUrl(null);
        setTrimRange({ start: 0, end: 0 });
    };

    return (
        <div
            className="flex min-h-dvh w-full flex-col items-center
                justify-center gap-5 p-8"
        >
            {isLoading && (
                <>
                    <p>Initialization...</p>
                    <Spinner className="size-8" />
                </>
            )}
            {loaded && (
                <>
                    <div
                        className="h-[85vh] flex w-full max-w-md flex-col gap-5"
                    >
                        <div className="flex flex-1">
                            {!fileUrl && (
                                <Dropzone
                                    handleFileChange={handleFileChange}
                                    handleFileReject={handleFileReject}
                                    maxSize={maxFileSize}
                                />
                            )}
                            {fileUrl && (
                                <VideoPlayer
                                    key={fileUrl}
                                    src={fileUrl}
                                    onTrimChange={setTrimRange}
                                />
                            )}
                        </div>
                        <div>
                            <Button
                                className="w-full"
                                type="button"
                                disabled={isConvertButtonDisabled}
                                onClick={transcode}
                            >
                                Convert to Gif
                            </Button>
                        </div>
                        <div className="flex flex-col gap-5 flex-1">
                            <div
                                className="flex h-full w-full flex-col
                                    items-center justify-center gap-2 rounded-md
                                    border-2 border-dashed border-border"
                            >
                                {isConverting && (
                                    <Progress
                                        value={progress}
                                        className="w-2/3"
                                    />
                                )}
                                {gifUrl && (
                                    <div className="relative w-full h-full">
                                        <img
                                            className="absolute h-full w-full
                                                object-contain"
                                            src={gifUrl}
                                        />
                                    </div>
                                )}
                                {!isConverting && !gifUrl && (
                                    <>
                                        <ImageIcon
                                            className="size-16
                                                text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <p className="text-muted-foreground">
                                            Your GIF will appear here
                                        </p>
                                    </>
                                )}
                            </div>
                            <ActionPanel
                                resetDisabled={!file}
                                onReset={onReset}
                                imageUrl={gifUrl}
                                outputFileName={outputFileName}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
