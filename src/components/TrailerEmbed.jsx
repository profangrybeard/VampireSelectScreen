/**
 * TrailerEmbed — vertically cropped YouTube trailer.
 *
 * The iframe is sized to fill the container height at 16:9,
 * making it much wider than the container. The parent clips
 * to show only the center slice — a natural vertical crop.
 *
 * Autoplay requires muted on mobile. Unmute toggle provided.
 *
 * preload: when true, loads the YT API and starts buffering
 * the video in the background before the trailer is shown.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

const VIDEO_ID = 'OEi7nQbNDog';

export default function TrailerEmbed({ visible, preload, onClose }) {
  const [muted, setMuted] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const apiLoaded = useRef(false);

  // Load YouTube IFrame API when preloading or visible
  useEffect(() => {
    if (!visible && !preload) return;

    if (window.YT?.Player) {
      initPlayer();
      return;
    }

    // Load the API script once
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    if (!apiLoaded.current) {
      window.onYouTubeIframeAPIReady = () => {
        apiLoaded.current = true;
        initPlayer();
      };
    }

    return () => {
      if (!apiLoaded.current) window.onYouTubeIframeAPIReady = null;
    };
  }, [visible, preload]);

  // When transitioning from preload to visible, play the video
  useEffect(() => {
    if (visible && playerRef.current) {
      try { playerRef.current.playVideo(); } catch {}
    }
  }, [visible]);

  function initPlayer() {
    if (playerRef.current) {
      if (visible) {
        try { playerRef.current.playVideo(); } catch {}
      }
      return;
    }
    if (!iframeRef.current) return;
    playerRef.current = new window.YT.Player(iframeRef.current, {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        showinfo: 0,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: () => setPlayerReady(true),
      },
    });
  }

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (muted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      } else {
        playerRef.current.mute();
      }
      setMuted(!muted);
    } catch {}
  }, [muted]);

  const handleClose = useCallback(() => {
    try { playerRef.current?.pauseVideo(); } catch {}
    onClose?.();
  }, [onClose]);

  // Destroy player when hidden and not preloading
  useEffect(() => {
    if (!visible && !preload && playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
      setPlayerReady(false);
      setMuted(true);
    }
  }, [visible, preload]);

  return (
    <div
      ref={containerRef}
      className={`trailer-container ${visible ? 'trailer-container--visible' : ''}`}
    >
      {/* Iframe placeholder — YouTube API replaces this */}
      <div className="trailer-iframe-wrap">
        <div ref={iframeRef} className="trailer-iframe-target" />
      </div>

      {/* Top/bottom gradient feathers */}
      <div className="trailer-feather trailer-feather--top" />
      <div className="trailer-feather trailer-feather--bottom" />

      {/* Credit */}
      {visible && (
        <div className="trailer-credit">
          World of Darkness &middot; CCP Games, 2010
        </div>
      )}

      {/* Controls */}
      {visible && (
        <div className="trailer-controls">
          <button
            className="trailer-btn trailer-btn--close"
            onClick={handleClose}
            aria-label="Close trailer"
          >
            RETURN
          </button>
          <button
            className="trailer-btn trailer-btn--mute"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
    </div>
  );
}
