import { useState, useRef, useEffect, useCallback } from 'react';

const NOTE_STRINGS = ["Do", "Do#", "Ré", "Ré#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];

export function useTuner() {
    const [isActive, setIsActive] = useState(false);
    const [note, setNote] = useState<string>("-");
    const [cents, setCents] = useState<number>(0);
    const [frequency, setFrequency] = useState<number>(0);
    const [hasSignal, setHasSignal] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number | undefined>(undefined);

    const updatePitch = useCallback(() => {
        if (!analyserRef.current || !audioContextRef.current) return;

        const bufferLength = analyserRef.current.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        const ac = autoCorrelate(buffer, audioContextRef.current.sampleRate);

        if (ac !== -1) {
            const pitch = ac;
            const noteNum = 12 * (Math.log(pitch / 440) / Math.log(2)) + 69;
            const roundedNote = Math.round(noteNum);
            const detune = Math.floor((noteNum - roundedNote) * 100);
            const noteName = NOTE_STRINGS[roundedNote % 12];

            setFrequency(Math.round(pitch));
            setNote(noteName);
            setCents(detune);
            setHasSignal(true);
        } else {
            setHasSignal(false);
        }

        requestRef.current = requestAnimationFrame(updatePitch);
    }, []);

    const startTuner = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            setIsActive(true);
            updatePitch();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please allow permissions.");
        }
    };

    const stopTuner = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
            sourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setIsActive(false);
        setNote("-");
        setCents(0);
        setFrequency(0);
        setHasSignal(false);
    }, []);

    // Simple Autocorrelation Algorithm
    const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
        let SIZE = buf.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            const val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.005) return -1; // Lowered threshold for better sensitivity

        let r1 = 0, r2 = SIZE - 1, thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buf[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
        }

        buf = buf.slice(r1, r2);
        SIZE = buf.length;

        const c = new Array(SIZE).fill(0);
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - i; j++) {
                c[i] = c[i] + buf[j] * buf[j + i];
            }
        }

        let d = 0; while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < SIZE; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;

        return sampleRate / T0;
    };

    useEffect(() => {
        return () => stopTuner();
    }, [stopTuner]);

    return {
        isActive,
        note,
        cents,
        frequency,
        hasSignal,
        startTuner,
        stopTuner
    };
}
