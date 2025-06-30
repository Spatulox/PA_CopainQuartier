# Héritage & Interfaces

Cette classe dérive de la classe abstraite ScraperPlugin.
Elle doit implémenter les méthodes suivantes :

    scrap() : Méthode principale de scraping qui récupère les données des événements.

    view(VBox box, List<Map<String, Object>> data) : Méthode d’affichage graphique des événements dans une interface JavaFX.

    name() : Retourne le nom du plugin.

    category() : Retourne la catégorie du plugin (ex : "sport").

# Fonctionnement
## Scraping

La méthode scrap() retourne une liste de données, chaque données étant représenté par une Map<String, Object>.
Cette méthode vous donne un scrapper implémentant les méthodes "scrap(url)" permettant de request une page HTML.

## Affichage

La méthode view() prend en paramètre un VBox et la liste des événements. Cette méthode est utilisé pour afficher les résultats du scrapping:

## Nom & Catégorie

    name() : Retourne un string
    Utilisé pour différencier le plugin des autres plugins

    category() : Retourne un string
    Je sais pas encore
