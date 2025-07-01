import React, { useState } from "react";
import ResultOutput from "./ResultOutput";
import { AdminLangajeClass, Result } from "../../../api/langaje";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";
import "./Langaje.css";

const preBuiltQueries = [
  {
    name: "Toutes les publications",
    query: "publications",
  },
  {
    name: "Filter par date",
    query: 'publications IF updated_at > 2025-06-15',
  },
  {
    name: "Filtrer par taille",
    query: "publications IF len(body) > 450",
  },
  {
    name: 'Nombre de caractères dans le prénom de l\'auteur pair',
    query: "publications IF len(author.name) % 2 = 0",
  },
  {
    name: "Publications aléatoires",
    query: "publications IF random_int(4) = 0",
  },
  {
    name: "Match avec regex",
    query: 'publications IF author.name MATCHES "\\w{8}" AND len(body) > 450',
  },
  {
    name: "Projection, tri et limite",
    query: "publications SORT created_at LIMIT 10 PROJECT {author.name, body}",
  },
  {
    name: "Nom complet de l'auteur et taille du contenu de la publication",
    query: "publications PROJECT {full_name: author.name + \" \" + author.lastname, content_size: len(body)}",
  },
  {
    name: "Requête complexe",
    query:"publications IF len(body) > 250 AND NOT (author.name MATCHES U) SORT updated_at LIMIT 100 PROJECT {author: author.name + \" \" + author.lastname , body, body_size: len(body)}" ,
  }
];

export default function Langaje() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result[] | null>(null);
  const [errors, setErrors] = useState<ErrorMessage>();

  async function requestDB() {
    if (!query.trim()) {
      return;
    }
    const client = new AdminLangajeClass();
    try {
      const data = await client.requestLangaje(query);
      if (data) {
        setResult((prev) => (prev ? [data, ...prev] : [data]));
        setQuery("");
      }
    } catch (error) {
      setErrors(client.errors);
    }
  }

  return (
    <>
      <div>
        <Errors errors={errors} />
      </div>
      <div>
        <label style={{ marginRight: "1rem" }} htmlFor="sql-input">
          <strong>Votre requête</strong>
        </label>
        <select
          value="Choisissez une requête pré-construite"
          onChange={(e) => {
            const selectedQuery = preBuiltQueries.find(
              (q) => q.name === e.target.value
            );
            if (selectedQuery) {
              setQuery(selectedQuery.query);
            }
          }}
        >
          <option disabled>Choisissez une requête pré-construite</option>
          {preBuiltQueries.map((q) => (
            <option key={q.name} value={q.name}>
              {q.name}
            </option>
          ))}
        </select>
        <div>
          <textarea
            id="sql-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ecrivez votre requête ici..."
          />
        </div>
        <button onClick={requestDB}>Exécuter</button>
        <ResultOutput result={result} />
      </div>
    </>
  );
}
