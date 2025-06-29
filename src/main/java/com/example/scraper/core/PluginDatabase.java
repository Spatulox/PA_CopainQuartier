package com.example.scraper.core;

public interface PluginDatabase {
    void save(String title, String url, String date, String category);

    // Une classe statique imbriquée pour stocker l'instance (contourne la restriction Java)
    class Holder {
        private static PluginDatabase instance;
    }

    static void setInstance(PluginDatabase db) {
        Holder.instance = db;
    }

    static PluginDatabase getInstance() {
        return Holder.instance;
    }
}
