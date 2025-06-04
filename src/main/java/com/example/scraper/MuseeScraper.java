package com.example.scraper;

public class MuseeScraper extends CategoryScraper {
    public MuseeScraper() {
        super("https://paris.evous.fr/musees-de-paris/", "musee");
    }
}
