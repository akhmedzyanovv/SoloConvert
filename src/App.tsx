import { useFFmpeg } from './hooks/useFFmpeg';
import { Spinner } from '@/components/ui/spinner';
import { AppNavigationMenu } from './components/NavigationMenu';
import VideoConverter from './pages/VideoConverter';
import { Routes, Route } from 'react-router';
import SubtitleRenderer from './pages/SubtitleRenderer';

function App() {
    const { ffmpeg, loaded, isLoading } = useFFmpeg();

    return (
        <div
            className="bg-background flex min-h-dvh w-full flex-col items-center
                justify-center"
        >
            {isLoading && (
                <>
                    <p>Initialization...</p>
                    <Spinner className="size-8" />
                </>
            )}
            {loaded && (
                <>
                    <AppNavigationMenu />
                    <div className="flex flex-row justify-center flex-1 w-full p-8 pt-0">
                        <div
                            className="h-[85vh] flex w-full max-w-md flex-col
                                gap-5"
                        >
                            <Routes>
                                <Route
                                    path="/"
                                    element={<VideoConverter ffmpeg={ffmpeg} />}
                                />
                                <Route
                                    path="/subtitle-renderer"
                                    element={<SubtitleRenderer />}
                                />
                            </Routes>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
