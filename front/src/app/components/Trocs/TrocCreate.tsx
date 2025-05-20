import { TrocClass, TrocType } from "../../../api/troc";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreateTrocType = {
  onUpdate: (message:string) => void
}

enum RadioType {
    object = "Objet",
    service = "Un service",
    multipleService = "Un service pour plusieurs personnes"
}

enum RadioTypeToTrocType {
    service = "service",
    serviceMorethanOnePerson = "serviceMorethanOnePerson",
    item = "item"
}

function CreateTroc({onUpdate} : CreateTrocType){
    
    const fields: FieldForm[] = [
        { name: "title", label: "Nom du Troc", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "type", label: "type", type: "radio", value:[RadioType.object, RadioType.service, RadioType.multipleService], required: true },
    ];
    
    type TrocForm = {
        title: string,
        description: string,
        type: RadioType | RadioTypeToTrocType,
    };

    async function handleCreateChannel(formData: TrocForm): Promise<void> {
        const client = new TrocClass()
        console.log(formData)
        switch (formData.type){
            case RadioType.object:
                formData.type = RadioTypeToTrocType.item
                break;
            case RadioType.service:
                formData.type = RadioTypeToTrocType.service
                break;
            case RadioType.multipleService:
                formData.type = RadioTypeToTrocType.serviceMorethanOnePerson
                break;
        }
        console.log(formData)
        if(await client.createTroc(formData)){
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