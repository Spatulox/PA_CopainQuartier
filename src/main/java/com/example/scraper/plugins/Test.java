package com.example.scraper.plugins;
import com.example.scraper.core.ScraperPlugin;

import java.util.*;

public class Test implements ScraperPlugin {

    @Override
    public List<Map<String, Object>> scrap() {
        List<Map<String, Object>> events = new ArrayList<>();

        // Données factices
        Map<String, Object> event1 = new HashMap<>();
        event1.put("title", "Match de Football");
        event1.put("url", "https://pariseventicket.com/football");
        event1.put("date", "2025-07-15");
        events.add(event1);

        Map<String, Object> event2 = new HashMap<>();
        event2.put("title", "Concert");
        event2.put("url", "https://pariseventicket.com/concert");
        event2.put("date", "2025-08-20");
        events.add(event2);

        return events;
    }

    @Override
    public void view(String[] args) {
        System.out.println("Méthode view appelée");
    }

    @Override
    public String name() {
        return "ParisEventTicket";
    }

    @Override
    public String category() {
        return "sport";
    }
}
