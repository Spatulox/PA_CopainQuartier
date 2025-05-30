import { useEffect, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { FieldForm, PopupForm } from "../Popup/PopupForm";
import { Activity, ActivityClass } from "../../../api/activity";

type CreatePublicationType = {
    onUpdate: (message:string) => void
}

function CreatePublication({onUpdate}: CreatePublicationType){
    const [err, setErrors] = useState<any>()
    const [activity, setActivity] = useState<Activity[]>()

    useEffect(() => {
        (async ()=> {
            const client = new ActivityClass
            try{
                const act = await client.getMyActivities()
                setActivity(act)
                setErrors([])
            } catch(e){
                setErrors(client.errors)
            }
        })()
    }, [])
    
    type PublicationForm = {
        name: string,
        description: string,
        body: string,
    };

    function getActivityArrayToValueLabel(): { value: string; label: string }[]{
        return activity?.map((a:Activity) => ({value: a._id, label: a.title})) ?? []
    }
    
    const fields: FieldForm[] = [
        { name: "name", label: "Nom de la publication", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "body", label: "Contenu", type: "textarea", required: true },
        { name: "activity_id", label: "Lier une Activité (optionnal)", type: "select", value: getActivityArrayToValueLabel(), required: false },
    ];
    

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