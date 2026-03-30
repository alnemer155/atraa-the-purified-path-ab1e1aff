import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, ExternalLink, Play } from 'lucide-react';

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
    thumbnail: `https://i.ytimg.com/vi/live_stream?channel=UCsVB_GlT3AIil3GT3OwsNOg&default.jpg`,
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-destructive" />
          </div>
          <h2 className="text-[13px] font-bold text-foreground">مُبــــــــاشر</h2>
          <div className="flex items-center gap-1 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="text-[9px] text-destructive font-semibold">LIVE</span>
          </div>
        </div>
        {currentTime && (
          <span className="text-[10px] text-muted-foreground font-medium">
            بتوقيت بغداد · {currentTime}
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {channels.map((channel, i) => (
          <motion.button
            key={channel.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => openStream(channel.liveUrl)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-all active:scale-[0.98] shadow-card group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
              <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute top-1 left-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[13px] font-bold text-foreground truncate">{channel.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{channel.nameEn}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center mt-2.5 font-medium">
        يتم التحديث يومياً · ١٠:٣٠ بتوقيت غرينتش
      </p>
    </div>
  );
};

export default LiveStreamSection;
