import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Play, ExternalLink, Star, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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

// Curated content - rotated daily
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

  // Rotate based on day
  const start = (dayOfYear * 3) % allContent.length;
  const rotated = [...allContent.slice(start), ...allContent.slice(0, start)];
  return rotated.slice(0, 4);
};

const ListeningSection = () => {
  const [content, setContent] = useState<AudioItem[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('atraa_listening_ratings') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    setContent(getAudioContent());
  }, []);

  const handleRate = (id: string, rating: number) => {
    const updated = { ...ratings, [id]: rating };
    setRatings(updated);
    localStorage.setItem('atraa_listening_ratings', JSON.stringify(updated));
  };

  const handleRefresh = () => {
    setContent(getAudioContent());
  };

  const filteredContent = selectedArtist
    ? content.filter(c => c.artistEn === artists.find(a => a.id === selectedArtist)?.nameEn)
    : content;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-[13px] font-bold text-foreground">اِسْتِمَاعٌ 🎧</h2>
        </div>
        <button onClick={handleRefresh} className="p-1.5 rounded-lg hover:bg-secondary/40 transition-colors active:scale-95">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Artist filter chips */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedArtist(null)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
            !selectedArtist ? 'islamic-gradient text-primary-foreground shadow-sm' : 'bg-secondary/50 text-muted-foreground'
          }`}
        >
          الكل
        </button>
        {artists.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedArtist(selectedArtist === a.id ? null : a.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
              selectedArtist === a.id ? 'islamic-gradient text-primary-foreground shadow-sm' : 'bg-secondary/50 text-muted-foreground'
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredContent.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30 shadow-card group"
            >
              {/* Play thumbnail */}
              <button
                onClick={() => window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer')}
                className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 relative overflow-hidden hover:bg-primary/10 transition-colors active:scale-95"
              >
                <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute top-1 right-1">
                  <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${
                    item.category === 'hussaini' ? 'bg-destructive/15 text-destructive' : 'bg-accent/20 text-accent-foreground'
                  }`}>
                    {item.category === 'hussaini' ? 'عزاء' : 'مولد'}
                  </span>
                </div>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[13px] font-bold text-foreground truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.artist}</p>
                {/* Rating */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(item.id, star)}
                      className="p-0"
                    >
                      <Star
                        className={`w-3 h-3 transition-colors ${
                          (ratings[item.id] || 0) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer')}
                className="p-2 rounded-xl hover:bg-secondary/40 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-[9px] text-muted-foreground/40 text-center mt-2.5 font-medium">
        عزاء حسيني ومواليد أهل البيت ﴿ع﴾ · تحديث يومي ١٠:٣٠ غرينتش
      </p>
    </div>
  );
};

export default ListeningSection;
