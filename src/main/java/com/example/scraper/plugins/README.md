# Héritage & Interfaces

Cette classe dérive de la classe abstraite Plugin.
Elle doit implémenter les méthodes suivantes :

    scrap() : Méthode principale de scraping qui récupère les données des événements.

    view(VBox box, List<Map<String, Object>> data) : Méthode d’affichage graphique des événements dans une interface JavaFX.

    name() : Retourne le nom du plugin.

    HeaderButton(Runnable refreshView) : Pour ajouter un bouton dans le header
    refreshView.run() permet de rafraichir l'affichage automatiquement

Vous pouvez importer le module Database permettant de sauvegarder des données sous forme de JSON

    Database.save(List<Map<String, Object>>, filename)    
    
    Database.loadFromJson(filename)

Vous pouvez importer le module InternetRequest permettant de réaliser des requêtes internet
    
    InternetRequest.getHtmlDocument()

# Fonctionnement
## Scraping

La méthode scrap() retourne une liste de données, chaque données étant représenté par une Map<String, Object>.
Cette méthode vous donne un scrapper implémentant les méthodes "scrap(url)" permettant de request une page HTML. Cela permet de ne pas dépendre de jsoup vous même, et de bénéficier des dernières mises à jour au niveau de la connexion à un site web.

## Affichage

La méthode view() prend en paramètre un VBox et la liste des événements. Cette méthode est utilisé pour afficher les résultats du scrapping:

## Nom & Catégorie

    name() : Retourne un string
    Utilisé pour différencier le plugin des autres plugins

    category() : Retourne un string
    Je sais pas encore
