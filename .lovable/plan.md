## v2.11.16 (Build 366) — Plan

### 1. HomePage cleanup
- Remove `DailyRecommendations` section + import from `src/pages/HomePage.tsx`.
- Remove `WeatherWidget` section + import; delete `src/components/WeatherWidget.tsx`.
- Layout change: `HijriCountdown` becomes full-width and enlarged (bigger typography, more padding, more prominent countdown numerals) instead of a 2-col grid.
- Delete `src/components/DailyRecommendations.tsx` (no other consumers).

### 2. Greeting rework
- Move the rotating devotional line (`DEVOTIONAL_ROTATION`) so it sits **inline beside** "حياك الله" rather than stacked below. Flex row, small gap, subtle divider dot, ellipsis if overflow. AnimatePresence stays.

### 3. Hijri calendar review
- Open `src/components/HijriCountdown.tsx` + any events data file. 
  - Remove "تاسوعاء الحسين" event entry.
  - Replace occurrences of "النبي محمد (عليه السلام)" / "محمد (ع)" with "النبي محمد ﷺ".
  - Sweep event titles for other Prophet-Muhammad references and normalize to ﷺ.

### 4. Library — new "المساجد" tab
- Add fourth tab `mosques` to `src/pages/LibraryPage.tsx`.
- New file `src/pages/MosquesPage.tsx`:
  - Static dataset `src/data/mosques.ts` — curated Shia mosques (name, country, city, area, lat, lng, mapsUrl). Seed ~40–60 well-known mosques (Iraq: Najaf, Karbala, Kadhimiya, Samarra; Iran: Mashhad, Qom, Isfahan; KSA: Medina Baqi; Bahrain, Kuwait, Lebanon, Syria Sayyida Zaynab/Ruqayya, Pakistan, India, UK, US, Canada, Australia, Germany).
  - Filters: country dropdown, city search, "القريب مني" toggle using geolocation → sort by haversine distance.
  - Row card → tap opens `https://maps.google.com/?q=lat,lng` in new tab (or `mapsUrl`).
- Update tab count text "٠٤ أقسام".

### 5. Settings — remove "دعم عترة"
- In `src/pages/SettingsPage.tsx` remove the Support row/section and any navigation to `/support`.
- Delete `src/pages/SupportPage.tsx` and remove its route from `src/App.tsx`.
- Remove i18n keys `settings.support*` if unused elsewhere.

### 6. Desktop experience
- Replace `DesktopBlocker` behavior: instead of blocking, render a desktop layout.
- Update `src/main.tsx` / wherever `DesktopBlocker` is gated so desktop (md+) users see the app.
- New `src/components/DesktopLayout.tsx`: sidebar navigation using shadcn `Sidebar` (collapsible="icon"), main content area with wider max-width (`max-w-6xl`), sidebar items mirror `BottomNav` (Home, Library, Quran, Khatma, Settings).
- Modify `src/components/AppLayout.tsx` to branch: if `window.innerWidth >= 768` and pathname is an app route → use `DesktopLayout` (SidebarProvider + AppSidebar + Outlet), else current mobile layout.
- Keep mobile layout untouched on small screens.
- Delete or repurpose `DesktopBlocker.tsx` — keep as fallback for very small unsupported cases? Just delete.

### 7. About page version bump
- `src/pages/legal/AboutPage.tsx`: version → `v2.11.16 · بناء 366`.
- Same version in `ar.json`, `en.json` if referenced.

### 8. General
- Run `tsgo --noEmit` to verify.

### Technical notes
- Mosques dataset is static TS (no DB migration).
- Haversine helper inline in MosquesPage.
- Sidebar uses `SidebarProvider` at `AppLayout` root when desktop.
- No backend changes, no new secrets.
