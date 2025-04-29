package com.example.scraper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;

public class EvousScraper implements SiteScraper {

    private static final String URL = "https://www.evous.fr/paris/concerts/";

    @Override
    public void scrape() {
        try {

            Document doc = Jsoup.connect(URL)
                    .userAgent("Mozilla/5.0")
                    .get();

            System.out.println("✅ Page téléchargée ! Extraction des événements...\n");


            var eventElements = doc.select("h3.event-title");

            for (var h3 : eventElements) {
                var link = h3.selectFirst("a");
                var title = link.text();
                var href = link.absUrl("href");


                var dateElement = h3.nextElementSibling();
                String date = (dateElement != null && dateElement.hasClass("date")) ? dateElement.text() : "Date non trouvée";

                System.out.println("🎵 Titre : " + title);
                System.out.println("🔗 Lien  : " + href);
                System.out.println("📅 Date  : " + date);
                System.out.println("--------------------------");
            }

        } catch (IOException e) {
            System.err.println("Erreur lors du téléchargement : " + e.getMessage());

        }
    }

    public static void main(String[] args) {
        new EvousScraper().scrape();
    }
}
