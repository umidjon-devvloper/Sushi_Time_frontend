// Lightweight notifier for incoming chat messages: ding sound + browser
// notification + vibration. All side-effects are best-effort.

let audioCtx = null;
const getCtx = () => {
  if (audioCtx) return audioCtx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = new Ctor();
  return audioCtx;
};

// Call this from a user gesture (click/tap) so future playDing() calls work in browsers
// that suspend AudioContext until first interaction.
export function unlockAudio() {
  try {
    const ctx = getCtx();
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  } catch {}
}

// Two-tone "ding" via WebAudio — no external asset needed
export function playDing() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const tones = [
      { freq: 880, start: 0, dur: 0.18 },
      { freq: 1320, start: 0.12, dur: 0.22 },
    ];
    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
  } catch {}
}

export function vibrate(pattern = [80, 40, 80]) {
  try { navigator.vibrate?.(pattern); } catch {}
}

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function showBrowserNotification(title, body, onClick) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible') return; // skip if user is on the page
    const n = new Notification(title, { body, icon: '/image.png', tag: 'sushi-chat' });
    if (onClick) n.onclick = () => { window.focus(); onClick(); n.close(); };
  } catch {}
}

export function notifyIncomingMessage({ title, body, onClick } = {}) {
  playDing();
  vibrate();
  showBrowserNotification(title || 'New message', body || '', onClick);
}
