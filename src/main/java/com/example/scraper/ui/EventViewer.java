package com.example.scraper.ui;

import com.example.scraper.EvousScraper;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;

public class EventViewer {
    private final TableView<Event> table = new TableView<>();

    public BorderPane getView() {

        TableColumn<Event, String> titleCol = new TableColumn<>("Titre");
        titleCol.setCellValueFactory(data -> data.getValue().titleProperty());

        TableColumn<Event, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(data -> data.getValue().dateProperty());

        table.getColumns().addAll(titleCol, dateCol);
        table.setItems(loadData());


        Button scrapeButton = new Button("Lancer le scraping");
        scrapeButton.setOnAction(e -> {
            new EvousScraper().scrape();
            table.setItems(loadData());
        });


        BorderPane root = new BorderPane();
        root.setCenter(table);
        root.setBottom(scrapeButton);
        BorderPane.setMargin(scrapeButton, new Insets(10));

        return root;
    }

    private ObservableList<Event> loadData() {
        ObservableList<Event> data = FXCollections.observableArrayList();
        try {
            File xmlFile = new File("events.xml");
            if (!xmlFile.exists()) return data;

            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(xmlFile);
            NodeList events = doc.getElementsByTagName("event");

            for (int i = 0; i < events.getLength(); i++) {
                Element elem = (Element) events.item(i);
                String title = elem.getElementsByTagName("title").item(0).getTextContent();
                String date = elem.getElementsByTagName("date").item(0).getTextContent();
                data.add(new Event(title, date));
            }
        } catch (Exception e) {
            System.err.println("Erreur chargement XML : " + e.getMessage());
        }
        return data;
    }
}
