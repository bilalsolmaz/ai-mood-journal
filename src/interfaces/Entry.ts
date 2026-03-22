/**
 * Giriş verisi arayüzü.
 * Her günlük kaydı bu yapıyı takip eder.
 */
export interface Entry {
  id: number;           // Benzersiz kimlik (Date.now() ile üretilir)
  text: string;         // Kullanıcının yazdığı günlük metni
  date: string;         // ISO 8601 format: new Date().toISOString()
  mood: MoodAnalysis;   // Gemini tarafından üretilen duygu analizi
  updatedAt?: string;   // Düzenlenme zamanı (opsiyonel)
}

// Circular import'u önlemek için MoodAnalysis'i de burada import ediyoruz
import type { MoodAnalysis } from './MoodAnalysis';
