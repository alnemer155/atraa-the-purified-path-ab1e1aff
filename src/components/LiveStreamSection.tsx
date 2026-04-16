import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play } from 'lucide-react';

interface LiveChannel {
  id: string;
  name: string;
  nameEn: string;
  youtubeChannelId: string;
  thumbnail: string;
  liveUrl: string;
}

const channels: LiveChannel[] = [
  {
    id: 'hussain-tv3',
    name: 'قناة الإمام الحسين ٣',
    nameEn: 'Imam Hussein TV 3',
    youtubeChannelId: 'UCsVB_GlT3AIil3GT3OwsNOg',
    thumbnail: '',
    liveUrl: 'https://www.youtube.com/c/imamhussein3tv/live',
  },
  {
    id: 'karbala-tv',
    name: 'قناة كربلاء الفضائية',
    nameEn: 'Karbala TV',
    youtubeChannelId: 'UCBy2tZfSFfNcd1wsEbxEHrA',
    thumbnail: '',
    liveUrl: 'https://www.youtube.com/@karaborktv/live',
  },
  {
    id: 'alkafeel',
    name: 'قناة الكفيل',
    nameEn: 'Alkafeel TV',
    youtubeChannelId: 'UCMDZrODsqh0RH-5kB2CSGOA',
    thumbnail: '',
    liveUrl: 'https://www.youtube.com/live/knMj6UjTsTc?si=D5sic38WQfki5VJm',
  },
];

const LiveStreamSection = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const riyadh = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' }));
      setCurrentTime(riyadh.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, []);

  const openStream = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[12px] text-foreground">مُبــاشر</h2>
          <span className="relative flex h-1 w-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/50 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-destructive/60"></span>
          </span>
        </div>
        {currentTime && (
          <span className="text-[8px] text-muted-foreground/30 font-light tabular-nums">
            {currentTime}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {channels.map((channel, i) => (
          <motion.button
            key={channel.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => openStream(channel.liveUrl)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/15 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 text-foreground/50" />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[11px] text-foreground truncate">{channel.name}</p>
              <p className="text-[8px] text-muted-foreground/30 mt-0.5 font-light">بث مباشر</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground/15 flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LiveStreamSection;
