import { useDropzone, type FileRejection } from 'react-dropzone';

interface DropzoneProps {
    handleFileChange: (file: File) => void;
    handleFileReject: (fileRejections: FileRejection[]) => void;
    maxSize?: number;
}

const Dropzone = ({
    handleFileChange,
    handleFileReject,
    maxSize
}: DropzoneProps) => {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: {
            'video/*': []
        },
        maxFiles: 1,
        maxSize,
        onDropAccepted: (files) => handleFileChange(files[0]),
        onDropRejected: handleFileReject
    });

    const limitInMB = maxSize ? Math.round(maxSize / 1024 / 1024) : 0;

    return (
        <section
            className="w-full cursor-pointer border-4 border-dotted border-border p-4"
        >
            <div
                {...getRootProps({
                    className:
                        'dropzone flex h-32 flex-col items-center justify-center gap-2 text-center'
                })}
            >
                <input {...getInputProps()} />
                {acceptedFiles.length === 0 ? (
                    <>
                        <p className="font-medium">Drop your video here</p>
                        {limitInMB > 0 && (
                            <p className="text-sm text-muted-foreground">
                                Limit: {limitInMB}MB
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                            MP4, MOV, WEBM, etc.
                        </p>
                    </>
                ) : (
                    <p className="font-medium">File: {acceptedFiles.at(0)?.name}</p>
                )}
            </div>
        </section>
    );
};

export { Dropzone };
