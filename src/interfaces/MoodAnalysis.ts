/**
 * Gemini API'den dönen duygu analizi sonucu.
 * Bu tip, kullanılan her yerde aynı yapının tutulmasını sağlar.
 */
export interface MoodAnalysis {
  /** Duygu kategorisi — sabit bir set kullanarak filtre yapmayı kolaylaştırır */
  emotion: 'mutlu' | 'üzgün' | 'stresli' | 'kaygılı' | 'sakin' | 'öfkeli' | 'umutlu';

  /** 
   * 1-10 arası puan (1 = çok kötü, 10 = çok iyi).
   * Dashboard grafiğinde Y ekseni olarak kullanılır.
   */
  score: number;

  /** Duyguyu temsil eden tek emoji karakteri */
  emoji: string;

  /** AI tarafından yazılan 2 cümlelik Türkçe özet */
  summary: string;

  /** Kişiye özel Türkçe öneri */
  suggestion: string;
}
