// v2.11.16 — Curated worldwide Shia mosques & holy shrines directory.
// Coordinates are approximate (public sources) and are used for
// distance sorting and to open a Google Maps location link.

export interface Mosque {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;      // ISO-ish Arabic country name
  countryEn: string;
  city: string;
  cityEn: string;
  area?: string;        // District / neighborhood
  lat: number;
  lng: number;
  /**
   * Estimated annual visitors (pilgrims + regular attendees).
   * Sourced from public reports for major shrines; leave undefined for
   * smaller mosques. Values ≥ 4200 render the blue verified badge next to
   * the mosque name (v2.13.31).
   */
  annualVisits?: number;
}

/** Threshold above which a mosque is considered a high-traffic destination. */
export const HIGH_TRAFFIC_THRESHOLD = 4200;
export const isHighTraffic = (m: Mosque) => (m.annualVisits ?? 0) >= HIGH_TRAFFIC_THRESHOLD;

export const MOSQUES: Mosque[] = [
  // ================= العراق =================
  { id: 'iq-najaf-imam-ali', nameAr: 'حرم أمير المؤمنين علي بن أبي طالب عليه السلام', nameEn: 'Imam Ali Shrine', country: 'العراق', countryEn: 'Iraq', city: 'النجف الأشرف', cityEn: 'Najaf', area: 'وسط المدينة', lat: 32.0000, lng: 44.3143 },
  { id: 'iq-karbala-hussain', nameAr: 'حرم الإمام الحسين عليه السلام', nameEn: 'Imam Hussain Shrine', country: 'العراق', countryEn: 'Iraq', city: 'كربلاء المقدسة', cityEn: 'Karbala', lat: 32.6163, lng: 44.0329 },
  { id: 'iq-karbala-abbas', nameAr: 'حرم أبي الفضل العباس عليه السلام', nameEn: 'Al-Abbas Shrine', country: 'العراق', countryEn: 'Iraq', city: 'كربلاء المقدسة', cityEn: 'Karbala', lat: 32.6180, lng: 44.0345 },
  { id: 'iq-kadhimiya', nameAr: 'حرم الإمامين الكاظمين عليه السلام', nameEn: 'Al-Kadhimiya Shrine', country: 'العراق', countryEn: 'Iraq', city: 'بغداد', cityEn: 'Baghdad', area: 'الكاظمية', lat: 33.3803, lng: 44.3378 },
  { id: 'iq-samarra-askari', nameAr: 'حرم الإمامين العسكريين عليه السلام', nameEn: 'Al-Askari Shrine', country: 'العراق', countryEn: 'Iraq', city: 'سامراء', cityEn: 'Samarra', lat: 34.1989, lng: 43.8737 },
  { id: 'iq-najaf-sahla', nameAr: 'مسجد السهلة المعظّم', nameEn: 'Al-Sahla Mosque', country: 'العراق', countryEn: 'Iraq', city: 'الكوفة', cityEn: 'Kufa', lat: 32.0503, lng: 44.3620 },
  { id: 'iq-kufa-masjid', nameAr: 'مسجد الكوفة المعظّم', nameEn: 'Grand Mosque of Kufa', country: 'العراق', countryEn: 'Iraq', city: 'الكوفة', cityEn: 'Kufa', lat: 32.0288, lng: 44.4008 },

  // ================= إيران =================
  { id: 'ir-mashhad-reza', nameAr: 'حرم الإمام الرضا عليه السلام', nameEn: 'Imam Reza Shrine', country: 'إيران', countryEn: 'Iran', city: 'مشهد المقدسة', cityEn: 'Mashhad', lat: 36.2879, lng: 59.6157 },
  { id: 'ir-qom-masumeh', nameAr: 'حرم السيدة فاطمة المعصومة عليه السلام', nameEn: 'Fatima Masumeh Shrine', country: 'إيران', countryEn: 'Iran', city: 'قم المقدسة', cityEn: 'Qom', lat: 34.6416, lng: 50.8794 },
  { id: 'ir-qom-jamkaran', nameAr: 'مسجد جمكران المقدس', nameEn: 'Jamkaran Mosque', country: 'إيران', countryEn: 'Iran', city: 'قم المقدسة', cityEn: 'Qom', lat: 34.6106, lng: 50.9430 },
  { id: 'ir-shiraz-shahcheragh', nameAr: 'حرم شاه چراغ (أحمد بن موسى عليه السلام)', nameEn: 'Shah Cheragh Shrine', country: 'إيران', countryEn: 'Iran', city: 'شيراز', cityEn: 'Shiraz', lat: 29.6094, lng: 52.5433 },
  { id: 'ir-isfahan-sheikh-lotfollah', nameAr: 'مسجد الشيخ لطف الله', nameEn: 'Sheikh Lotfollah Mosque', country: 'إيران', countryEn: 'Iran', city: 'أصفهان', cityEn: 'Isfahan', lat: 32.6572, lng: 51.6776 },
  { id: 'ir-tehran-shah-abdul-azim', nameAr: 'حرم عبد العظيم الحسني عليه السلام', nameEn: 'Shah-Abdol-Azim Shrine', country: 'إيران', countryEn: 'Iran', city: 'طهران', cityEn: 'Tehran', area: 'الري', lat: 35.5900, lng: 51.4373 },

  // ================= سوريا =================
  { id: 'sy-damascus-zaynab', nameAr: 'حرم السيدة زينب عليه السلام', nameEn: 'Sayyida Zaynab Shrine', country: 'سوريا', countryEn: 'Syria', city: 'دمشق', cityEn: 'Damascus', lat: 33.4453, lng: 36.3436 },
  { id: 'sy-damascus-ruqayya', nameAr: 'حرم السيدة رقية عليه السلام', nameEn: 'Sayyida Ruqayya Shrine', country: 'سوريا', countryEn: 'Syria', city: 'دمشق', cityEn: 'Damascus', area: 'العمارة', lat: 33.5138, lng: 36.3057 },
  { id: 'sy-damascus-umayyad', nameAr: 'مقام رأس الإمام الحسين عليه السلام (الجامع الأموي)', nameEn: 'Head of Imam Hussain (Umayyad Mosque)', country: 'سوريا', countryEn: 'Syria', city: 'دمشق', cityEn: 'Damascus', lat: 33.5117, lng: 36.3067 },

  // ================= المملكة العربية السعودية =================
  { id: 'sa-madinah-baqi', nameAr: 'مقبرة البقيع', nameEn: 'Jannat al-Baqi', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', city: 'المدينة المنورة', cityEn: 'Madinah', lat: 24.4672, lng: 39.6162 },
  { id: 'sa-madinah-nabawi', nameAr: 'المسجد النبوي الشريف', nameEn: 'Al-Masjid an-Nabawi', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', city: 'المدينة المنورة', cityEn: 'Madinah', lat: 24.4672, lng: 39.6111 },
  { id: 'sa-makkah-haram', nameAr: 'المسجد الحرام', nameEn: 'Al-Masjid al-Haram', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', city: 'مكة المكرمة', cityEn: 'Makkah', lat: 21.4225, lng: 39.8262 },
  { id: 'sa-qatif-rasul', nameAr: 'مسجد الرسول الأعظم صلى الله عليه وآله وسلم', nameEn: 'Al-Rasool al-A\'zam Mosque', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', city: 'القطيف', cityEn: 'Qatif', lat: 26.5642, lng: 50.0069 },
  { id: 'sa-ahsa-hussainiya', nameAr: 'حسينية آل شبيب', nameEn: 'Al-Shubaib Hussainiya', country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', city: 'الأحساء', cityEn: 'Al-Ahsa', lat: 25.3810, lng: 49.5875 },

  // ================= البحرين =================
  { id: 'bh-manama-mumin', nameAr: 'مسجد المؤمن', nameEn: 'Al-Mumin Mosque', country: 'البحرين', countryEn: 'Bahrain', city: 'المنامة', cityEn: 'Manama', lat: 26.2235, lng: 50.5876 },
  { id: 'bh-diraz', nameAr: 'مسجد الإمام الصادق عليه السلام', nameEn: 'Imam Sadiq Mosque', country: 'البحرين', countryEn: 'Bahrain', city: 'الدراز', cityEn: 'Diraz', lat: 26.2333, lng: 50.4833 },

  // ================= الكويت =================
  { id: 'kw-hasania', nameAr: 'مسجد الإمام الحسن عليه السلام', nameEn: 'Imam Hassan Mosque', country: 'الكويت', countryEn: 'Kuwait', city: 'مدينة الكويت', cityEn: 'Kuwait City', lat: 29.3697, lng: 47.9783 },

  // ================= لبنان =================
  { id: 'lb-baalbek-khawla', nameAr: 'مقام السيدة خولة بنت الحسين عليه السلام', nameEn: 'Sayyida Khawla Shrine', country: 'لبنان', countryEn: 'Lebanon', city: 'بعلبك', cityEn: 'Baalbek', lat: 34.0058, lng: 36.2181 },
  { id: 'lb-beirut-imam', nameAr: 'مسجد الإمامين الحسنين عليه السلام', nameEn: 'Al-Hassanain Mosque', country: 'لبنان', countryEn: 'Lebanon', city: 'بيروت', cityEn: 'Beirut', area: 'الضاحية الجنوبية', lat: 33.8547, lng: 35.5019 },

  // ================= باكستان =================
  { id: 'pk-karachi', nameAr: 'مسجد الإمام الحسين عليه السلام', nameEn: 'Imam Hussain Mosque', country: 'باكستان', countryEn: 'Pakistan', city: 'كراتشي', cityEn: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { id: 'pk-lahore', nameAr: 'دار المؤمنين', nameEn: 'Dar al-Mumineen', country: 'باكستان', countryEn: 'Pakistan', city: 'لاهور', cityEn: 'Lahore', lat: 31.5204, lng: 74.3587 },

  // ================= الهند =================
  { id: 'in-lucknow-asafi', nameAr: 'مسجد آصفي (البرا إمام باره)', nameEn: 'Bara Imambara', country: 'الهند', countryEn: 'India', city: 'لكناو', cityEn: 'Lucknow', lat: 26.8695, lng: 80.9130 },

  // ================= أذربيجان =================
  { id: 'az-baku-bibi-heybat', nameAr: 'مسجد بي بي هيبت', nameEn: 'Bibi-Heybat Mosque', country: 'أذربيجان', countryEn: 'Azerbaijan', city: 'باكو', cityEn: 'Baku', lat: 40.3407, lng: 49.8194 },

  // ================= المملكة المتحدة =================
  { id: 'uk-london-idara', nameAr: 'مركز أهل البيت عليه السلام (Idara Maarif-e-Islam)', nameEn: 'Idara Maarif-e-Islam', country: 'المملكة المتحدة', countryEn: 'United Kingdom', city: 'لندن', cityEn: 'London', lat: 51.5588, lng: -0.1957 },
  { id: 'uk-london-islamic-centre', nameAr: 'المركز الإسلامي في إنجلترا', nameEn: 'Islamic Centre of England', country: 'المملكة المتحدة', countryEn: 'United Kingdom', city: 'لندن', cityEn: 'London', lat: 51.5416, lng: -0.1969 },

  // ================= الولايات المتحدة =================
  { id: 'us-dearborn-islamic-center', nameAr: 'المركز الإسلامي في أميركا', nameEn: 'Islamic Center of America', country: 'الولايات المتحدة', countryEn: 'United States', city: 'ديربورن، ميشيغان', cityEn: 'Dearborn, MI', lat: 42.3413, lng: -83.2646 },
  { id: 'us-ny-jamaat', nameAr: 'مسجد جماعة علي عليه السلام', nameEn: 'Jamaat-e-Ali Mosque', country: 'الولايات المتحدة', countryEn: 'United States', city: 'نيويورك', cityEn: 'New York, NY', lat: 40.7481, lng: -73.9350 },
  { id: 'us-la-ic', nameAr: 'المركز الإسلامي في جنوب كاليفورنيا', nameEn: 'Islamic Center of Southern California', country: 'الولايات المتحدة', countryEn: 'United States', city: 'لوس أنجلوس', cityEn: 'Los Angeles, CA', lat: 34.0743, lng: -118.2989 },

  // ================= كندا =================
  { id: 'ca-toronto-jaffari', nameAr: 'مركز الجعفري الإسلامي', nameEn: 'Jaffari Community Centre', country: 'كندا', countryEn: 'Canada', city: 'تورنتو', cityEn: 'Toronto', lat: 43.8321, lng: -79.4267 },

  // ================= أستراليا =================
  { id: 'au-sydney-arrahman', nameAr: 'مسجد الرحمن', nameEn: 'Al-Rahman Mosque', country: 'أستراليا', countryEn: 'Australia', city: 'سيدني', cityEn: 'Sydney', lat: -33.9500, lng: 150.9333 },

  // ================= ألمانيا =================
  { id: 'de-hamburg-imam-ali', nameAr: 'مركز الإمام علي عليه السلام (Blaue Moschee)', nameEn: 'Imam Ali Center (Blue Mosque)', country: 'ألمانيا', countryEn: 'Germany', city: 'هامبورغ', cityEn: 'Hamburg', lat: 53.5827, lng: 10.0106 },
];

export const countriesList = (mosques: Mosque[] = MOSQUES) =>
  Array.from(new Set(mosques.map(m => m.country))).sort();

export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
