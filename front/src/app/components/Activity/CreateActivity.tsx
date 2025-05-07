import { ActivityClass } from "../../../api/activity";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreateActivityType = {
  onUpdate: (message:string) => void
}

function CreateActivity({onUpdate}: CreateActivityType){
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
        const client = new ActivityClass
        formData.date_reservation = formData.date + "T" + formData.hour + ":00Z"
        if(await client.createActivities(formData)){
          alert("Activité créé !\nNom: " + formData.title + "\nDescription: " + formData.description);
          onUpdate("update")
        }
      }
      
      return (
        <PopupForm<ActivityForm>
          title="Créer une Activité"
          fields={fields}
          initialFormData={{ title: "", description: "", date_reservation: "", date: "", hour: "" }}
          onSubmit={handleCreateChannel}
          submitLabel="Créer"
          buttonLabel="Créer une Activité"
        />
      );
}


export default CreateActivity