// hooks/useOrderAlert.js
import { useRef, useEffect } from "react";

export function useOrderAlert(hasPendingOrders) {
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);
  const isPlayingRef = useRef(false);

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const startAlert = () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    playBeep(); // play immediately
    intervalRef.current = setInterval(playBeep, 2000); // repeat every 2s
  };

  const stopAlert = () => {
    isPlayingRef.current = false;
    clearInterval(intervalRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    if (hasPendingOrders) {
      startAlert();
    } else {
      stopAlert();
    }

    return () => stopAlert(); // cleanup on unmount
  }, [hasPendingOrders]);
}
