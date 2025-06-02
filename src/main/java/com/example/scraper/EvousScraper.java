package com.example.scraper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class EvousScraper implements SiteScraper {
    private static final String BASE_URL = "https://www.evous.fr/paris/concerts/";

    @Override
    public void scrape() {
        try {
            int offset = 0;
            String lastFirstTitle = null;
            boolean hasMore = true;

            while (hasMore) {
                String pageUrl = offset == 0 ? BASE_URL : BASE_URL + "?debut_articles=" + offset;
                System.out.println("🔍 Scraping: " + pageUrl);

                Document doc = Jsoup.connect(pageUrl)
                        .userAgent("Mozilla/5.0")
                        .get();

                Elements eventElements = doc.select("h3.event-title");

                if (eventElements.isEmpty()) {
                    System.out.println("Plus d'événements trouvés. Fin.");
                    break;
                }

                Element first = eventElements.first().selectFirst("a");
                String currentFirstTitle = first != null ? first.text() : "";

                if (currentFirstTitle.equals(lastFirstTitle)) {
                    System.out.println("Détection de boucle. Arrêt du scraping.");
                    break;
                }

                lastFirstTitle = currentFirstTitle;

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

                offset += 10;
            }

            Database.flushToXml();

        } catch (Exception e) {
            System.err.println("Erreur scraping : " + e.getMessage());
        }
    }
}
