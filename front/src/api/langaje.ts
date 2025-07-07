import { ApiClient } from "./client";

export type Result = {
  query: string;
  rows: Record<string, any>[];
};

export class AdminLangajeClass extends ApiClient {
  protected urlAdmin = "/admin/langaje";

  constructor() {
    super();
    this.refreshUser().then(() => {
      if (!this.isAdmin()) {
        throw new Error("User is not admin");
      }
    });
  }

  async requestLangaje(query: string): Promise<Result> {
    const rows = await this.Post(this.urlAdmin, { query });
    return {
      query,
      rows,
    };
  }
}
