import { TrocClass, TrocType } from "../../../api/Troc";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreateTrocType = {
  onUpdate: (message:string) => void
}

enum RadioType {
    object = "Objet",
    service = "Un service",
    multipleService = "Un service pour plusieurs personnes"
}

function CreateTroc({onUpdate} : CreateTrocType){
    
    const fields: FieldForm[] = [
        { name: "title", label: "Nom de l'activité", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "type", label: "type", type: "radio", value:[RadioType.object, RadioType.service, RadioType.multipleService], required: true },
    ];
    
    type TrocForm = {
        title: string,
        description: string,
        type: RadioType,
    };

    async function handleCreateChannel(formData: TrocForm): Promise<void> {
        const client = new TrocClass()
        if(await client.createTroc(formData)){
            alert("Activité créé !\nNom: " + formData.title + "\nDescription: " + formData.description);
            onUpdate("update")
        }
    }
    
    return (
    <PopupForm<TrocForm>
        title="Créer un Troc"
        fields={fields}
        initialFormData={{ title: "", description: "", type: RadioType.object }}
        onSubmit={handleCreateChannel}
        submitLabel="Créer"
        buttonLabel="Créer un Troc"
    />
    );
}

export default CreateTroc