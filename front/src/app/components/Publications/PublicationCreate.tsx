import { PublicationClass } from "../../../api/publications";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreatePublicationType = {
    onUpdate: (message:string) => void
}

function CreatePublication({onUpdate}: CreatePublicationType){

    const fields: FieldForm[] = [
        { name: "title", label: "Nom de la publication", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "contenu", label: "Contenu", type: "textarea", required: true },
    ];
    
    type ActivityForm = {
        title: string,
        description: string,
    };

    async function handleCreateChannel(formData: ActivityForm): Promise<void> {
        const client = new PublicationClass()
        if(true){
            alert("Publication créé !\nNom: " + formData.title + "\nDescription: " + formData.description);
            onUpdate("update")
        }
    }
    
    return (
    <PopupForm<ActivityForm>
        title="Créer une Publication"
        fields={fields}
        initialFormData={{ title: "", description: ""}}
        onSubmit={handleCreateChannel}
        submitLabel="Créer"
        buttonLabel="Créer une Publication"
    />
    );
}


export default CreatePublication