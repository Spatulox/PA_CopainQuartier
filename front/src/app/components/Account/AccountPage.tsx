// app/pages/account.tsx

import { Link } from "react-router-dom";
import { Route } from "../../constantes";
import { ChannelList } from "../Chat/ChatList";
import { useAuth } from "../shared/auth-context";

function Account(){
    const { me } = useAuth();

    if(me){
        return (
            <div>
                <div>
                    <h2>Account Informations</h2>
                    <p>Nom : {me?.lastname}</p>
                    <p>Prénom : {me?.name}</p>
                    <p>Téléphone : {me?.phone}</p>
                    <p>Email : {me?.email}</p>
                    <p>Addresse : {me?.address}</p>
                    <p>Role : {me?.role}</p>
                    <p>Score de confiance au Troc : {me?.troc_score}</p>
                </div>
                <div>
                    <h2>Gérer </h2>
                    <p><Link to={Route.manageMyActivity}>Activités</Link></p>
                    <p><Link to={Route.manageMyPublications}>Publications</Link></p>
                    <p><Link to={Route.manageMyTrocs}>Trocs</Link></p>
                    <p><Link to={Route.manageChannels}>Channels</Link></p>
                </div>
                <div>
                    <ChannelList /*channels={channels}*//>
                </div>
            </div>
        )
    }
}

export default Account;
