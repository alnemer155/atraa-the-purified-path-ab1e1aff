import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';

interface AudioItem {
  id: string;
  title: string;
  artist: string;
  artistEn: string;
  youtubeUrl: string;
  thumbnail: string;
  category: 'hussaini' | 'mawlid';
}

const artists = [
  { id: 'basim', name: 'باسم الكربلائي', nameEn: 'Basim Al-Karbalai', channelUrl: 'https://www.youtube.com/@BasimAlkarbalaei' },
  { id: 'hussein', name: 'الشيخ حسين الأكرف', nameEn: 'Sheikh Hussein Al-Akraf', channelUrl: 'https://www.youtube.com/@hussainakraf' },
  { id: 'ali', name: 'علي بوحمد', nameEn: 'Ali Bouhamad', channelUrl: 'https://www.youtube.com/@AliBohamad' },
];

const getAudioContent = (): AudioItem[] => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  
  const allContent: AudioItem[] = [
    { id: 'b1', title: 'يا حسين بضمايرنا', artist: 'باسم الكربلائي', artistEn: 'Basim Al-Karbalai', youtubeUrl: 'https://www.youtube.com/@BasimAlkarbalaei', thumbnail: '', category: 'hussaini' },
    { id: 'b2', title: 'نور الهدى', artist: 'باسم الكربلائي', artistEn: 'Basim Al-Karbalai', youtubeUrl: 'https://www.youtube.com/@BasimAlkarbalaei', thumbnail: '', category: 'mawlid' },
    { id: 'h1', title: 'يا زهراء', artist: 'الشيخ حسين الأكرف', artistEn: 'Sheikh Hussein Al-Akraf', youtubeUrl: 'https://www.youtube.com/@hussainakraf', thumbnail: '', category: 'hussaini' },
    { id: 'h2', title: 'مولد النبي', artist: 'الشيخ حسين الأكرف', artistEn: 'Sheikh Hussein Al-Akraf', youtubeUrl: 'https://www.youtube.com/@hussainakraf', thumbnail: '', category: 'mawlid' },
    { id: 'a1', title: 'يا أبا عبدالله', artist: 'علي بوحمد', artistEn: 'Ali Bouhamad', youtubeUrl: 'https://www.youtube.com/@AliBohamad', thumbnail: '', category: 'hussaini' },
    { id: 'a2', title: 'مواليد أهل البيت', artist: 'علي بوحمد', artistEn: 'Ali Bouhamad', youtubeUrl: 'https://www.youtube.com/@AliBohamad', thumbnail: '', category: 'mawlid' },
  ];

  const start = (dayOfYear * 3) % allContent.length;
  const rotated = [...allContent.slice(start), ...allContent.slice(0, start)];
  return rotated.slice(0, 4);
};

const ListeningSection = () => {
  const [content, setContent] = useState<AudioItem[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  useEffect(() => {
    setContent(getAudioContent());
  }, []);

  const handleRefresh = () => {
    setContent(getAudioContent());
  };

  const filteredContent = selectedArtist
    ? content.filter(c => c.artistEn === artists.find(a => a.id === selectedArtist)?.nameEn)
    : content;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[12px] text-foreground">استماع</h2>
        <button onClick={handleRefresh} className="p-1 rounded-md text-muted-foreground/25 active:scale-95 transition-transform">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-1 mb-2.5 overflow-x-auto pb-0.5 hide-scrollbar">
        <button
          onClick={() => setSelectedArtist(null)}
          className={`px-2.5 py-1 rounded-lg text-[9px] whitespace-nowrap transition-all ${
            !selectedArtist ? 'bg-foreground text-background' : 'bg-secondary/30 text-muted-foreground/50'
          }`}
        >
          الكل
        </button>
        {artists.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedArtist(selectedArtist === a.id ? null : a.id)}
            className={`px-2.5 py-1 rounded-lg text-[9px] whitespace-nowrap transition-all ${
              selectedArtist === a.id ? 'bg-foreground text-background' : 'bg-secondary/30 text-muted-foreground/50'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredContent.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/15"
            >
              <button
                onClick={() => window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer')}
                className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5 text-foreground/50" />
              </button>

              <div className="flex-1 min-w-0 text-right">
                <p className="text-[11px] text-foreground truncate">{item.title}</p>
                <p className="text-[8px] text-muted-foreground/40 mt-0.5 font-light">{item.artist}</p>
              </div>

              <span className={`text-[7px] px-1.5 py-0.5 rounded font-light ${
                item.category === 'hussaini' ? 'bg-destructive/6 text-destructive/50' : 'bg-secondary/30 text-muted-foreground/40'
              }`}>
                {item.category === 'hussaini' ? 'عزاء' : 'مولد'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ListeningSection;
