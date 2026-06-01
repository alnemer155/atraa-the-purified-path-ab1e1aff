import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, BookMarked, BookOpen, Image as ImageIcon, Plus, Trash2,
  Pencil, Save, X, LogOut, Upload, Sparkles, Globe, Clock, ChevronLeft,
  Hash, Type, Play, Music, Wrench,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isAdminUnlocked, unlockAdmin, lockAdmin } from '@/lib/admin-auth';
import ReadingThemeToggle from '@/components/ReadingThemeToggle';
import KhatmaCreateForm from '@/components/KhatmaCreateForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateAtharId, type AtharQuote } from '@/lib/athar';

type Category = 'dua' | 'ziyara' | 'dhikr';
type Sect = 'shia' | 'sunni';
type Tab = 'duas' | 'wallpapers' | 'khatmas' | 'qasaid' | 'athar' | 'maintenance';

interface DuaRow {
  id: string;
  category: Category;
  sect: Sect;
  title: string;
  content: string;
  source: string | null;
  created_at: string;
}

interface WallpaperRow {
  id: string;
  name: string;
  storage_path: string;
  created_at: string;
}

interface KhatmaRow {
  id: string;
  slug: string;
  short_code: string | null;
  visibility: 'public' | 'private';
  title: string;
  mode: string;
  surah_number: number | null;
  surah_name: string | null;
  recitations_count: number;
  completed_juz_count: number;
  created_at: string;
  expires_at: string | null;
  is_published: boolean;
}

const CATEGORY_LABEL: Record<Category, string> = {
  dua: 'دعاء',
  ziyara: 'زيارة',
  dhikr: 'ذكر',
};
const SECT_LABEL: Record<Sect, string> = { shia: 'شيعي', sunni: 'سني' };

const AdminPage = () => {
  const isMobile = useIsMobile();
  const [unlocked, setUnlocked] = useState(isAdminUnlocked);
  const [secret, setSecret] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [tab, setTab] = useState<Tab>('duas');

  // Strict mobile-only access for the admin dashboard.
  if (isMobile === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background" dir="rtl">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-muted-foreground" strokeWidth={1.4} />
          </div>
          <h1 className="text-[16px] text-foreground font-light mb-2">لوحة المطور</h1>
          <p className="text-[12px] text-muted-foreground/80 font-light leading-relaxed">
            هذه اللوحة متاحة من الهاتف فقط.
            <br />
            يرجى فتحها من جهاز جوّال.
          </p>
        </div>
      </div>
    );
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockAdmin(secret)) {
      setUnlocked(true);
      setSecret('');
    } else {
      toast({ title: 'بيانات الدخول غير صحيحة', variant: 'destructive' });
      setSecret('');
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-background" dir="rtl">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUnlock}
          className="w-full max-w-xs rounded-3xl border border-border/30 bg-card p-7 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5 text-primary" strokeWidth={1.4} />
          </div>
          <h1 className="text-[16px] text-foreground font-light mb-1">لوحة المطور</h1>
          <p className="text-[11px] text-muted-foreground/70 font-light mb-5">
            {textMode ? 'أدخل كلمة المرور النصية' : 'أدخل الرقم السري'}
          </p>
          <input
            type={textMode ? 'text' : 'password'}
            inputMode={textMode ? 'text' : 'numeric'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={textMode ? 'كلمة المرور' : '••••'}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            dir={textMode ? 'ltr' : 'rtl'}
            className={`w-full h-12 text-center rounded-2xl bg-secondary/40 border border-border/30 outline-none focus:border-primary/40 ${
              textMode ? 'text-[14px]' : 'text-[18px] tracking-[0.4em] tabular-nums'
            }`}
          />
          <button
            type="submit"
            className="mt-4 w-full h-11 rounded-full bg-primary text-primary-foreground text-[12px]"
          >
            دخول
          </button>
          <button
            type="button"
            onClick={() => { setTextMode(m => !m); setSecret(''); }}
            className="mt-3 w-full h-9 rounded-full bg-secondary/30 text-muted-foreground text-[10px] font-light flex items-center justify-center gap-1.5 active:bg-secondary/50"
          >
            {textMode ? <Hash className="w-3 h-3" strokeWidth={1.6} /> : <Type className="w-3 h-3" strokeWidth={1.6} />}
            {textMode ? 'استخدام الرقم السري' : 'استخدام كلمة المرور النصية'}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="px-3 py-3 flex items-center justify-between gap-2">
          <button
            onClick={() => { lockAdmin(); setUnlocked(false); }}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-secondary/40 flex-shrink-0"
            aria-label="خروج"
          >
            <LogOut className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          </button>
          <p className="text-[13px] text-foreground">لوحة المطور</p>
          <ReadingThemeToggle allowNight={false} />
        </div>

        {/* Tabs — horizontally scrollable for small screens */}
        <div className="px-3 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {([
            ['duas', 'الأدعية', BookMarked],
            ['wallpapers', 'الخلفيات', ImageIcon],
            ['khatmas', 'الختمات', BookOpen],
            ['qasaid', 'القصائد', Play],
            ['athar', 'أثر', Type],
          ] as [Tab, string, typeof Lock][]).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-shrink-0 px-3 h-9 min-w-[72px] rounded-full text-[11px] flex items-center justify-center gap-1.5 transition-colors ${
                tab === k
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/40 text-foreground border border-border/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 sm:px-4 pt-5">
        {tab === 'duas' && <DuasManager />}
        {tab === 'wallpapers' && <WallpapersManager />}
        {tab === 'khatmas' && <KhatmasManager />}
        {tab === 'qasaid' && <QasaidManager />}
        {tab === 'athar' && <AtharManager />}
      </div>
    </div>
  );
};

