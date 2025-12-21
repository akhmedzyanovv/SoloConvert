import { useEffect, useState } from 'react';
import { useFFmpeg } from './hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { ProgressEvent } from '@ffmpeg/ffmpeg';
import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { ImageIcon } from 'lucide-react';
import type { FileRejection } from 'react-dropzone';
import { Spinner } from './components/ui/spinner';
import ActionPanel from './components/ActionPanel';
import { Progress } from './components/ui/progress';

const fileSizeLimit50MB = 1024 * 1024 * 50;
const outputExtension = 'gif';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

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

    const maxFileSize = parseInt(
        import.meta.env.VITE_MAX_FILE_SIZE ?? fileSizeLimit50MB,
        10
    );
    const isConvertButtonDisabled = !file || isConverting;

    const inputFileName = file ? file.name : '';
    const outputFileName = `${inputFileName.split('.').slice(0, -1).join('.')}.${outputExtension}`;

    const handleFileChange = (file: File) => setFile(file);

    const transcode = async () => {
        if (!file) return;

        setGifUrl(null);
        setIsConverting(true);

        await ffmpeg.writeFile(inputFileName, await fetchFile(file));

        await ffmpeg.exec([
            '-i',
            inputFileName,
            '-vf',
            'fps=15,scale=320:-1',
            outputFileName
        ]);
        const data = await ffmpeg.readFile(outputFileName);

        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        const url = URL.createObjectURL(
            new Blob([data as BlobPart], { type: 'image/gif' })
        );
        setGifUrl(url);
        setIsConverting(false);
        setFile(null);
    };

    const handleFileReject = (fileRejections: FileRejection[]) =>
        fileRejections.forEach(({ errors }) => console.error(errors));

    return (
        <div
            className="flex min-h-screen w-full flex-col items-center
                justify-center gap-5 p-4"
        >
            {isLoading && (
                <>
                    <p>Initialization...</p>
                    <Spinner className="size-8" />
                </>
            )}
            {loaded && (
                <>
                    <div className="flex w-full max-w-md flex-col gap-5">
                        <Dropzone
                            handleFileChange={handleFileChange}
                            handleFileReject={handleFileReject}
                            maxSize={maxFileSize}
                        />
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
                        <div
                            className="flex h-56 w-full flex-col items-center
                                justify-center gap-2 rounded-md border-2
                                border-dashed border-border"
                        >
                            {isConverting && (
                                <Progress value={progress} className="w-2/3" />
                            )}
                            {gifUrl && (
                                <img
                                    className="h-full w-full object-contain"
                                    src={gifUrl}
                                />
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
                            imageUrl={gifUrl}
                            outputFileName={outputFileName}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
