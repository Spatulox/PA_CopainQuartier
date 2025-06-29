package com.example.scraper.plugins;

import com.example.scraper.core.Database;
import com.example.scraper.core.SiteScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public abstract class CategoryScraper implements SiteScraper {
    private final String baseUrl;
    private final String type;

    public CategoryScraper(String baseUrl, String type) {
        this.baseUrl = baseUrl;
        this.type = type;
    }

    @Override
    public void scrape() {
        try {
            int offset = 0;
            String lastFirstTitle = null;
            boolean hasMore = true;

            while (hasMore) {
                String pageUrl = offset == 0 ? baseUrl : baseUrl + "?debut_articles=" + offset;
                System.out.println("Scraping [" + type + "]: " + pageUrl);

                Document doc = Jsoup.connect(pageUrl).userAgent("Mozilla/5.0").get();
                Elements eventElements = doc.select("h3.event-title");

                if (eventElements.isEmpty()) break;

                Element first = eventElements.first().selectFirst("a");
                String currentFirstTitle = first != null ? first.text() : "";
                if (currentFirstTitle.equals(lastFirstTitle)) break;
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

                    Database.saveEvent(title, href, date, type, "evous.fr");
                }

                offset += 10;
            }

        } catch (Exception e) {
            System.err.println("Erreur scraping [" + type + "] : " + e.getMessage());
        }
    }
}
