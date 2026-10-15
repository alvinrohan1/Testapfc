/**
 * Android Immersive Fullscreen, Screen WakeLock, and Haptic Feedback utilities
 */

let wakeLockSentinel: any = null;

export async function requestFullscreen(): Promise<boolean> {
  try {
    const docEl = document.documentElement as any;
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
      return true;
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
      return true;
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('Fullscreen request denied or not supported:', err);
  }
  return false;
}

export async function exitFullscreen(): Promise<boolean> {
  try {
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
        return true;
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
        return true;
      }
    }
  } catch (err) {
    console.warn('Exit fullscreen error:', err);
  }
  return false;
}

export function isFullscreen(): boolean {
  const doc = document as any;
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
}

export async function acquireWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Screen WakeLock failed:', err);
    }
  }
  return false;
}

export function releaseWakeLock(): void {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }
}

export function triggerHaptic(type: 'tap' | 'correct' | 'wrong' | 'warning' = 'tap'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'tap') {
        navigator.vibrate(15);
      } else if (type === 'correct') {
        navigator.vibrate([25, 40, 25]);
      } else if (type === 'wrong') {
        navigator.vibrate([40, 30, 40]);
      } else if (type === 'warning') {
        navigator.vibrate(60);
      }
    } catch {
      // ignore
    }
  }
}
