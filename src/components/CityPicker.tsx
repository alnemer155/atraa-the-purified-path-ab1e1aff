import { useState, useMemo } from 'react';
import { MapPin, LocateFixed, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { haversineKm, reverseGeocode, getAccurateLocation } from '@/lib/geo';

interface CityRecord {
  value: string;
  labelAr: string;
  labelEn: string;
  lat: number;
  lng: number;
  region: string;
}

// Worldwide list (Israel deliberately excluded per project policy).
// Region codes: SA, GCC, IQ, LV, AF, AS, EU, AM, US (United States — state capitals + major), OC.
const CITIES: CityRecord[] = [
  // Saudi Arabia
  { value: 'Qatif', labelAr: 'القطيف', labelEn: 'Qatif', lat: 26.5196, lng: 50.0115, region: 'SA' },
  { value: 'Riyadh', labelAr: 'الرياض', labelEn: 'Riyadh', lat: 24.7136, lng: 46.6753, region: 'SA' },
  { value: 'Jeddah', labelAr: 'جدة', labelEn: 'Jeddah', lat: 21.4858, lng: 39.1925, region: 'SA' },
  { value: 'Dammam', labelAr: 'الدمام', labelEn: 'Dammam', lat: 26.3927, lng: 49.9777, region: 'SA' },
  { value: 'Mecca', labelAr: 'مكة المكرمة', labelEn: 'Mecca', lat: 21.3891, lng: 39.8579, region: 'SA' },
  { value: 'Medina', labelAr: 'المدينة المنورة', labelEn: 'Medina', lat: 24.5247, lng: 39.5692, region: 'SA' },
  { value: 'Khobar', labelAr: 'الخبر', labelEn: 'Khobar', lat: 26.2172, lng: 50.1971, region: 'SA' },
  { value: 'Ahsa', labelAr: 'الأحساء', labelEn: 'Al-Ahsa', lat: 25.3548, lng: 49.5870, region: 'SA' },
  { value: 'Tabuk', labelAr: 'تبوك', labelEn: 'Tabuk', lat: 28.3838, lng: 36.5550, region: 'SA' },
  { value: 'Abha', labelAr: 'أبها', labelEn: 'Abha', lat: 18.2164, lng: 42.5053, region: 'SA' },
  { value: 'Taif', labelAr: 'الطائف', labelEn: 'Taif', lat: 21.2854, lng: 40.4183, region: 'SA' },
  { value: 'Hail', labelAr: 'حائل', labelEn: 'Hail', lat: 27.5219, lng: 41.6907, region: 'SA' },
  { value: 'Buraidah', labelAr: 'بريدة', labelEn: 'Buraidah', lat: 26.3260, lng: 43.9750, region: 'SA' },
  // Gulf
  { value: 'Kuwait', labelAr: 'الكويت', labelEn: 'Kuwait City', lat: 29.3759, lng: 47.9774, region: 'GCC' },
  { value: 'Manama', labelAr: 'المنامة', labelEn: 'Manama', lat: 26.2285, lng: 50.5860, region: 'GCC' },
  { value: 'Doha', labelAr: 'الدوحة', labelEn: 'Doha', lat: 25.2854, lng: 51.5310, region: 'GCC' },
  { value: 'Dubai', labelAr: 'دبي', labelEn: 'Dubai', lat: 25.2048, lng: 55.2708, region: 'GCC' },
  { value: 'Abu Dhabi', labelAr: 'أبوظبي', labelEn: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, region: 'GCC' },
  { value: 'Sharjah', labelAr: 'الشارقة', labelEn: 'Sharjah', lat: 25.3463, lng: 55.4209, region: 'GCC' },
  { value: 'Muscat', labelAr: 'مسقط', labelEn: 'Muscat', lat: 23.5859, lng: 58.4059, region: 'GCC' },
  // Iraq
  { value: 'Baghdad', labelAr: 'بغداد', labelEn: 'Baghdad', lat: 33.3152, lng: 44.3661, region: 'IQ' },
  { value: 'Karbala', labelAr: 'كربلاء', labelEn: 'Karbala', lat: 32.6160, lng: 44.0247, region: 'IQ' },
  { value: 'Najaf', labelAr: 'النجف', labelEn: 'Najaf', lat: 32.0000, lng: 44.3333, region: 'IQ' },
  { value: 'Basra', labelAr: 'البصرة', labelEn: 'Basra', lat: 30.5085, lng: 47.7804, region: 'IQ' },
  { value: 'Mosul', labelAr: 'الموصل', labelEn: 'Mosul', lat: 36.3450, lng: 43.1450, region: 'IQ' },
  // Levant
  { value: 'Damascus', labelAr: 'دمشق', labelEn: 'Damascus', lat: 33.5138, lng: 36.2765, region: 'LV' },
  { value: 'Aleppo', labelAr: 'حلب', labelEn: 'Aleppo', lat: 36.2021, lng: 37.1343, region: 'LV' },
  { value: 'Beirut', labelAr: 'بيروت', labelEn: 'Beirut', lat: 33.8938, lng: 35.5018, region: 'LV' },
  { value: 'Amman', labelAr: 'عمّان', labelEn: 'Amman', lat: 31.9454, lng: 35.9284, region: 'LV' },
  { value: 'Gaza', labelAr: 'غزة', labelEn: 'Gaza', lat: 31.5017, lng: 34.4668, region: 'LV' },
  { value: 'Ramallah', labelAr: 'رام الله', labelEn: 'Ramallah', lat: 31.9038, lng: 35.2034, region: 'LV' },
  // Africa
  { value: 'Cairo', labelAr: 'القاهرة', labelEn: 'Cairo', lat: 30.0444, lng: 31.2357, region: 'AF' },
  { value: 'Alexandria', labelAr: 'الإسكندرية', labelEn: 'Alexandria', lat: 31.2001, lng: 29.9187, region: 'AF' },
  { value: 'Khartoum', labelAr: 'الخرطوم', labelEn: 'Khartoum', lat: 15.5007, lng: 32.5599, region: 'AF' },
  { value: 'Tripoli', labelAr: 'طرابلس', labelEn: 'Tripoli', lat: 32.8872, lng: 13.1913, region: 'AF' },
  { value: 'Tunis', labelAr: 'تونس', labelEn: 'Tunis', lat: 36.8065, lng: 10.1815, region: 'AF' },
  { value: 'Algiers', labelAr: 'الجزائر', labelEn: 'Algiers', lat: 36.7538, lng: 3.0588, region: 'AF' },
  { value: 'Casablanca', labelAr: 'الدار البيضاء', labelEn: 'Casablanca', lat: 33.5731, lng: -7.5898, region: 'AF' },
  { value: 'Lagos', labelAr: 'لاغوس', labelEn: 'Lagos', lat: 6.5244, lng: 3.3792, region: 'AF' },
  { value: 'Nairobi', labelAr: 'نيروبي', labelEn: 'Nairobi', lat: -1.2921, lng: 36.8219, region: 'AF' },
  { value: 'Johannesburg', labelAr: 'جوهانسبرغ', labelEn: 'Johannesburg', lat: -26.2041, lng: 28.0473, region: 'AF' },
  // Asia
  { value: 'Tehran', labelAr: 'طهران', labelEn: 'Tehran', lat: 35.6892, lng: 51.3890, region: 'AS' },
  { value: 'Mashhad', labelAr: 'مشهد', labelEn: 'Mashhad', lat: 36.2605, lng: 59.6168, region: 'AS' },
  { value: 'Qom', labelAr: 'قم', labelEn: 'Qom', lat: 34.6401, lng: 50.8764, region: 'AS' },
  { value: 'Istanbul', labelAr: 'إسطنبول', labelEn: 'Istanbul', lat: 41.0082, lng: 28.9784, region: 'AS' },
  { value: 'Ankara', labelAr: 'أنقرة', labelEn: 'Ankara', lat: 39.9334, lng: 32.8597, region: 'AS' },
  { value: 'Karachi', labelAr: 'كراتشي', labelEn: 'Karachi', lat: 24.8607, lng: 67.0011, region: 'AS' },
  { value: 'Lahore', labelAr: 'لاهور', labelEn: 'Lahore', lat: 31.5204, lng: 74.3587, region: 'AS' },
  { value: 'Islamabad', labelAr: 'إسلام آباد', labelEn: 'Islamabad', lat: 33.6844, lng: 73.0479, region: 'AS' },
  { value: 'Delhi', labelAr: 'دلهي', labelEn: 'Delhi', lat: 28.7041, lng: 77.1025, region: 'AS' },
  { value: 'Mumbai', labelAr: 'مومباي', labelEn: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'AS' },
  { value: 'Dhaka', labelAr: 'دكا', labelEn: 'Dhaka', lat: 23.8103, lng: 90.4125, region: 'AS' },
  { value: 'Jakarta', labelAr: 'جاكرتا', labelEn: 'Jakarta', lat: -6.2088, lng: 106.8456, region: 'AS' },
  { value: 'Kuala Lumpur', labelAr: 'كوالالمبور', labelEn: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, region: 'AS' },
  { value: 'Singapore', labelAr: 'سنغافورة', labelEn: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'AS' },
  { value: 'Bangkok', labelAr: 'بانكوك', labelEn: 'Bangkok', lat: 13.7563, lng: 100.5018, region: 'AS' },
  { value: 'Tokyo', labelAr: 'طوكيو', labelEn: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'AS' },
  { value: 'Seoul', labelAr: 'سيول', labelEn: 'Seoul', lat: 37.5665, lng: 126.9780, region: 'AS' },
  { value: 'Beijing', labelAr: 'بكين', labelEn: 'Beijing', lat: 39.9042, lng: 116.4074, region: 'AS' },
  { value: 'Hong Kong', labelAr: 'هونغ كونغ', labelEn: 'Hong Kong', lat: 22.3193, lng: 114.1694, region: 'AS' },
  // Europe
  { value: 'London', labelAr: 'لندن', labelEn: 'London', lat: 51.5074, lng: -0.1278, region: 'EU' },
  { value: 'Paris', labelAr: 'باريس', labelEn: 'Paris', lat: 48.8566, lng: 2.3522, region: 'EU' },
  { value: 'Berlin', labelAr: 'برلين', labelEn: 'Berlin', lat: 52.5200, lng: 13.4050, region: 'EU' },
  { value: 'Madrid', labelAr: 'مدريد', labelEn: 'Madrid', lat: 40.4168, lng: -3.7038, region: 'EU' },
  { value: 'Rome', labelAr: 'روما', labelEn: 'Rome', lat: 41.9028, lng: 12.4964, region: 'EU' },
  { value: 'Amsterdam', labelAr: 'أمستردام', labelEn: 'Amsterdam', lat: 52.3676, lng: 4.9041, region: 'EU' },
  { value: 'Brussels', labelAr: 'بروكسل', labelEn: 'Brussels', lat: 50.8503, lng: 4.3517, region: 'EU' },
  { value: 'Vienna', labelAr: 'فيينا', labelEn: 'Vienna', lat: 48.2082, lng: 16.3738, region: 'EU' },
  { value: 'Stockholm', labelAr: 'ستوكهولم', labelEn: 'Stockholm', lat: 59.3293, lng: 18.0686, region: 'EU' },
  { value: 'Oslo', labelAr: 'أوسلو', labelEn: 'Oslo', lat: 59.9139, lng: 10.7522, region: 'EU' },
  { value: 'Moscow', labelAr: 'موسكو', labelEn: 'Moscow', lat: 55.7558, lng: 37.6173, region: 'EU' },
  // Americas (non-US)
  { value: 'Toronto', labelAr: 'تورنتو', labelEn: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'AM' },
  { value: 'Montreal', labelAr: 'مونتريال', labelEn: 'Montreal', lat: 45.5017, lng: -73.5673, region: 'AM' },
  { value: 'Mexico City', labelAr: 'مكسيكو سيتي', labelEn: 'Mexico City', lat: 19.4326, lng: -99.1332, region: 'AM' },
  { value: 'Sao Paulo', labelAr: 'ساو باولو', labelEn: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'AM' },
  { value: 'Buenos Aires', labelAr: 'بوينس آيرس', labelEn: 'Buenos Aires', lat: -34.6037, lng: -58.3816, region: 'AM' },
  // United States — all 50 state capitals + DC + a few major non-capital cities
  { value: 'Washington DC', labelAr: 'واشنطن العاصمة', labelEn: 'Washington, D.C.', lat: 38.9072, lng: -77.0369, region: 'US' },
  { value: 'New York', labelAr: 'نيويورك', labelEn: 'New York', lat: 40.7128, lng: -74.0060, region: 'US' },
  { value: 'Los Angeles', labelAr: 'لوس أنجلوس', labelEn: 'Los Angeles', lat: 34.0522, lng: -118.2437, region: 'US' },
  { value: 'Chicago', labelAr: 'شيكاغو', labelEn: 'Chicago', lat: 41.8781, lng: -87.6298, region: 'US' },
  { value: 'Houston', labelAr: 'هيوستن', labelEn: 'Houston', lat: 29.7604, lng: -95.3698, region: 'US' },
  { value: 'Dearborn', labelAr: 'ديربورن', labelEn: 'Dearborn', lat: 42.3223, lng: -83.1763, region: 'US' },
  { value: 'Montgomery', labelAr: 'مونتغمري (ألاباما)', labelEn: 'Montgomery, AL', lat: 32.3792, lng: -86.3077, region: 'US' },
  { value: 'Juneau', labelAr: 'جونو (ألاسكا)', labelEn: 'Juneau, AK', lat: 58.3019, lng: -134.4197, region: 'US' },
  { value: 'Phoenix', labelAr: 'فينيكس (أريزونا)', labelEn: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, region: 'US' },
  { value: 'Little Rock', labelAr: 'ليتل روك (أركنساس)', labelEn: 'Little Rock, AR', lat: 34.7465, lng: -92.2896, region: 'US' },
  { value: 'Sacramento', labelAr: 'ساكرامنتو (كاليفورنيا)', labelEn: 'Sacramento, CA', lat: 38.5816, lng: -121.4944, region: 'US' },
  { value: 'Denver', labelAr: 'دنفر (كولورادو)', labelEn: 'Denver, CO', lat: 39.7392, lng: -104.9903, region: 'US' },
  { value: 'Hartford', labelAr: 'هارتفورد (كونيتيكت)', labelEn: 'Hartford, CT', lat: 41.7658, lng: -72.6734, region: 'US' },
  { value: 'Dover', labelAr: 'دوفر (ديلاوير)', labelEn: 'Dover, DE', lat: 39.1582, lng: -75.5244, region: 'US' },
  { value: 'Tallahassee', labelAr: 'تالاهاسي (فلوريدا)', labelEn: 'Tallahassee, FL', lat: 30.4383, lng: -84.2807, region: 'US' },
  { value: 'Atlanta', labelAr: 'أتلانتا (جورجيا)', labelEn: 'Atlanta, GA', lat: 33.7490, lng: -84.3880, region: 'US' },
  { value: 'Honolulu', labelAr: 'هونولولو (هاواي)', labelEn: 'Honolulu, HI', lat: 21.3099, lng: -157.8581, region: 'US' },
  { value: 'Boise', labelAr: 'بويزي (آيداهو)', labelEn: 'Boise, ID', lat: 43.6150, lng: -116.2023, region: 'US' },
  { value: 'Springfield IL', labelAr: 'سبرينغفيلد (إلينوي)', labelEn: 'Springfield, IL', lat: 39.7817, lng: -89.6501, region: 'US' },
  { value: 'Indianapolis', labelAr: 'إنديانابوليس (إنديانا)', labelEn: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581, region: 'US' },
  { value: 'Des Moines', labelAr: 'دي موين (آيوا)', labelEn: 'Des Moines, IA', lat: 41.5868, lng: -93.6250, region: 'US' },
  { value: 'Topeka', labelAr: 'توبيكا (كانساس)', labelEn: 'Topeka, KS', lat: 39.0473, lng: -95.6752, region: 'US' },
  { value: 'Frankfort', labelAr: 'فرانكفورت (كنتاكي)', labelEn: 'Frankfort, KY', lat: 38.2009, lng: -84.8733, region: 'US' },
  { value: 'Baton Rouge', labelAr: 'باتون روج (لويزيانا)', labelEn: 'Baton Rouge, LA', lat: 30.4515, lng: -91.1871, region: 'US' },
  { value: 'Augusta', labelAr: 'أوغوستا (مين)', labelEn: 'Augusta, ME', lat: 44.3106, lng: -69.7795, region: 'US' },
  { value: 'Annapolis', labelAr: 'أنابوليس (ميريلاند)', labelEn: 'Annapolis, MD', lat: 38.9784, lng: -76.4922, region: 'US' },
  { value: 'Boston', labelAr: 'بوسطن (ماساتشوستس)', labelEn: 'Boston, MA', lat: 42.3601, lng: -71.0589, region: 'US' },
  { value: 'Lansing', labelAr: 'لانسينغ (ميشيغان)', labelEn: 'Lansing, MI', lat: 42.7325, lng: -84.5555, region: 'US' },
  { value: 'Saint Paul', labelAr: 'سانت بول (مينيسوتا)', labelEn: 'Saint Paul, MN', lat: 44.9537, lng: -93.0900, region: 'US' },
  { value: 'Jackson', labelAr: 'جاكسون (ميسيسيبي)', labelEn: 'Jackson, MS', lat: 32.2988, lng: -90.1848, region: 'US' },
  { value: 'Jefferson City', labelAr: 'جيفرسون سيتي (ميزوري)', labelEn: 'Jefferson City, MO', lat: 38.5767, lng: -92.1735, region: 'US' },
  { value: 'Helena', labelAr: 'هيلينا (مونتانا)', labelEn: 'Helena, MT', lat: 46.5891, lng: -112.0391, region: 'US' },
  { value: 'Lincoln', labelAr: 'لينكولن (نبراسكا)', labelEn: 'Lincoln, NE', lat: 40.8136, lng: -96.7026, region: 'US' },
  { value: 'Carson City', labelAr: 'كارسون سيتي (نيفادا)', labelEn: 'Carson City, NV', lat: 39.1638, lng: -119.7674, region: 'US' },
  { value: 'Concord', labelAr: 'كونكورد (نيوهامبشاير)', labelEn: 'Concord, NH', lat: 43.2081, lng: -71.5376, region: 'US' },
  { value: 'Trenton', labelAr: 'ترنتون (نيوجيرسي)', labelEn: 'Trenton, NJ', lat: 40.2206, lng: -74.7597, region: 'US' },
  { value: 'Santa Fe', labelAr: 'سانتا في (نيومكسيكو)', labelEn: 'Santa Fe, NM', lat: 35.6870, lng: -105.9378, region: 'US' },
  { value: 'Albany', labelAr: 'ألباني (نيويورك)', labelEn: 'Albany, NY', lat: 42.6526, lng: -73.7562, region: 'US' },
  { value: 'Raleigh', labelAr: 'رالي (كارولاينا الشمالية)', labelEn: 'Raleigh, NC', lat: 35.7796, lng: -78.6382, region: 'US' },
  { value: 'Bismarck', labelAr: 'بسمارك (داكوتا الشمالية)', labelEn: 'Bismarck, ND', lat: 46.8083, lng: -100.7837, region: 'US' },
  { value: 'Columbus', labelAr: 'كولومبوس (أوهايو)', labelEn: 'Columbus, OH', lat: 39.9612, lng: -82.9988, region: 'US' },
  { value: 'Oklahoma City', labelAr: 'أوكلاهوما سيتي (أوكلاهوما)', labelEn: 'Oklahoma City, OK', lat: 35.4676, lng: -97.5164, region: 'US' },
  { value: 'Salem', labelAr: 'سالم (أوريغون)', labelEn: 'Salem, OR', lat: 44.9429, lng: -123.0351, region: 'US' },
  { value: 'Harrisburg', labelAr: 'هاريسبرغ (بنسلفانيا)', labelEn: 'Harrisburg, PA', lat: 40.2732, lng: -76.8867, region: 'US' },
  { value: 'Providence', labelAr: 'بروفيدنس (رود آيلاند)', labelEn: 'Providence, RI', lat: 41.8240, lng: -71.4128, region: 'US' },
  { value: 'Columbia SC', labelAr: 'كولومبيا (كارولاينا الجنوبية)', labelEn: 'Columbia, SC', lat: 34.0007, lng: -81.0348, region: 'US' },
  { value: 'Pierre', labelAr: 'بيير (داكوتا الجنوبية)', labelEn: 'Pierre, SD', lat: 44.3683, lng: -100.3510, region: 'US' },
  { value: 'Nashville', labelAr: 'ناشفيل (تينيسي)', labelEn: 'Nashville, TN', lat: 36.1627, lng: -86.7816, region: 'US' },
  { value: 'Austin', labelAr: 'أوستن (تكساس)', labelEn: 'Austin, TX', lat: 30.2672, lng: -97.7431, region: 'US' },
  { value: 'Salt Lake City', labelAr: 'سولت ليك سيتي (يوتا)', labelEn: 'Salt Lake City, UT', lat: 40.7608, lng: -111.8910, region: 'US' },
  { value: 'Montpelier', labelAr: 'مونتبلييه (فيرمونت)', labelEn: 'Montpelier, VT', lat: 44.2601, lng: -72.5754, region: 'US' },
  { value: 'Richmond', labelAr: 'ريتشموند (فرجينيا)', labelEn: 'Richmond, VA', lat: 37.5407, lng: -77.4360, region: 'US' },
  { value: 'Olympia', labelAr: 'أولمبيا (واشنطن)', labelEn: 'Olympia, WA', lat: 47.0379, lng: -122.9007, region: 'US' },
  { value: 'Charleston WV', labelAr: 'تشارلستون (فرجينيا الغربية)', labelEn: 'Charleston, WV', lat: 38.3498, lng: -81.6326, region: 'US' },
  { value: 'Madison', labelAr: 'ماديسون (ويسكونسن)', labelEn: 'Madison, WI', lat: 43.0731, lng: -89.4012, region: 'US' },
  { value: 'Cheyenne', labelAr: 'شايان (وايومنغ)', labelEn: 'Cheyenne, WY', lat: 41.1399, lng: -104.8202, region: 'US' },
  // Oceania
  { value: 'Sydney', labelAr: 'سيدني', labelEn: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'OC' },
  { value: 'Melbourne', labelAr: 'ملبورن', labelEn: 'Melbourne', lat: -37.8136, lng: 144.9631, region: 'OC' },
  { value: 'Auckland', labelAr: 'أوكلاند', labelEn: 'Auckland', lat: -36.8485, lng: 174.7633, region: 'OC' },
];

const REGION_LABELS_AR: Record<string, string> = {
  SA: 'السعودية',
  GCC: 'الخليج',
  IQ: 'العراق',
  LV: 'الشام',
  AF: 'أفريقيا',
  AS: 'آسيا',
  EU: 'أوروبا',
  AM: 'الأمريكتين',
  US: 'الولايات المتحدة',
  OC: 'أوقيانوسيا',
};
const REGION_LABELS_EN: Record<string, string> = {
  SA: 'Saudi Arabia',
  GCC: 'Gulf',
  IQ: 'Iraq',
  LV: 'Levant',
  AF: 'Africa',
  AS: 'Asia',
  EU: 'Europe',
  AM: 'Americas',
  US: 'United States',
  OC: 'Oceania',
};
const REGION_ORDER = ['SA', 'GCC', 'IQ', 'LV', 'AF', 'AS', 'EU', 'AM', 'US', 'OC'];

interface CityPickerProps {
  selectedCity: string;
  onCityChange: (city: string, coords: { lat: number; lng: number }) => void;
}

const CityPicker = ({ selectedCity, onCityChange }: CityPickerProps) => {
  const { t, i18n } = useTranslation();
  const [detecting, setDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>(() => {
    const found = CITIES.find(c => c.value === (typeof window !== 'undefined' ? localStorage.getItem('atraa_city') : null));
    return found?.region || 'SA';
  });
  const isAr = i18n.language === 'ar';

  const grouped = useMemo(() => {
    return CITIES.filter(c => c.region === activeRegion);
  }, [activeRegion]);

  const detectLocation = async () => {
    if (!('geolocation' in navigator)) {
      setGpsError(isAr ? 'GPS غير مدعوم' : 'GPS unsupported');
      setTimeout(() => setGpsError(null), 3000);
      return;
    }
    setDetecting(true);
    setGpsError(null);
    try {
      const pos = await getAccurateLocation(15000);
      const { latitude, longitude } = pos.coords;

      // 1) True great-circle nearest-city match (fixes the "Washington vs Dammam" bug
      //    caused by Euclidean math wrapping incorrectly across longitudes).
      let closest = CITIES[0];
      let minDist = haversineKm(latitude, longitude, closest.lat, closest.lng);
      for (const c of CITIES) {
        const d = haversineKm(latitude, longitude, c.lat, c.lng);
        if (d < minDist) { minDist = d; closest = c; }
      }

      // 2) Cross-check with Nominatim reverse geocoding when nearest is > 80 km away
      //    or to bias selection toward the actual country.
      try {
        const geo = await reverseGeocode(latitude, longitude, isAr ? 'ar' : 'en');
        if (geo?.countryCode) {
          // Filter cities to the same country and re-pick nearest within country
          const sameCountry = CITIES.filter(c => cityToCountryCode(c.region, c.value) === geo.countryCode);
          if (sameCountry.length) {
            let bestInCountry = sameCountry[0];
            let bestInCountryDist = haversineKm(latitude, longitude, bestInCountry.lat, bestInCountry.lng);
            for (const c of sameCountry) {
              const d = haversineKm(latitude, longitude, c.lat, c.lng);
              if (d < bestInCountryDist) { bestInCountryDist = d; bestInCountry = c; }
            }
            // Prefer the in-country match if it's reasonably close (< 500 km)
            if (bestInCountryDist < 500) {
              closest = bestInCountry;
            }
          }
        }
      } catch { /* fall through to nearest-by-haversine */ }

      onCityChange(closest.value, { lat: closest.lat, lng: closest.lng });
      setActiveRegion(closest.region);
      setDetecting(false);
      setGpsSuccess(true);
      setTimeout(() => setGpsSuccess(false), 2200);
    } catch (err: any) {
      setDetecting(false);
      const denied = err?.code === 1 || /denied/i.test(err?.message || '');
      setGpsError(
        denied
          ? (isAr ? 'لم يُسمح بالموقع' : 'Permission denied')
          : (isAr ? 'تعذّر تحديد الموقع' : 'Location unavailable')
      );
      setTimeout(() => setGpsError(null), 3000);
    }
  };

  const current = CITIES.find(c => c.value === selectedCity);

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <MapPin className="w-[18px] h-[18px] text-primary" />
        <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
          <p className="text-[13px] font-semibold text-foreground">{t('settings.city')}</p>
          {current && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isAr ? current.labelAr : current.labelEn}
            </p>
          )}
        </div>
        <button
          onClick={detectLocation}
          disabled={detecting}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-[11px] font-medium transition-all ${
            gpsSuccess
              ? 'bg-primary/15 text-primary'
              : 'bg-primary/10 text-primary active:scale-95 disabled:opacity-40'
          }`}
          aria-label="detect location"
        >
          {gpsSuccess ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <LocateFixed className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          )}
          <span>{detecting ? (isAr ? 'جارٍ...' : '...') : (isAr ? 'موقعي' : 'GPS')}</span>
        </button>
      </div>

      {gpsError && (
        <p className="text-[10px] text-destructive mb-2 px-1">{gpsError}</p>
      )}

      {/* Region tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
        {REGION_ORDER.map(r => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] transition-all whitespace-nowrap ${
              activeRegion === r
                ? 'bg-foreground text-background'
                : 'bg-secondary/40 text-muted-foreground/70 border border-border/20'
            }`}
          >
            {isAr ? REGION_LABELS_AR[r] : REGION_LABELS_EN[r]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto hide-scrollbar">
        {grouped.map((c) => (
          <button
            key={c.value}
            onClick={() => onCityChange(c.value, { lat: c.lat, lng: c.lng })}
            className={`px-3 py-1.5 rounded-lg text-[11px] transition-all ${
              selectedCity === c.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-foreground border border-border/30'
            }`}
          >
            {isAr ? c.labelAr : c.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CityPicker;
