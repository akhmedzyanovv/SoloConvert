import { DownloadIcon, ExternalLinkIcon, Share2Icon } from 'lucide-react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';

interface ActionPanelProps {
    imageUrl: string | null;
    outputFileName: string | null;
}

function ActionPanel({ imageUrl, outputFileName }: ActionPanelProps) {
    const download = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = outputFileName || 'output.gif';
        a.click();
    };

    const openInNewTab = () => {
        if (!imageUrl) return;
        window.open(imageUrl, '_blank');
    };


    const share = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], outputFileName || 'output.gif', {
                type: 'image/gif'
            });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                });
            } else {
                console.log('Sharing not supported');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <ButtonGroup className="[--radius:9999rem]">
            <ButtonGroup>
                <Button
                    type="button"
                    variant="outline"
                    disabled={!imageUrl}
                    onClick={download}
                >
                    Download <DownloadIcon />
                </Button>
            </ButtonGroup>
            <ButtonGroup>
                <Button
                    type="button"
                    variant="outline"
                    disabled={!imageUrl}
                    onClick={openInNewTab}
                >
                    View <ExternalLinkIcon />
                </Button>
            </ButtonGroup>
            <ButtonGroup>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!imageUrl}
                    onClick={share}
                >
                    <Share2Icon />
                </Button>
            </ButtonGroup>
        </ButtonGroup>
    );
}

export default ActionPanel;
