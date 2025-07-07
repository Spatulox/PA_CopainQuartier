import { ApiClient } from "./client";

export type Result = {
  message: string;
  query: string;
  rows: Array<{ id: number; name: string }>;
};

/**
 * Currently, Image are public accessible, so this is useless
 * But in the future, we may want to restrict access to images
 * This class is still usable to get the URL of the file
 */
export class FileClass extends ApiClient{
    protected url = "/file"

    getfullfilelink(path: string): string {
        return `${this.baseURL}/${path}`;
    }
}