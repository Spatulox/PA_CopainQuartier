import { ObjectID } from "../DB_Schema/connexion";
import { Channel, FilledChannel } from "./ChannelModel";

export type Invite = {
    _id: ObjectID,
    channel_id: ObjectID,
}

// string here is normal
export type PublicInvite = {
    _id: string,
    channel_id: string
}

export type FilledInvite = Omit<Invite, "channel_id"> & { channel: FilledChannel | Channel | null}