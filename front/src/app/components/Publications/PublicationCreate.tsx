import { useState } from "react";
import { PublicationClass } from "../../../api/publications";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreatePublicationType = {
    onUpdate: (message:string) => void
}

function CreatePublication({onUpdate}: CreatePublicationType){
    const [err, setErrors] = useState<any>()

    const fields: FieldForm[] = [
        { name: "name", label: "Nom de la publication", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "body", label: "Contenu", type: "textarea", required: true },
    ];
    
    type PublicationForm = {
        name: string,
        description: string,
        body: string,
    };

    async function handleCreateChannel(formData: PublicationForm): Promise<void> {
        const client = new PublicationClass()
        if(!client){return}
        try{
            await client.createPublication(formData)
            alert("Publication créé !\nNom: " + formData.name + "\nDescription: " + formData.description);
            onUpdate("update")
            setErrors([])
        } catch(e){
            setErrors(client.errors)
        }
    }
    
    return (
    <PopupForm<PublicationForm>
        title="Créer une Publication"
        fields={fields}
        APIerrors={err}
        initialFormData={{ name: "", description: "", body: ""}}
        onSubmit={handleCreateChannel}
        submitLabel="Créer"
        buttonLabel="Créer une Publication"
    />
    );
}


export default CreatePublication