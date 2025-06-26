// app/pages/account.tsx

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { ChannelList } from "../Chat/ChatList";
import { useAuth } from "../shared/auth-context";
import { UpdateAccount } from "./UpdateAccount";
import { useEffect, useState } from "react";
import Loading from "../shared/loading";
import { PopupConfirm } from "../Popup/PopupConfirm";
import { AccountClass } from "../../../api/account";
import Errors from "../shared/errors";
import MyFriendRequest from "../Friends/MyFriendsRequest";
import MyFriends from "../Friends/MyFriends";
import { ApiClient } from "../../../api/client";

function Account(){
    const { me } = useAuth();
    const navigate = useNavigate()
    const baseUrl = new ApiClient().baseURL
    if(me){
        return (
            <div>
                <div>
                    <h2>Account Informations</h2>
                    <img src={`${baseUrl}/${me.image_link}`} alt="pp" />
                    <p>Nom : {me?.lastname}</p>
                    <p>Prénom : {me?.name}</p>
                    <p>Téléphone : {me?.phone}</p>
                    <p>Email : {me?.email}</p>
                    <p>Addresse : {me?.address}</p>
                    <p>Role : {me?.role}</p>
                    <p>Score de confiance au Troc : {me?.troc_score}</p>
                </div>
                <button onClick={() => navigate(Route.manageMyAccount)}>Modifier mon compte</button>
                <div>
                    <h2>Gérer </h2>
                    <p><Link to={Route.manageMyActivity}>Activités</Link></p>
                    <p><Link to={Route.manageMyPublications}>Publications</Link></p>
                    <p><Link to={Route.manageMyTrocs}>Trocs</Link></p>
                    <p><Link to={Route.manageChannels}>Channels</Link></p>
                </div>
                <div>
                    <ChannelList/>
                </div>
                <div>
                    <MyFriends />
                    <MyFriendRequest />
                </div>
            </div>
        )
    } else {
        return <Errors errors={ {message: "Nothing to Show"} } />
    }
}

export function ManageMyAccount(){
    
    const navigate = useNavigate()
    const { me, isAdmin } = useAuth();

    const [showConfirm, setShowConfirm] = useState(false);
    const [err, setError] = useState<any | null>(null)
    const [delErr, setDeleteError] = useState<any | null>(null)
    const [updErr, setUpdateError] = useState<any | null>(null)

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.account}`);
        }
    }, [isAdmin, navigate]);


    if(!me){
        return <Loading title="Chargement des informations du compte"/>
    }

    const handleUpdate = async (id: string, option: object) => {
        const client = new AccountClass()
        try{
            if (id != me._id){
                return
            }
            await client.updateAccount(option)
            setUpdateError(null)
        } catch(e){
            setUpdateError(client.errors)
        }
    }
    
    const confirmDelete = async () => {
        const client = new AccountClass();
        try{
            await client.deleteAccount();
            setShowConfirm(false);
            setDeleteError(null)
        }catch(e){
            setDeleteError(client.errors)
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
    };

    return <>
        <UpdateAccount
            key={me.email}
            account={me}
            APIerror={updErr}
            onUpdate={handleUpdate}
            onDelete={() => setShowConfirm(true)}
        />
        {showConfirm && (
            <PopupConfirm
            key={me._id}
            title="Suppression de votre compte"
            description="Voulez-vous réellement supprimer votre compte ?"
            errors={delErr}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            />
        )}
    </>
}

export default Account;
