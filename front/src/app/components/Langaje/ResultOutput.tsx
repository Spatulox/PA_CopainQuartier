import React from "react";
import { Result } from "../../../api/langaje";
type Props = {
  result: Result[] | null;
};

export default function ResultOutput({ result }: Props) {
  if (!result || result.length === 0) {
    return <div>Aucun résultat</div>;
  }

  return (
    <div className="langaje-result-display">
      <h3>Historique des résultats :</h3>
      {result.map((res, idx) => (
        <div key={idx} className="result-item">
          <div>
            <strong >Requête :</strong> <pre className="langaje-result-row">{res.query}</pre>
          </div>
          <div>
            <strong>Rows :</strong>
            <pre className="langaje-result-row">{JSON.stringify(res.rows, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
