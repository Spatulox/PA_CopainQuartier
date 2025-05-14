import { ChatClass } from "../../../api/chat";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type CreateProps = {
  action: () => void
}

export function CreateChannel({action} : CreateProps){
  const fields: FieldForm[] = [
    { name: "name", label: "Nom du channel", type: "text", required: true },
    { name: "description", label: "Description", type: "text", required: true },
    { name: "type", label: "Type", type: "select", value: ["text", "vocal"], required: true },
  ];
  
  type ChannelForm = {
    name: string;
    description: string;
  };

  async function handleCreateChannel(formData: ChannelForm): Promise<void> {
    const client = new ChatClass()
    const resp = await client.createChat(formData)
    if(resp){
      action()
    }
  }

  return (
    <PopupForm<ChannelForm>
      title="Créer un channel"
      fields={fields}
      initialFormData={{ name: "", description: "" }}
      onSubmit={handleCreateChannel}
      submitLabel="Créer"
      buttonLabel="Créer un channel"
    />
  );
}