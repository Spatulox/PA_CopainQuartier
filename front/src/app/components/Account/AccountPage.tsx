// app/pages/account.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClient} from "../../../api/client";
import { ChatClass } from "../../../api/chat";
import { Route } from "../../constantes";
import { ChannelList } from "../Chat/ChatList";
import { Channel } from "../../../api/chat";
import { User } from "../../../api/user";

function Account(){
    const [user, setUserData] = useState<User>({} as User);
    const [errors, setErrors] = useState<string[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const client = new ApiClient();
                const chat = new ChatClass() 
                const userData = await client.getMe();
                const channels = await chat.getChannel()
                setUserData(userData);
                setChannels(channels)
            } catch (error) {
                setErrors(["Erreur lors de la récupération du profil"]);
            }
        };

        fetchUser();
    }, []);

    if(user){
        return (
            <div>
                <div>
                    <h2>Account Informations</h2>
                    <p>Nom : {user?.lastname}</p>
                    <p>Prénom : {user?.name}</p>
                    <p>Téléphone : {user?.phone}</p>
                    <p>Email : {user?.email}</p>
                    <p>Addresse : {user?.address}</p>
                    <p>Role : {user?.role}</p>
                    <p>Score de confiance au Troc : {user?.troc_score}</p>
                </div>
                <div>
                    <h2>Gérer </h2>
                    <p><Link to={Route.manageMyActivity}>Activités</Link></p>
                    <p><Link to={Route.manageMyPublications}>Publications</Link></p>
                    <p><Link to={Route.manageMyTrocs}>Trocs</Link></p>
                    <p><Link to={Route.manageChannels}>Channels</Link></p>
                </div>
                <div>
                    <ChannelList channels={channels}/>
                </div>
            </div>
        )
    }
}

export default Account;
