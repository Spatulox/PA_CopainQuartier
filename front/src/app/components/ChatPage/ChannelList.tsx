import React from "react";
import { Link } from "react-router-dom";
import { Channel } from "../../../api/chat";

type Props = {
  channels: Channel[];
};

const ChannelList: React.FC<Props> = ({ channels }) => (
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
);

export default ChannelList;
