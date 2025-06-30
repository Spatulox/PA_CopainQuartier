package com.example.scraper.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.*;

public class Database {
    public static void saveEvent(List<Map<String, Object>> events, String fileName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(new File(fileName), events);
            System.out.println("Données JSON écrites dans " + fileName);
        } catch (Exception e) {
            System.err.println("Erreur JSON : " + e.getMessage());
        }
    }

    public static List<Map<String, Object>> loadFromJson(String fileName) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(new File(fileName),
                    new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            System.err.println("Erreur lors de la lecture JSON : " + e.getMessage());
            return Collections.emptyList();
        }
    }
}