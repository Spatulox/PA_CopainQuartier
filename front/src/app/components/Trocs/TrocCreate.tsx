import { useState } from "react";
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
    const [err, setError] = useState<any>(null)
    
    const fields: FieldForm[] = [
        { name: "title", label: "Nom du Troc", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "type", label: "type", type: "radio", value:[RadioType.object, RadioType.service, RadioType.multipleService], required: true },
    ];
    
    type TrocForm = {
        title: string,
        description: string,
        type: RadioType | RadioTypeToTrocType,
        reserved_at: string
    };

    async function handleCreateChannel(formData: TrocForm): Promise<void> {
        const client = new TrocClass()
        try{
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
            if(await client.createTroc(formData)){
                onUpdate("update")
            }
            setError(null)
        } catch(e){
            setError(client.errors)
            throw client.errors
        }
    }
    
    return (
    <PopupForm<TrocForm>
        title="Créer un Troc"
        fields={fields}
        APIerrors={err}
        initialFormData={{ title: "", description: "", type: RadioType.object, reserved_at: "" }}
        onSubmit={handleCreateChannel}
        submitLabel="Créer"
        buttonLabel="Créer un Troc"
    />
    );
}

export default CreateTroc