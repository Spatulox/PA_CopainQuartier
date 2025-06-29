package com.example.scraper.core;

import com.example.scraper.ui.Event;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;
import java.util.*;

public class Database {
    private static final String FILE_PATH = "events.xml";
    private static final List<RawEvent> events = new ArrayList<>();


    public static void saveEvent(String title, String url, String date, String type, String source) {
        for (int i = 0; i < events.size(); i++) {
            if (events.get(i).title.equalsIgnoreCase(title)) {
                events.set(i, new RawEvent(title, url, date, type, source));
                return;
            }
        }
        events.add(new RawEvent(title, url, date, type, source));
    }


    public static void flushToXml() {
        try {
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = dbFactory.newDocumentBuilder();
            Document doc = builder.newDocument();

            Element root = doc.createElement("events");
            doc.appendChild(root);

            for (RawEvent e : events) {
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

            System.out.println("Données XML écrites dans " + FILE_PATH);
        } catch (Exception e) {
            System.err.println("Erreur XML : " + e.getMessage());
        }
    }


    public static List<Event> loadFromXml(String typeFilter) {
        Map<String, Event> eventMap = new LinkedHashMap<>();

        try {
            File xmlFile = new File(FILE_PATH);
            if (!xmlFile.exists()) return Collections.emptyList();

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(xmlFile);
            doc.getDocumentElement().normalize();

            NodeList nodeList = doc.getElementsByTagName("event");
            for (int i = 0; i < nodeList.getLength(); i++) {
                Node node = nodeList.item(i);
                if (node.getNodeType() == Node.ELEMENT_NODE) {
                    Element el = (Element) node;

                    String type = el.getElementsByTagName("type").item(0).getTextContent();
                    if (!type.equalsIgnoreCase(typeFilter)) continue;

                    String title = el.getElementsByTagName("title").item(0).getTextContent();
                    String date = el.getElementsByTagName("date").item(0).getTextContent();
                    String url = el.getElementsByTagName("url").item(0).getTextContent();

                    eventMap.put(title.toLowerCase(), new Event(title, date, url));
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la lecture XML : " + e.getMessage());
        }

        return new ArrayList<>(eventMap.values());
    }


    private static class RawEvent {
        String title, url, date, type, source;

        RawEvent(String title, String url, String date, String type, String source) {
            this.title = title;
            this.url = url;
            this.date = date;
            this.type = type;
            this.source = source;
        }
    }
}
