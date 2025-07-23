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
  const { data: session } = useSession();
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    if (!isSDKReady || !session?.accessToken) return;

    const player = new window.Spotify.Player({
      name: 'Song Suggester Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(session.accessToken as string);
      },
      volume: 0.5
    });

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      setPlayer(player);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.connect();

    return () => {
      player.disconnect();
    };
  }, [isSDKReady, session?.accessToken]);

  useEffect(() => {
    if (!player || !trackUri || !session?.accessToken) return;

    const play = async () => {
      try {
        await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
        });
      } catch (error) {
        console.error('Error playing track:', error);
      }
    };

    play();
  }, [trackUri, player, session?.accessToken]);

  if (!session?.accessToken) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackUri.split(':')[2]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://sdk.scdn.co/spotify-player.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.onSpotifyWebPlaybackSDKReady = () => {
            setIsSDKReady(true);
          };
        }}
      />
      <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <iframe
            src={`https://open.spotify.com/embed/track/${trackUri.split(':')[2]}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default SpotifyPlayer; 