import React, { useState } from 'react';
import ResultOutput from './ResultOutput';
import { AdminLangajeClass, Result } from '../../../api/langaje';
import { ErrorMessage } from '../../../api/client';
import Errors from '../shared/errors';

export default function Langaje() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result[] | null>(null);
  const [errors, setErrors] = useState<ErrorMessage>();

  async function requestDB() {
    if (!query.trim()) {
      return;
    }
    const client = new AdminLangajeClass();
    try {
      const data = await client.requestLangaje(query);
      if(data) {
        setResult(prev => prev ? [data, ...prev] : [data]);
        setQuery('');
      }
    } catch (error) {
      setErrors(client.errors)
    }
  }

  return (<>
      <div>
        <Errors errors={errors} />
      </div>
      <div>
        <label htmlFor="sql-input"><strong>Votre requête SQL :</strong></label>
        <textarea
          id="sql-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ecrivez votre requête SQL ici..."
        />
        <button onClick={requestDB}>
          Exécuter
        </button>
        <ResultOutput result={result} />
      </div>
    </>
  );
}