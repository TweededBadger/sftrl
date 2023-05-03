// @ts-nocheck
import { useRef, useCallback } from 'react';

type FullScreenHook = {
    ref: React.MutableRefObject<HTMLDivElement | null>;
    toggleFullScreen: () => void;
};

export const useFullScreen = (): FullScreenHook => {
    const ref = useRef<HTMLDivElement | null>(null);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            if (ref.current?.requestFullscreen) {
                ref.current.requestFullscreen();
            } else if (ref.current?.mozRequestFullScreen) { // Firefox
                ref.current.mozRequestFullScreen();
            } else if (ref.current?.webkitRequestFullscreen) { // Chrome, Safari and Opera
                ref.current.webkitRequestFullscreen();
            } else if (ref.current?.msRequestFullscreen) { // IE/Edge
                ref.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    }, []);

    return { ref, toggleFullScreen };
};

