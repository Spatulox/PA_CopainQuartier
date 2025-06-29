package com.example.scraper.plugins;

import com.example.scraper.core.SiteScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class AgendaCulturelScraper implements SiteScraper {

    private static final String URL = "https://www.agendaculturel.fr";

    @Override
    public void scrape() {
        try {
            Document doc = Jsoup.connect(URL)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .referrer("https://www.google.com/")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(10000)
                    .get();


            Elements events = doc.select("div.event");

            for (Element event : events) {
                Element titleElement = event.selectFirst("h3 > a");
                if (titleElement != null) {
                    String title = titleElement.text();
                    String link = titleElement.absUrl("href");

                    System.out.println("Titre : " + title);
                    System.out.println("Lien  : " + link);
                    System.out.println("-------------------------");
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur : " + e.getMessage());
        }
    }
}
