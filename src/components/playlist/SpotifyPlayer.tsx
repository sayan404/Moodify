'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useSession } from 'next-auth/react';

interface SpotifyPlayerProps {
  trackUri: string;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const SpotifyPlayer = ({ trackUri }: SpotifyPlayerProps) => {
  const { data: session, status } = useSession();
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Set up the callback before loading the script
  useEffect(() => {
    console.log('[SpotifyPlayer] Setting up SDK callback');
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('[SpotifyPlayer] SDK ready');
      setIsSDKReady(true);
    };

    return () => {
      window.onSpotifyWebPlaybackSDKReady = () => {};
    };
  }, []);

  useEffect(() => {
    console.log('[SpotifyPlayer] Session status:', status);
    console.log('[SpotifyPlayer] Session data:', session);
    console.log('[SpotifyPlayer] Track URI:', trackUri);
    console.log('[SpotifyPlayer] SDK Ready:', isSDKReady);
  }, [session, status, trackUri, isSDKReady]);

  useEffect(() => {
    if (!isSDKReady) {
      console.log('[SpotifyPlayer] Waiting for SDK to be ready...');
      return;
    }
    if (!session?.accessToken) {
      console.log('[SpotifyPlayer] No access token available');
      return;
    }

    console.log('[SpotifyPlayer] Initializing Spotify Player...');
    const player = new window.Spotify.Player({
      name: 'Song Suggester Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        console.log('[SpotifyPlayer] Getting OAuth token...');
        cb(session.accessToken as string);
      },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('[SpotifyPlayer] Player ready with Device ID:', device_id);
      setPlayer(player);
      setPlayerError(null);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('[SpotifyPlayer] Device ID has gone offline:', device_id);
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] Initialization Error:', message);
      setPlayerError('Failed to initialize player: ' + message);
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] Authentication Error:', message);
      setPlayerError('Authentication failed: ' + message);
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] Account Error:', message);
      setPlayerError('Premium account required');
    });

    console.log('[SpotifyPlayer] Connecting player...');
    player.connect().then((success: boolean) => {
      if (success) {
        console.log('[SpotifyPlayer] Successfully connected to Spotify');
      } else {
        console.error('[SpotifyPlayer] Failed to connect to Spotify');
        setPlayerError('Failed to connect to Spotify');
      }
    });

    return () => {
      console.log('[SpotifyPlayer] Cleaning up player...');
      player.disconnect();
    };
  }, [isSDKReady, session?.accessToken]);

  useEffect(() => {
    if (!player || !trackUri || !session?.accessToken) {
      console.log('[SpotifyPlayer] Play conditions not met:', {
        hasPlayer: !!player,
        hasTrackUri: !!trackUri,
        hasAccessToken: !!session?.accessToken
      });
      return;
    }

    const play = async () => {
      console.log('[SpotifyPlayer] Attempting to play track:', trackUri);
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('[SpotifyPlayer] Play error:', error);
          setPlayerError(`Playback failed: ${error.error?.message || 'Unknown error'}`);
        } else {
          console.log('[SpotifyPlayer] Playback started successfully');
          setPlayerError(null);
        }
      } catch (error) {
        console.error('[SpotifyPlayer] Play error:', error);
        setPlayerError('Failed to start playback');
      }
    };

    play();
  }, [trackUri, player, session?.accessToken]);

  return (
    <>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('[SpotifyPlayer] SDK script loaded');
        }}
      />
      <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
        {playerError && (
          <div className="mb-4 p-2 bg-red-500/10 text-red-500 rounded text-sm">
            {playerError}
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackUri.split(':')[2]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default SpotifyPlayer; 