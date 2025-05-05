// app/pages/account.tsx

import { useEffect, useState } from "react";
import { Link, Links, useNavigate } from "react-router-dom";
import { ApiClient, User } from "../../api/client";
import Chat from "../components/ChatPage/ChatPage";
import Publications from "./publications";
import { Route } from "../constantes";

function Account(){
    const [user, setUserData] = useState<User>({} as User);
    const [errors, setErrors] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const client = new ApiClient();
                const userData = await client.getMe();
                setUserData(userData);
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
                    <p><Link to={Route.manageActivity}>Activités</Link></p>
                    <p><Link to={Route.managePublications}>Publications</Link></p>
                    <p><Link to={Route.manageTrocs}>Trocs</Link></p>
                    <p><Link to={Route.manageChannels}>Channnels</Link></p>
                </div>
                <div>
                    <Chat />
                </div>
            </div>
        )
    }
}

export default Account;
