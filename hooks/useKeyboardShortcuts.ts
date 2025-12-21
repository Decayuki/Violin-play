import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
    onPlayPause?: () => void;
    onSeekForward?: () => void; // ArrowRight
    onSeekBackward?: () => void; // ArrowLeft
    onToggleFocus?: () => void; // F
    onMute?: () => void; // M
}

export function useKeyboardShortcuts({
    onPlayPause,
    onSeekForward,
    onSeekBackward,
    onToggleFocus,
    onMute
}: UseKeyboardShortcutsProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                return;
            }

            switch (event.code) {
                case 'Space':
                    event.preventDefault(); // Prevent scrolling
                    onPlayPause?.();
                    break;
                case 'ArrowRight':
                    // event.preventDefault(); // Optional: might want to allow default scrolling if no handler
                    if (onSeekForward) {
                        event.preventDefault();
                        onSeekForward();
                    }
                    break;
                case 'ArrowLeft':
                    if (onSeekBackward) {
                        event.preventDefault();
                        onSeekBackward();
                    }
                    break;
                case 'KeyF':
                    event.preventDefault();
                    onToggleFocus?.();
                    break;
                case 'KeyM':
                    event.preventDefault();
                    onMute?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPlayPause, onSeekForward, onSeekBackward, onToggleFocus, onMute]);
}
