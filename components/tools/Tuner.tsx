import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function Tuner({ onClose }: { onClose: () => void }) {
    const [isActive, setIsActive] = useState(false);
    const [note, setNote] = useState<string>("-");
    const [cents, setCents] = useState<number>(0);
    const [frequency, setFrequency] = useState<number>(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const requestRef = useRef<number | undefined>(undefined);

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

    const stopTuner = () => {
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
    };

    const updatePitch = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        const ac = autoCorrelate(buffer, audioContextRef.current!.sampleRate);

        if (ac !== -1) {
            const pitch = ac;
            const noteNum = 12 * (Math.log(pitch / 440) / Math.log(2)) + 69;
            const roundedNote = Math.round(noteNum);
            const detune = Math.floor((noteNum - roundedNote) * 100);
            const noteName = NOTE_STRINGS[roundedNote % 12];

            setFrequency(Math.round(pitch));
            setNote(noteName);
            setCents(detune);
        }

        requestRef.current = requestAnimationFrame(updatePitch);
    };

    // Simple Autocorrelation Algorithm
    const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
        let SIZE = buf.length;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            const val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1; // Not enough signal

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
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary/95 backdrop-blur-md text-white">
            {/* Header / Controls */}
            <div className="flex items-center justify-between p-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Mic className="w-6 h-6 text-gold-primary" />
                    <span className="tracking-widest">TUNER</span>
                </h2>
                <button
                    onClick={() => { stopTuner(); onClose(); }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            {/* Main Display */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Note & Stats */}
                <div className="text-center mb-12 z-10">
                    <div className={`text-9xl font-bold font-mono mb-4 transition-colors duration-200 ${Math.abs(cents) < 5 && note !== "-" ? 'text-green-400' : 'text-white'}`}>
                        {note}
                    </div>
                    <div className="flex items-center justify-center gap-8 text-text-secondary font-mono text-xl">
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-text-muted uppercase tracking-wider">Cents</span>
                            <span className={Math.abs(cents) < 5 && note !== "-" ? 'text-green-400' : ''}>
                                {cents > 0 ? '+' : ''}{cents}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-text-muted uppercase tracking-wider">Hz</span>
                            <span>{frequency}</span>
                        </div>
                    </div>
                </div>

                {/* Vertical Visualizer (Yunable Style) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    {/* Center Line */}
                    <div className="w-full h-1 bg-white/10 absolute" />
                </div>

                {/* Dynamic Vertical Bar */}
                <div className="relative h-96 w-24 bg-bg-tertiary rounded-full overflow-hidden border border-white/10 shadow-inner">
                    {/* Center Marker */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/50 z-20" />

                    {/* Moving Bar */}
                    {/* We map -50..+50 cents to 0%..100% height relative to center? 
                        Actually, let's make the bar grow from center.
                    */}
                    <div
                        className={`absolute left-0 right-0 transition-all duration-100 ease-out ${Math.abs(cents) < 5 ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}
                        style={{
                            top: cents > 0 ? '50%' : `${50 + (cents * 1)}%`, // If cents is -50, top is 0%. If cents is 0, top is 50%.
                            bottom: cents > 0 ? `${50 - (cents * 1)}%` : '50%', // If cents is +50, bottom is 0%. If cents is 0, bottom is 50%.
                            // Wait, logic check:
                            // If cents = +20: Top should be 50% - height? No.
                            // Let's use height and top.
                            // Center is 50%.
                            // If positive (sharp), bar goes UP from 50%.
                            // If negative (flat), bar goes DOWN from 50%.
                            // CSS 'top' starts from top.
                            // So for Sharp (+): Top = 50% - (cents)%. Height = cents%.
                            // For Flat (-): Top = 50%. Height = abs(cents)%.
                        }}
                    >
                        {/* Correct logic via style override */}
                    </div>
                    {/* Re-implementing style logic cleanly */}
                    <div
                        className={`absolute left-0 right-0 transition-all duration-100 ease-out ${Math.abs(cents) < 5 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                            top: cents >= 0 ? `${50 - cents}%` : '50%',
                            height: `${Math.abs(cents)}%`,
                            maxHeight: '50%'
                        }}
                    />
                </div>

                {/* Scale Labels */}
                <div className="absolute right-1/2 translate-x-20 h-96 flex flex-col justify-between text-xs font-mono text-text-muted py-2">
                    <span>+50</span>
                    <span>0</span>
                    <span>-50</span>
                </div>

            </div>

            {/* Footer Controls */}
            <div className="p-8 flex justify-center">
                {!isActive ? (
                    <button
                        onClick={startTuner}
                        className="px-12 py-4 bg-gold-primary text-bg-primary font-bold text-xl rounded-full hover:bg-gold-light transition-all shadow-lg hover:scale-105 flex items-center gap-3"
                    >
                        <Mic className="w-6 h-6" /> START TUNING
                    </button>
                ) : (
                    <button
                        onClick={stopTuner}
                        className="px-12 py-4 bg-bg-tertiary text-text-primary font-bold text-xl rounded-full hover:bg-bg-secondary transition-all flex items-center gap-3"
                    >
                        <MicOff className="w-6 h-6" /> STOP
                    </button>
                )}
            </div>
        </div>
    );
}
