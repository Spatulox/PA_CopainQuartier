import { useState } from "react";
import { TrocClass } from "../../../api/troc";
import { FieldForm, PopupForm } from "../Popup/PopupForm";
import { CreateFormData } from "../../../api/utils/formData";
import "./Trocs.css"

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
        { name: "image", label: "Image", type: "file"},
        { name: "type", label: "type", type: "radio", value:[RadioType.object, RadioType.service, RadioType.multipleService], required: true, id:"switch" },
        { name: "max_user", label: "Nombre maximum d'utilisateurs", type: "number", hide:true, id:"max_user"},
    ];
    
    type TrocForm = {
        title: string,
        description: string,
        image?: File | null,
        type: RadioType | RadioTypeToTrocType,
        reserved_at: string
        max_user: number | -1
    };

    function showHideMaxUser(e: React.MouseEvent<HTMLElement>) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'radio') {
            const input = target as HTMLInputElement;
            const max_user = document.getElementById("max_user");
            const servicePlusieursPersonnes = input.value === RadioType.multipleService;
            if (max_user) {
            max_user.style.display = servicePlusieursPersonnes ? "block" : "none";
            }
        }
    }

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
            const res = CreateFormData(formData)
            if(await client.createTroc(res)){
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
        initialFormData={{ title: "", description: "", type: RadioType.object, reserved_at: "", max_user: -1 }}
        onSubmit={handleCreateChannel}
        onClick={showHideMaxUser}
        submitLabel="Créer"
        buttonLabel="Créer un Troc"
    />
    );
}

export default CreateTroc