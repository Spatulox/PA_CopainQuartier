import { useState } from "react";
import { ActivityClass } from "../../../api/activity";
import { FieldForm, PopupForm } from "../Popup/PopupForm";
import { CreateFormData } from "../../../api/utils/formData";
import "./Activity.css"

type CreateActivityType = {
  onUpdate: (message:string) => void
}

function CreateActivity({onUpdate}: CreateActivityType){
    const [err, setErrors] = useState<any>()

    const fields: FieldForm[] = [
        { name: "title", label: "Nom de l'activité", type: "text", required: true },
        { name: "description", label: "Description", type: "text", required: true },
        { name: "location", label: "Lieu", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "hour", label: "Heure", type: "time", required: true },
        { name: "partial_date_end", label: "Date de fin", type: "date", required: true },
        { name: "hour_end", label: "Heure de fin", type: "time", required: true },
        { name: "max_place", label: "Nombre de Places", type: "number", required: true },
        { name: "image", label: "Image", type: "file"}
      ];
      
      type ActivityForm = {
        title: string,
        description: string,
        date_reservation: string,
        date: string,
        hour: string,
        date_end: string,
        partial_date_end: string,
        hour_end: string,
        location: string,
        max_place: number,
        image?: File | null
      };
    
      async function handleCreateActivity(formData: ActivityForm): Promise<void> {
        const client = new ActivityClass()
        try{
          formData.date_reservation = formData.date + "T" + formData.hour + ":00Z"
          formData.date_end = formData.partial_date_end + "T" + formData.hour_end + ":00Z"
          if(new Date(formData.date_end) < new Date(formData.date_reservation)){
            client.errors = "La date de fin doit se situer après la date de début"
            throw []
          }
          if(new Date(formData.date_reservation) <= new Date()){
            client.errors = "La date de début ne doit pas se situer dans le passé"
            throw []
          }
          const res = CreateFormData(formData)
          await client.createActivities(res)
          onUpdate("update")
          setErrors([])
        } catch(e){
          setErrors(client.errors)
          throw client.errors
        }
      }
      
      return (
        <PopupForm<ActivityForm>
          title="Créer une Activité"
          fields={fields}
          APIerrors={err}
          initialFormData={{ title: "", description: "", date_reservation: "", date: "", hour: "", date_end: "", partial_date_end: "", hour_end: "",  location: "", max_place: 0, image: null }}
          onSubmit={handleCreateActivity}
          submitLabel="Créer"
          buttonLabel="Créer une Activité"
        />
      );
}


export default CreateActivity