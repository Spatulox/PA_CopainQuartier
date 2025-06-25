import { LangajeRequest } from "../../Validators/langaje";

export type Result = {
  message: string;
  query: string;
  rows: Array<{ id: number; name: string }>;
};

export async function requestDB(query: LangajeRequest): Promise<Result | null> {
    const placeholderResult: Result = {
        message: "Query executed successfully",
        query: "SELECT * FROM users",
        rows: [ { id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" } ]
    };
    return placeholderResult;
}