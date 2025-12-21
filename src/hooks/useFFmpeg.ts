import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

export const useFFmpeg = () => {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());

    const load = async () => {
        if (loaded || isLoading) return;

        setIsLoading(true);

        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', (log) => {
            console.log(log);
        });

        try {
            const isSharedArrayBufferSupported =
                typeof SharedArrayBuffer !== 'undefined';
            const baseUrl = isSharedArrayBufferSupported
                ? import.meta.env.VITE_FFMPEG_MT_BASE_URL
                : import.meta.env.VITE_FFMPEG_ST_BASE_URL;

            const loadResource = async (url: string, type: string) => {
                try {
                    const cache = await caches.open('ffmpeg-cache');
                    let response = await cache.match(url);

                    if (!response) {
                        response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response.clone());
                        }
                    }

                    const blob = await response.blob();
                    return URL.createObjectURL(new Blob([blob], { type }));
                } catch (e) {
                    return toBlobURL(url, type);
                }
            };

            await ffmpeg.load({
                coreURL: await loadResource(
                    `${baseUrl}/${import.meta.env.VITE_FFMPEG_CORE_JS}`,
                    'text/javascript'
                ),
                wasmURL: await loadResource(
                    `${baseUrl}/${import.meta.env.VITE_FFMPEG_CORE_WASM}`,
                    'application/wasm'
                ),
                workerURL: isSharedArrayBufferSupported
                    ? await loadResource(
                          `${baseUrl}/${import.meta.env.VITE_FFMPEG_CORE_WORKER}`,
                          'text/javascript'
                      )
                    : undefined
            });
        } catch (e) {
            console.error(e);
        }

        setLoaded(true);
        setIsLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    return {
        ffmpeg: ffmpegRef.current,
        loaded,
        isLoading
    };
};
