import { useEffect, useState } from "react";
import { ChatClass } from "../../../api/chat";
import { FieldForm, PopupForm } from "../Popup/PopupForm";
import { Activity, ActivityClass } from "../../../api/activity";
import './Chat.css';

type CreateProps = {
  action: () => void
  update: number
}

export function CreateChannel({action, update} : CreateProps){
  const [err, setErrors] = useState<any>()
  const [activity, setActivity] = useState<Activity[] | null>(null)
  
  type ChannelForm = {
    name: string;
    description: string;
  };

  useEffect(() => {
    (async ()=> {
      const client = new ActivityClass
      try{
        const act = await client.getMyActivitiesWithoutChannel({channel_chat_id: null})
        setActivity(act)
        setErrors([])
      } catch(e){
        setErrors(client.errors)
      }
    })()
  }, [update])

  function getActivityArrayToValueLabel(): { value: string; label: string }[]{
    return activity?.map((a:Activity) => ({value: a._id, label: a.title})) ?? []
  }

  const fields: FieldForm[] = [
    { name: "name", label: "Nom du channel", type: "text", required: true },
    { name: "description", label: "Description", type: "text", required: true },
    /*{ name: "type", label: "Type", type: "select", value: ["text", "vocal"], required: true },*/
    { name: "activity_id_linked", label: "Lier une Activité (optionnal)", type: "select", value: getActivityArrayToValueLabel(), required: false },
  ];

  async function handleCreateChannel(formData: ChannelForm): Promise<void> {
    const client = new ChatClass()
    try{
      const resp = await client.createChat(formData)
      if(resp){
        action()
      }
      setErrors([])
    } catch(e){
      setErrors(client.errors)
      throw client.errors
    }
  }

  return (
    <PopupForm<ChannelForm>
      title="Créer un channel"
      fields={fields}
      APIerrors={err}
      initialFormData={{ name: "", description: "" }}
      onSubmit={handleCreateChannel}
      submitLabel="Créer"
      buttonLabel="Créer un channel"
    />
  );
}