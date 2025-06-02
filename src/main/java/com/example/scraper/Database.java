package com.example.scraper;

import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Database {
    private static final String FILE_PATH = "events.xml";
    private static final List<Event> events = new ArrayList<>();

    public static void saveEvent(String title, String url, String date, String type, String source) {
        events.add(new Event(title, url, date, type, source));
    }

    public static void flushToXml() {
        try {
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = dbFactory.newDocumentBuilder();
            Document doc = builder.newDocument();

            Element root = doc.createElement("events");
            doc.appendChild(root);

            for (Event e : events) {
                Element event = doc.createElement("event");

                Element titleElem = doc.createElement("title");
                titleElem.appendChild(doc.createTextNode(e.title));
                event.appendChild(titleElem);

                Element urlElem = doc.createElement("url");
                urlElem.appendChild(doc.createTextNode(e.url));
                event.appendChild(urlElem);

                Element dateElem = doc.createElement("date");
                dateElem.appendChild(doc.createTextNode(e.date));
                event.appendChild(dateElem);

                Element typeElem = doc.createElement("type");
                typeElem.appendChild(doc.createTextNode(e.type));
                event.appendChild(typeElem);

                Element sourceElem = doc.createElement("source");
                sourceElem.appendChild(doc.createTextNode(e.source));
                event.appendChild(sourceElem);

                root.appendChild(event);
            }

            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.transform(new DOMSource(doc), new StreamResult(new File(FILE_PATH)));

            System.out.println("✅ Données XML écrites dans " + FILE_PATH);
        } catch (Exception e) {
            System.err.println("Erreur XML : " + e.getMessage());
        }
    }

    // Classe interne pour stocker temporairement les données
    private static class Event {
        String title, url, date, type, source;

        Event(String title, String url, String date, String type, String source) {
            this.title = title;
            this.url = url;
            this.date = date;
            this.type = type;
            this.source = source;
        }
    }
}
