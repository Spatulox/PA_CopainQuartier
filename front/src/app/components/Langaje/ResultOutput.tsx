import React from 'react';

export type Result = {
  message: string;
  query: string;
  rows: Array<{ id: number; name: string }>;
};

type Props = {
  result: Result[] | null;
};

export default function ResultOutput({ result }: Props){
  if (!result || result.length === 0) {
    return <div>Aucun résultat</div>;
  }

  return (
    <div>
      <h3>Historique des résultats :</h3>
      {result.map((res, idx) => (
        <div
          key={idx}
          className='result-item'>
          <div><strong>Requête :</strong> <pre>{res.query}</pre></div>
          <div><strong>Message :</strong> {res.message}</div>
          <div>
            <strong>Rows :</strong>
            <pre>{JSON.stringify(res.rows, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};