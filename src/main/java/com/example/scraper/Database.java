package com.example.scraper;

import java.sql.*;

public class Database {
    private static final String URL = "jdbc:postgresql://localhost:5432/scraping";
    private static final String USER = "postgres";
    private static final String PASSWORD = "votre_mot_de_passe";

    public static void saveEvent(String title, String url, String date, String type, String source) {
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            String sql = "INSERT INTO events (title, url, date, type, source) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, title);
            stmt.setString(2, url);
            stmt.setString(3, date);
            stmt.setString(4, type);
            stmt.setString(5, source);
            stmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Erreur BDD : " + e.getMessage());
        }
    }
}
