import { InternalServerError } from "routing-controllers";
import { config } from "../../Utils/config";
import { LangajeRequest } from "../../Validators/langaje";

export type Result = any[];
export async function requestDB(query: LangajeRequest): Promise<Result | null> {
  const response = await fetch(`${config.langajeUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( query ),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new InternalServerError(`Error executing query: ${errorText}`);
  }
  const data = await response.json();
  return data.result as Result;
}
