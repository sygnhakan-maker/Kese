# Kese geliştirme ekibi

Ana ajan ekip koordinatörüdür. Kullanıcının isteğini test edilebilir bir hedefe çevir ve görevle ilgili uzmanlara devret. İlgili uzmanları .codex/agents altındaki adlarıyla çağır.

- Kullanıcı akışı ve metinler için kese_ux, görsel düzen ve erişilebilirlik için kese_ui çalışır. Bağımsız incelemeler paralel yürüyebilir.
- Bakiye, borç, kart dönemi veya taksit hesapları etkileniyorsa kese_hesap örnek girdileri ve beklenen sonuçları çıkarır.
- kese_kod ilgili kararları birleştirerek uygulamayı değiştirir. Aynı dosyaya eşzamanlı düzenleme atama.
- kese_qa uygulamayı bağımsız doğrular. Sorun bulunursa kese_kod düzeltir ve kese_qa ilgili senaryoyu tekrar çalıştırır.

Örneğin “taksit girişini kolaylaştır” isteğinde UX hangi bilgilerin sorulacağını belirler. UI, “Aylık taksit tutarı (TL)” ile “Kalan taksit sayısı” alanlarını telefonda düzenler. Hesap uzmanı örnek ödeme planını çıkarır. Kod uzmanı değişikliği uygular. QA bir harcama kaydedip tekrar açarak hem formu hem kalan borcu doğrular.

Sonucu Türkçe bildir. Uygulanan değişikliği, denenmiş senaryoları ve doğrulanamayan noktaları belirt.
