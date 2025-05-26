import { useState } from "react";
import { ActivityClass } from "../../../api/activity";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreateActivityType = {
  onUpdate: (message:string) => void
}

function CreateActivity({onUpdate}: CreateActivityType){
    const [err, setErrors] = useState<any>()
    const fields: FieldForm[] = [
        { name: "title", label: "Nom de l'activité", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "hour", label: "Heure", type: "time", required: true },
      ];
      
      type ActivityForm = {
        title: string,
        description: string,
        date_reservation: string,
        date: string,
        hour: string,
      };
    
      async function handleCreateChannel(formData: ActivityForm): Promise<void> {
        const client = new ActivityClass()
        try{
          formData.date_reservation = formData.date + "T" + formData.hour + ":00Z"
          await client.createActivities(formData)
          onUpdate("update")
        } catch(e){
          setErrors(client.errors)
        }
      }
      
      return (
        <PopupForm<ActivityForm>
          title="Créer une Activité"
          fields={fields}
          APIerrors={err}
          initialFormData={{ title: "", description: "", date_reservation: "", date: "", hour: "" }}
          onSubmit={handleCreateChannel}
          submitLabel="Créer"
          buttonLabel="Créer une Activité"
        />
      );
}


export default CreateActivity