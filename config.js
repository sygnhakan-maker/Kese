/* Bulut hesap ayarları. Boş bırakılırsa üyelik/eşitleme arayüzü hiç görünmez (uygulama yalnızca yerel çalışır).
 * Supabase > Project Settings > API: "Project URL" ve "anon public" anahtarı. Bu iki değer HERKESE AÇIKTIR;
 * güvenliği veritabanındaki satır düzeyi yetkilendirme (RLS) sağlar. service_role anahtarını BURAYA ASLA YAZMAYIN. */
window.KESE_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