// ============== DUAS ==============
const DuasManager = () => {
  const [rows, setRows] = useState<DuaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<DuaRow> | null>(null);
  const [filter, setFilter] = useState<'all' | Category>('all');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_duas')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((data as DuaRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(
    () => filter === 'all' ? rows : rows.filter(r => r.category === filter),
    [rows, filter],
  );

  const save = async () => {
    if (!editing?.title?.trim() || !editing?.content?.trim()) {
      toast({ title: 'العنوان والنص مطلوبان', variant: 'destructive' });
      return;
    }
    const payload = {
      category: (editing.category ?? 'dua') as Category,
      sect: (editing.sect ?? 'shia') as Sect,
      title: editing.title.trim(),
      content: editing.content.trim(),
      source: editing.source?.trim() || null,
    };
    if (editing.id) {
      const { error } = await supabase.from('admin_duas').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'تعذّر الحفظ', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('admin_duas').insert(payload);
      if (error) { toast({ title: 'تعذّر الإضافة', description: error.message, variant: 'destructive' }); return; }
    }
    setEditing(null);
    void load();
    toast({ title: 'تم الحفظ' });
  };

  const remove = async (id: string) => {
    if (!confirm('حذف هذا العنصر؟')) return;
    const { error } = await supabase.from('admin_duas').delete().eq('id', id);
    if (error) { toast({ title: 'تعذّر الحذف', variant: 'destructive' }); return; }
    void load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5">
          {(['all', 'dua', 'ziyara', 'dhikr'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 h-7 rounded-full text-[10px] ${
                filter === k ? 'bg-foreground text-background' : 'bg-secondary/40 text-foreground'
              }`}
            >
              {k === 'all' ? 'الكل' : CATEGORY_LABEL[k]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing({ category: 'dua', sect: 'shia' })}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          aria-label="إضافة"
        >
          <Plus className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>

      {editing && (
        <DuaEditor
          value={editing}
          onChange={setEditing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="text-center text-[11px] text-muted-foreground py-10">جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/30 bg-card p-8 text-center">
          <Sparkles className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.4} />
          <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد عناصر بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/30 bg-card p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground truncate">{r.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">
                      {CATEGORY_LABEL[r.category]}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">
                      {SECT_LABEL[r.sect]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(r)}
                    className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center"
                    aria-label="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => void remove(r.id)}
                    className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/80 font-light leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {r.content}
              </p>
              {r.source && (
                <p className="text-[10px] text-muted-foreground/60 mt-2 font-light">المصدر: {r.source}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DuaEditor = ({
  value, onChange, onSave, onCancel,
}: {
  value: Partial<DuaRow>;
  onChange: (v: Partial<DuaRow>) => void;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="rounded-2xl border border-primary/30 bg-card p-4 mb-4 space-y-3">
    <div className="grid grid-cols-2 gap-2">
      <select
        value={value.category ?? 'dua'}
        onChange={(e) => onChange({ ...value, category: e.target.value as Category })}
        className="h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
      >
        <option value="dua">دعاء</option>
        <option value="ziyara">زيارة</option>
        <option value="dhikr">ذكر</option>
      </select>
      <select
        value={value.sect ?? 'shia'}
        onChange={(e) => onChange({ ...value, sect: e.target.value as Sect })}
        className="h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
      >
        <option value="shia">شيعي</option>
        <option value="sunni">سني</option>
      </select>
    </div>
    <input
      placeholder="العنوان"
      value={value.title ?? ''}
      onChange={(e) => onChange({ ...value, title: e.target.value })}
      className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
    />
    <textarea
      placeholder="النص"
      value={value.content ?? ''}
      onChange={(e) => onChange({ ...value, content: e.target.value })}
      rows={6}
      className="w-full rounded-xl bg-secondary/40 border border-border/30 p-3 text-[12px] outline-none leading-relaxed font-light resize-y"
    />
    <input
      placeholder="المصدر (اختياري)"
      value={value.source ?? ''}
      onChange={(e) => onChange({ ...value, source: e.target.value })}
      className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
    />
    <div className="flex gap-2">
      <button
        onClick={onSave}
        className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5"
      >
        <Save className="w-3.5 h-3.5" strokeWidth={1.6} /> حفظ
      </button>
      <button
        onClick={onCancel}
        className="flex-1 h-10 rounded-full bg-secondary/40 text-foreground text-[12px] flex items-center justify-center gap-1.5"
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.6} /> إلغاء
      </button>
    </div>
  </div>
);

// ============== WALLPAPERS ==============
const WallpapersManager = () => {
  const [rows, setRows] = useState<WallpaperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_wallpapers')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((data as WallpaperRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const publicUrl = (path: string) =>
    supabase.storage.from('admin-wallpapers').getPublicUrl(path).data.publicUrl;

  const upload = async () => {
    if (!file || !name.trim()) {
      toast({ title: 'الاسم والصورة مطلوبان', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('admin-wallpapers')
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      setUploading(false);
      toast({ title: 'تعذّر رفع الصورة', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('admin_wallpapers')
      .insert({ name: name.trim(), storage_path: path });
    setUploading(false);
    if (error) { toast({ title: 'تعذّر الحفظ', variant: 'destructive' }); return; }
    setName(''); setFile(null);
    void load();
    toast({ title: 'تمت الإضافة' });
  };

  const remove = async (row: WallpaperRow) => {
    if (!confirm('حذف هذه الخلفية؟')) return;
    await supabase.storage.from('admin-wallpapers').remove([row.storage_path]);
    await supabase.from('admin_wallpapers').delete().eq('id', row.id);
    void load();
  };

  const saveRename = async (row: WallpaperRow) => {
    const v = renameValue.trim();
    if (!v) { toast({ title: 'الاسم لا يمكن أن يكون فارغاً', variant: 'destructive' }); return; }
    const { error } = await supabase.from('admin_wallpapers').update({ name: v }).eq('id', row.id);
    if (error) { toast({ title: 'تعذّر الحفظ', variant: 'destructive' }); return; }
    setRenamingId(null);
    setRenameValue('');
    void load();
  };

  return (
    <div>
      <div className="rounded-2xl border border-border/30 bg-card p-4 mb-4 space-y-3">
        <input
          placeholder="اسم الخلفية"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
        />
        <label className="flex items-center justify-between gap-3 h-11 rounded-xl bg-secondary/40 border border-border/30 px-3 cursor-pointer">
          <span className="text-[11px] text-muted-foreground font-light truncate flex-1">
            {file ? file.name : 'اختر صورة...'}
          </span>
          <Upload className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          onClick={upload}
          disabled={uploading}
          className="w-full h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
          {uploading ? 'جارٍ الرفع...' : 'إضافة خلفية'}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-[11px] text-muted-foreground py-10">جارٍ التحميل...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/30 bg-card p-8 text-center">
          <ImageIcon className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.4} />
          <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد خلفيات</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {rows.map((w) => (
            <div key={w.id} className="rounded-xl overflow-hidden border border-border/20 bg-card relative">
              <img
                src={publicUrl(w.storage_path)}
                alt={w.name}
                className="w-full aspect-[9/16] object-cover"
                loading="lazy"
              />
              <div className="p-2 flex items-center justify-between gap-1">
                {renamingId === w.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void saveRename(w);
                      if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                    }}
                    className="flex-1 min-w-0 h-7 rounded-md bg-secondary/40 border border-border/30 px-2 text-[10px] outline-none"
                  />
                ) : (
                  <p className="text-[10px] text-foreground truncate flex-1">{w.name}</p>
                )}
                {renamingId === w.id ? (
                  <button
                    onClick={() => void saveRename(w)}
                    className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                    aria-label="حفظ"
                  >
                    <Save className="w-3 h-3 text-primary" strokeWidth={1.6} />
                  </button>
                ) : (
                  <button
                    onClick={() => { setRenamingId(w.id); setRenameValue(w.name); }}
                    className="w-7 h-7 rounded-full bg-secondary/40 flex items-center justify-center flex-shrink-0"
                    aria-label="تعديل الاسم"
                  >
                    <Pencil className="w-3 h-3 text-foreground" strokeWidth={1.6} />
                  </button>
                )}
                <button
                  onClick={() => void remove(w)}
                  className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3 h-3 text-destructive" strokeWidth={1.6} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============== KHATMAS ==============
const KhatmasManager = () => {
  const [rows, setRows] = useState<KhatmaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<KhatmaRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('khatmas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setRows((data as KhatmaRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('حذف هذه الختمة؟ لا يمكن التراجع.')) return;
    const { error } = await supabase.from('khatmas').delete().eq('id', id);
    if (error) { toast({ title: 'تعذّر الحذف', variant: 'destructive' }); return; }
    setSelected(null);
    void load();
  };

  return (
    <div>
      <button
        onClick={() => setShowCreate(s => !s)}
        className="w-full h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5 mb-4"
      >
        {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {showCreate ? 'إغلاق' : 'إنشاء ختمة جديدة'}
      </button>

      {showCreate && (
        <div className="mb-4">
          <KhatmaCreateForm embedded onCreated={() => { setShowCreate(false); void load(); }} />
        </div>
      )}

      {loading ? (
        <p className="text-center text-[11px] text-muted-foreground py-10">جارٍ التحميل...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/30 bg-card p-8 text-center">
          <BookOpen className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.4} />
          <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد ختمات</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
          {rows.map((k) => {
            const isFull = k.mode === 'full_quran';
            const meta = isFull
              ? `قرآن كامل · ${k.completed_juz_count}/30`
              : `سورة ${k.surah_name} · ${k.recitations_count}`;
            return (
              <button
                key={k.id}
                onClick={() => setSelected(k)}
                className="w-full text-right flex items-center gap-3 p-3.5 border-b border-border/10 last:border-b-0 active:bg-secondary/30 transition-colors"
              >
                {isFull
                  ? <BookOpen className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.5} />
                  : <BookMarked className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.5} />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground truncate">{k.title}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-light tabular-nums mt-0.5">{meta}</p>
                </div>
                {k.visibility === 'private' && (
                  <Lock className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.6} />
                )}
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <KhatmaDetailModal
          khatma={selected}
          onClose={() => setSelected(null)}
          onDelete={() => void remove(selected.id)}
        />
      )}
    </div>
  );
};

const KhatmaDetailModal = ({
  khatma, onClose, onDelete,
}: { khatma: KhatmaRow; onClose: () => void; onDelete: () => void }) => {
  const isFull = khatma.mode === 'full_quran';
  const routeKey = khatma.visibility === 'private' && khatma.short_code
    ? khatma.short_code
    : khatma.slug;
  const url = `https://khatma.atraa.xyz/${routeKey}`;
  const fmt = (iso: string | null) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('ar-EG'); } catch { return iso; }
  };
  return (
    <div
      className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
      dir="rtl"
    >
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border border-border/30 bg-card p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground/60 mb-1">
              {isFull ? 'ختمة قرآن كاملة' : `سورة ${khatma.surah_name ?? ''}`}
            </p>
            <p className="text-[15px] text-foreground leading-relaxed">{khatma.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center active:bg-secondary/40 flex-shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <DetailCell
            icon={khatma.visibility === 'public' ? Globe : Lock}
            label="الخصوصية"
            value={khatma.visibility === 'public' ? 'عامة' : 'خاصة'}
          />
          <DetailCell
            icon={isFull ? BookOpen : BookMarked}
            label={isFull ? 'الأجزاء المكتملة' : 'عدد القراءات'}
            value={isFull ? `${khatma.completed_juz_count}/30` : String(khatma.recitations_count)}
          />
          <DetailCell icon={Clock} label="أُنشئت" value={fmt(khatma.created_at)} />
          <DetailCell icon={Clock} label="تنتهي" value={fmt(khatma.expires_at)} />
        </div>

        <div className="rounded-xl bg-secondary/30 border border-border/30 p-3 mb-3">
          <p className="text-[10px] text-muted-foreground/70 mb-1">رابط المشاركة</p>
          <p className="text-[11px] text-foreground break-all font-light" dir="ltr">{url}</p>
        </div>

        {khatma.short_code && (
          <div className="rounded-xl bg-secondary/30 border border-border/30 p-3 mb-3">
            <p className="text-[10px] text-muted-foreground/70 mb-1">الرمز المختصر</p>
            <p className="text-[12px] text-foreground tabular-nums tracking-widest" dir="ltr">{khatma.short_code}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5"
          >
            فتح
          </a>
          <button
            onClick={onDelete}
            className="flex-1 h-10 rounded-full bg-destructive/10 text-destructive text-[12px] flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} /> حذف
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DetailCell = ({
  icon: Icon, label, value,
}: { icon: typeof Lock; label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/30 border border-border/30 p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground/70 mb-1">
      <Icon className="w-3 h-3" strokeWidth={1.6} />
      <span className="text-[9px]">{label}</span>
    </div>
    <p className="text-[11px] text-foreground tabular-nums">{value}</p>
  </div>
);

// ============== QASAID (Husayni elegies + podcasts) ==============
interface QasaidRow {
  id: string;
  title: string;
  reciter: string;
  details: string | null;
  duration_seconds: number | null;
  cover_path: string | null;
  audio_path: string | null;
  video_path: string | null;
  youtube_url: string | null;
  category: 'qasaid' | 'podcast';
  created_at: string;
}

const QASAID_BUCKET = 'qasaid-media';
const DETAILS_WORD_LIMIT = 40;

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const QasaidManager = () => {
  const [rows, setRows] = useState<QasaidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<QasaidRow> | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<QasaidRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_qasaid')
      .select('*')
      .order('created_at', { ascending: false });
    setRows((data as QasaidRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const publicUrl = (path: string | null) =>
    path ? supabase.storage.from(QASAID_BUCKET).getPublicUrl(path).data.publicUrl : '';

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(QASAID_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) return null;
    return path;
  };

  const beginEdit = (row?: QasaidRow) => {
    setCoverFile(null);
    setAudioFile(null);
    setVideoFile(null);
    setEditing(row ?? { reciter: '', title: '', details: '' });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim() || !editing.reciter?.trim()) {
      toast({ title: 'العنوان والرادود مطلوبان', variant: 'destructive' });
      return;
    }
    if (editing.details && countWords(editing.details) > DETAILS_WORD_LIMIT) {
      toast({ title: `الحد ${DETAILS_WORD_LIMIT} كلمة فقط للتفاصيل`, variant: 'destructive' });
      return;
    }
    setSaving(true);
    let cover_path = editing.cover_path ?? null;
    let audio_path = editing.audio_path ?? null;
    let video_path = editing.video_path ?? null;

    if (coverFile) {
      const p = await uploadFile(coverFile);
      if (!p) { setSaving(false); toast({ title: 'تعذّر رفع الخلفية', variant: 'destructive' }); return; }
      cover_path = p;
    }
    if (audioFile) {
      const p = await uploadFile(audioFile);
      if (!p) { setSaving(false); toast({ title: 'تعذّر رفع الصوت', variant: 'destructive' }); return; }
      audio_path = p;
    }
    if (videoFile) {
      const p = await uploadFile(videoFile);
      if (!p) { setSaving(false); toast({ title: 'تعذّر رفع الفيديو', variant: 'destructive' }); return; }
      video_path = p;
    }

    const payload = {
      title: editing.title.trim(),
      reciter: editing.reciter.trim(),
      details: editing.details?.trim() || null,
      duration_seconds: editing.duration_seconds ?? null,
      cover_path,
      audio_path,
      video_path,
      youtube_url: editing.youtube_url?.trim() || null,
      category: (editing.category ?? 'qasaid') as 'qasaid' | 'podcast',
    };

    if (editing.id) {
      const { error } = await supabase.from('admin_qasaid').update(payload).eq('id', editing.id);
      if (error) { setSaving(false); toast({ title: 'تعذّر الحفظ', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('admin_qasaid').insert(payload);
      if (error) { setSaving(false); toast({ title: 'تعذّر الإضافة', description: error.message, variant: 'destructive' }); return; }
    }
    setSaving(false);
    setEditing(null);
    setCoverFile(null);
    setAudioFile(null);
    setVideoFile(null);
    void load();
    toast({ title: 'تم الحفظ' });
  };

  const remove = async (row: QasaidRow) => {
    if (!confirm('حذف هذه القصيدة؟')) return;
    const paths = [row.cover_path, row.audio_path, row.video_path].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from(QASAID_BUCKET).remove(paths);
    await supabase.from('admin_qasaid').delete().eq('id', row.id);
    void load();
  };

  const detailsWords = editing?.details ? countWords(editing.details) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-muted-foreground/70 font-light">
          {rows.length} قصيدة
        </p>
        <button
          onClick={() => beginEdit()}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
          aria-label="إضافة قصيدة"
        >
          <Plus className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>

      {editing && (
        <div className="rounded-2xl border border-primary/30 bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editing.category ?? 'qasaid'}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as 'qasaid' | 'podcast' })}
              className="h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
            >
              <option value="qasaid">قصيدة</option>
              <option value="podcast">بودكاست</option>
            </select>
            <input
              type="number"
              placeholder="مدة القصيدة بالثواني (اختياري)"
              value={editing.duration_seconds ?? ''}
              onChange={(e) => setEditing({
                ...editing,
                duration_seconds: e.target.value ? parseInt(e.target.value, 10) : null,
              })}
              className="h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none tabular-nums"
              dir="ltr"
            />
          </div>

          <input
            placeholder="عنوان القصيدة"
            value={editing.title ?? ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
          />
          <input
            placeholder="اسم الرادود"
            value={editing.reciter ?? ''}
            onChange={(e) => setEditing({ ...editing, reciter: e.target.value })}
            className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
          />

          {/* YouTube URL */}
          <input
            placeholder="رابط يوتيوب (اختياري)"
            value={editing.youtube_url ?? ''}
            onChange={(e) => setEditing({ ...editing, youtube_url: e.target.value })}
            className="w-full h-10 rounded-xl bg-secondary/40 border border-border/30 px-3 text-[12px] outline-none"
            dir="ltr"
          />

          {/* Details — capped at 40 words, vertical resize prevented */}
          <div>
            <textarea
              placeholder={`تفاصيل القصيدة (الحد ${DETAILS_WORD_LIMIT} كلمة)`}
              value={editing.details ?? ''}
              onChange={(e) => setEditing({ ...editing, details: e.target.value })}
              rows={4}
              className="w-full rounded-xl bg-secondary/40 border border-border/30 p-3 text-[12px] outline-none leading-relaxed font-light resize-none"
              style={{ resize: 'none' }}
            />
            <p className={`text-[9px] mt-1 text-left tabular-nums ${
              detailsWords > DETAILS_WORD_LIMIT ? 'text-destructive' : 'text-muted-foreground/60'
            }`} dir="ltr">
              {detailsWords} / {DETAILS_WORD_LIMIT}
            </p>
          </div>

          {/* Cover — square 1:1, any image */}
          <label className="flex items-center justify-between gap-3 h-11 rounded-xl bg-secondary/40 border border-border/30 px-3 cursor-pointer">
            <span className="text-[11px] text-muted-foreground font-light truncate flex-1">
              {coverFile ? coverFile.name : (editing.cover_path ? 'الخلفية الحالية محفوظة' : 'اختر خلفية مربعة 1:1')}
            </span>
            <ImageIcon className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* Audio */}
          <label className="flex items-center justify-between gap-3 h-11 rounded-xl bg-secondary/40 border border-border/30 px-3 cursor-pointer">
            <span className="text-[11px] text-muted-foreground font-light truncate flex-1">
              {audioFile ? audioFile.name : (editing.audio_path ? 'الصوت الحالي محفوظ' : 'اختر ملف صوتي')}
            </span>
            <Music className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {/* Video upload */}
          <label className="flex items-center justify-between gap-3 h-11 rounded-xl bg-secondary/40 border border-border/30 px-3 cursor-pointer">
            <span className="text-[11px] text-muted-foreground font-light truncate flex-1">
              {videoFile ? videoFile.name : (editing.video_path ? 'الفيديو الحالي محفوظ' : 'اختر ملف فيديو (اختياري)')}
            </span>
            <Play className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => void save()}
              disabled={saving}
              className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" strokeWidth={1.6} />
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={() => { setEditing(null); setCoverFile(null); setAudioFile(null); setVideoFile(null); }}
              className="flex-1 h-10 rounded-full bg-secondary/40 text-foreground text-[12px] flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.6} /> إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-[11px] text-muted-foreground py-10">جارٍ التحميل...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/30 bg-card p-8 text-center">
          <Play className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.4} />
          <p className="text-[11px] text-muted-foreground/70 font-light">لا توجد قصائد بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((q) => (
            <div key={q.id} className="rounded-2xl border border-border/30 bg-card p-3 flex items-center gap-3">
              <button onClick={() => setViewing(q)} className="flex items-center gap-3 flex-1 min-w-0 text-right active:opacity-70">
                {q.cover_path ? (
                  <img
                    src={publicUrl(q.cover_path)}
                    alt={q.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground truncate">{q.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-muted-foreground/70 font-light truncate">
                      {q.reciter}
                    </p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${q.category === 'podcast' ? 'bg-primary/10 text-primary' : 'bg-secondary/60 text-muted-foreground'}`}>
                      {q.category === 'podcast' ? 'بودكاست' : 'قصيدة'}
                    </span>
                  </div>
                </div>
              </button>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => beginEdit(q)}
                  className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center"
                  aria-label="تعديل"
                >
                  <Pencil className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void remove(q)}
                  className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={() => setViewing(null)} dir="rtl">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl border border-border/30 bg-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground/60 mb-1">{viewing.category === 'podcast' ? 'بودكاست' : 'قصيدة حسينية'}</p>
                <p className="text-[15px] text-foreground leading-relaxed">{viewing.title}</p>
              </div>
              <button onClick={() => setViewing(null)} className="w-8 h-8 rounded-full active:bg-secondary/40 flex items-center justify-center">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {viewing.cover_path && (
              <img src={publicUrl(viewing.cover_path)} alt={viewing.title} className="w-full aspect-square rounded-2xl object-cover mb-4" />
            )}

            <div className="space-y-2 text-[12px] text-foreground">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">التصنيف</span><span>{viewing.category === 'podcast' ? 'بودكاست' : 'قصيدة'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">الرادود</span><span>{viewing.reciter}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">المدة</span><span className="tabular-nums" dir="ltr">{viewing.duration_seconds ? `${viewing.duration_seconds}s` : '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">صوت</span><span>{viewing.audio_path ? '✓' : '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">فيديو</span><span>{viewing.video_path ? '✓' : '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">يوتيوب</span><span className="truncate" dir="ltr">{viewing.youtube_url || '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-muted-foreground/70">أُضيفت</span><span className="text-[10px]" dir="ltr">{new Date(viewing.created_at).toLocaleString('ar-EG')}</span></div>
            </div>

            {viewing.details && (
              <div className="mt-3 rounded-xl bg-secondary/30 border border-border/30 p-3">
                <p className="text-[10px] text-muted-foreground/70 mb-1">التفاصيل</p>
                <p className="text-[12px] text-foreground font-light leading-relaxed">{viewing.details}</p>
              </div>
            )}

            {viewing.youtube_url && (
              <div className="mt-3 relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${viewing.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? ''}`}
                  title="YouTube"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {viewing.audio_path && (
              <audio controls src={publicUrl(viewing.audio_path)} className="w-full mt-3" />
            )}
            {viewing.video_path && (
              <video controls src={publicUrl(viewing.video_path)} className="w-full mt-3 rounded-xl" />
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => { beginEdit(viewing); setViewing(null); }} className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} /> تعديل
              </button>
              <button onClick={() => { void remove(viewing); setViewing(null); }} className="flex-1 h-11 rounded-full bg-destructive/10 text-destructive text-[12px] flex items-center justify-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} /> حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== ATHAR (sayings) ==============
const AtharManager = () => {
  const [rows, setRows] = useState<AtharQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AtharQuote> | null>(null);
  const [filter, setFilter] = useState<'all' | 'shia' | 'sunni' | 'both'>('all');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('athar_quotes').select('*').order('created_at', { ascending: false });
    setRows((data as AtharQuote[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.sect === filter);

  const save = async () => {
    if (!editing?.text || !editing?.sayer) {
      toast({ title: 'النص والقائل مطلوبان', variant: 'destructive' });
      return;
    }
    const sect = (editing.sect ?? 'both') as 'shia' | 'sunni' | 'both';
    if (editing.id) {
      const { error } = await supabase.from('athar_quotes').update({
        text: editing.text, sayer: editing.sayer, sayer_info: editing.sayer_info ?? null,
        source: editing.source ?? null, interpretation: editing.interpretation ?? null, sect,
      }).eq('id', editing.id);
      if (error) { toast({ title: 'فشل الحفظ', description: error.message, variant: 'destructive' }); return; }
    } else {
      let id = generateAtharId();
      // Ensure unique (very unlikely collision but be safe)
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.from('athar_quotes').select('id').eq('id', id).maybeSingle();
        if (!data) break;
        id = generateAtharId();
      }
      const { error } = await supabase.from('athar_quotes').insert({
        id, text: editing.text, sayer: editing.sayer, sayer_info: editing.sayer_info ?? null,
        source: editing.source ?? null, interpretation: editing.interpretation ?? null, sect,
      });
      if (error) { toast({ title: 'فشل الإضافة', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: 'تم الحفظ' });
    setEditing(null); void load();
  };

  const remove = async (id: string) => {
    if (!confirm('حذف هذه المقولة؟')) return;
    const { error } = await supabase.from('athar_quotes').delete().eq('id', id);
    if (error) { toast({ title: 'فشل الحذف', variant: 'destructive' }); return; }
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {([['all','الكل'],['shia','شيعي'],['sunni','سني'],['both','كلاهما']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`flex-shrink-0 px-3 h-8 rounded-full text-[10px] ${filter===k?'bg-primary text-primary-foreground':'bg-secondary/40 border border-border/30 text-foreground'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing({ sect: 'both' })}
          className="h-8 px-3 rounded-full bg-foreground text-background text-[11px] flex items-center gap-1 flex-shrink-0">
          <Plus className="w-3 h-3" /> إضافة
        </button>
      </div>

      {loading ? (
        <p className="text-[11px] text-muted-foreground/60 text-center py-6">جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/60 text-center py-6">لا توجد مقولات.</p>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/30 bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[9px] tabular-nums text-muted-foreground/60 font-light">{r.id}</span>
                <span className="text-[9px] px-1.5 h-5 rounded-full bg-secondary/40 text-foreground/80 flex items-center">{r.sect}</span>
              </div>
              <p className="text-[12px] text-foreground line-clamp-3 text-right leading-relaxed">{r.text}</p>
              <p className="text-[10px] text-muted-foreground/70 text-right mt-1">{r.sayer}</p>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => setEditing(r)} className="h-7 px-2.5 rounded-full bg-secondary/40 text-[10px] text-foreground flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> تعديل
                </button>
                <button onClick={() => remove(r.id)} className="h-7 px-2.5 rounded-full bg-destructive/10 text-destructive text-[10px] flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" dir="rtl">
          <div className="w-full max-w-md rounded-3xl border border-border/30 bg-card p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] text-foreground">{editing.id ? 'تعديل المقولة' : 'إضافة مقولة'}</p>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full active:bg-secondary/40 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-right">
              <textarea value={editing.text ?? ''} onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                placeholder="نص المقولة" rows={4}
                className="w-full p-3 rounded-xl bg-secondary/40 border border-border/30 text-[12px] outline-none" />
              <input value={editing.sayer ?? ''} onChange={(e) => setEditing({ ...editing, sayer: e.target.value })}
                placeholder='القائل (مثال: النبي محمد ﷺ)' className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[12px] outline-none" />
              <input value={editing.sayer_info ?? ''} onChange={(e) => setEditing({ ...editing, sayer_info: e.target.value })}
                placeholder="معلومات عن القائل (اختياري)" className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[12px] outline-none" />
              <input value={editing.source ?? ''} onChange={(e) => setEditing({ ...editing, source: e.target.value })}
                placeholder="المصدر / الكتاب (اختياري)" className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border/30 text-[12px] outline-none" />
              <textarea value={editing.interpretation ?? ''} onChange={(e) => setEditing({ ...editing, interpretation: e.target.value })}
                placeholder="التفسير (اختياري)" rows={3}
                className="w-full p-3 rounded-xl bg-secondary/40 border border-border/30 text-[12px] outline-none" />
              <div className="grid grid-cols-3 gap-1.5">
                {(['shia','sunni','both'] as const).map((s) => (
                  <button key={s} onClick={() => setEditing({ ...editing, sect: s })}
                    className={`h-10 rounded-xl text-[11px] ${editing.sect===s?'bg-primary text-primary-foreground':'bg-secondary/40 border border-border/30 text-foreground'}`}>
                    {s==='shia'?'شيعي':s==='sunni'?'سني':'كلاهما'}
                  </button>
                ))}
              </div>
              <button onClick={save} className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[12px] flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" /> حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
