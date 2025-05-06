import { Link } from "react-router-dom";
import { Channel, ChatClass } from "../../../api/chat";
import { User } from "../../../api/user";
import { FieldForm, PopupForm } from "../Popup/PopupForm";

type ListProps = {
  channels: Channel[];
  action: (channel_id:string, user_id: string | undefined) => void;
  user : User
};

type CreateProps = {
  action: () => void
}

type ListSimpleProps = {
  channels: Channel[];
};

export function ChannelList({ channels }: ListSimpleProps) {
  return (
  <div>
    <h2>Mes channels</h2>
    {channels.length === 0 ? (
      <p>Aucun channel trouvé.</p>
    ) : (
      channels.map((channel) => (
        <p key={channel._id}>
          <Link to={`/chat/${channel._id}`}>{channel.name}</Link>
        </p>
      ))
    )}
  </div>
  )
}

export function ManageChannelList({ channels, action, user }: ListProps) {
  return (
  <div>
    <h2>Mes channels</h2>
    {channels.length === 0 ? (
      <p>Aucun channel trouvé.</p>
    ) : (
      channels.map((channel) => (
        <p key={channel._id}>
          <button><Link to={`/chat/${channel._id}`}>{channel.name}</Link></button>
          <span>{channel.description}</span>
          <button onClick={()=>action(channel._id, user?._id)}>
              {user?._id == channel.admin_id ? "Supprimer le Chat" : "Quitter le Chat"}
          </button>
        </p>
      ))
    )}
  </div>
  )
};


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
    alert("Channel créé !\nNom: " + formData.name + "\nDescription: " + formData.description);
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