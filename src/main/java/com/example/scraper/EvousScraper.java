package com.example.scraper;

public class EvousScraper implements SiteScraper {

    @Override
    public void scrape() {
        scrape("concert");
    }

    public void scrape(String category) {
        switch (category) {
            case "concert" -> new ConcertScraper().scrape();
            case "musee" -> new MuseeScraper().scrape();
            case "spectacle" -> new SpectacleScraper().scrape();
            default -> System.err.println("Catégorie inconnue : " + category);
        }

        Database.flushToXml();
    }
}
