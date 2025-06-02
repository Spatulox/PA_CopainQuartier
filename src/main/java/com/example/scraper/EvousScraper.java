package com.example.scraper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class EvousScraper implements SiteScraper {
    private static final String URL = "https://www.evous.fr/paris/concerts/";

    @Override
    public void scrape() {
        try {
            Document doc = Jsoup.connect(URL)
                    .userAgent("Mozilla/5.0")
                    .get();

            Elements eventElements = doc.select("h3.event-title");

            for (Element h3 : eventElements) {
                Element link = h3.selectFirst("a");
                if (link == null) continue;

                String title = link.text();
                String href = link.absUrl("href");
                Element dateElement = h3.nextElementSibling();
                String date = (dateElement != null && dateElement.hasClass("date")) ? dateElement.text() : "Date non trouvée";

                System.out.println("🎵 Titre : " + title);
                System.out.println("🔗 Lien  : " + href);
                System.out.println("📅 Date  : " + date);
                System.out.println("--------------------------");

                Database.saveEvent(title, href, date, "concert", "evous.fr");
            }

        } catch (Exception e) {
            System.err.println("Erreur scraping : " + e.getMessage());
        }
    }
}
