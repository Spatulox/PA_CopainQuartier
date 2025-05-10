import { ApiClient } from "./client";

type ExampleType = {
    name: string,
    description: string
}

export class Example extends ApiClient {

    private url = "/example"

    // The "super" constructor is mandatory
    // This ensure you always call the right api url : https://domain.com/ and not "https://donain.kon/" by mistake
    // The Class still works the same as ApiClient :
    //  1rst method : (to connect the user)
    //      const client = new Example(username, password)
    //      await client.connect() // it's mandatory to retrieve the credential of the user (but it's only done one time when connecting, so you should never use it)
    //  2nd method : (when already connected)
    //      const client = new Example() // username & password are not mandatory if there's already saved credentials
    //      await client.connect() // it's useless since credential are saved inside the localStorage of the bowser
    // You can check the state of the connection by used client.isConnected(), this will only check if the localStorage contain the credentials


    // Some Request functions already exist :
    //  this.Get()
    //  this.Post()
    //  this.Put()
    //  this.Patch()
    //  this.Delete()
    // They handle automatic connection and jwt refresh token when needed
    // You must use it to ensure proper connection.

    // In case you need something more specific, you still can use the basic axios request like that :
    //  this.client.get()
    //  this.client.post()
    //  this.client.put()
    //  this.client.patch()
    //  this.client.delete()

    // Request example :
    async getExemple(): Promise<ExampleType> {
        return await this.Get(this.url)
    }

    async getExempleById(id: string): Promise<ExampleType> {
        return await this.Get(`${this.url}/${id}`)
    }

    async postExemple(data: any): Promise<ExampleType> {
        return await this.Post(`${this.url}/create`, data)
    }

    async postExempleAxios(data: any): Promise<ExampleType> {
        // This will work too, unless if the token is expired, it will not handle it
        return await this.client.post(`${this.url}/create`, data)
    }
}