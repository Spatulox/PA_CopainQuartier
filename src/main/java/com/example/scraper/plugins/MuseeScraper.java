package com.example.scraper.plugins;

public class MuseeScraper extends CategoryScraper {
    public MuseeScraper() {
        super("https://paris.evous.fr/musees-de-paris/", "musee");
    }
}
