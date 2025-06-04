package com.example.scraper;

public class ConcertScraper extends CategoryScraper {
    public ConcertScraper() {
        super("https://www.evous.fr/paris/concerts/", "concert");
    }
}
