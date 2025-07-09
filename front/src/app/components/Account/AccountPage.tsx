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
import { useTheme } from "../shared/theme";


function Account(){
    const { me } = useAuth();
    const navigate = useNavigate()
    const baseUrl = new ApiClient().baseURL
    const [theme, setTheme] = useTheme();

    if(me){
        return (
            <div className="account-container">
                <div className="account-details">
                    <h2>Informations du compte</h2>
                    <img src={`${baseUrl}/${me.image_link}`} alt="pp" />
                    <div className="account-info">
                        <p><span>Prénom :</span> {me.name}</p>
                        <p><span>Nom :</span> {me.lastname}</p>
                        <p><span>Email :</span> {me.email}</p>
                        <p><span>Téléphone :</span> {me.phone || "Non renseigné"}</p>
                        <p><span>Adresse :</span> {me.address || "Non renseignée"}</p>
                        <p><span>Rôle :</span> {me.role}</p>
                    </div>
                </div>
                <div className="account-actions">
                    <button onClick={() => navigate(Route.manageMyAccount)}>Modifier mon compte</button>
                    <Link to={Route.manageMyActivity}>Activités</Link>
                    <Link to={Route.manageMyPublications}>Publications</Link>
                    <Link to={Route.manageMyTrocs}>Trocs</Link>
                    <Link to={Route.manageChannels}>Channels</Link>
                </div>
                <div className="theme-select">
                    <label htmlFor="theme-select">Thème :</label>
                    <select
                    id="theme-select"
                    value={theme}
                    onChange={e => setTheme(e.target.value as "light" | "dark")}
                    >
                    <option value="light">Light mode</option>
                    <option value="dark">Dark mode</option>
                    </select>
                </div>
                <div className="channels-section">
                    <ChannelList />
                </div>
                <div className="friends-section">
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
