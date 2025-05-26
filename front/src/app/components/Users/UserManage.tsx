import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { AdminUserClass, User, UserClass, UserRole } from "../../../api/user";
import UserList from "./UsersList";
import ApproveUser from "./ApproveUser";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { UpdateUser, UpdateUserType, UpdateUserTypeAdmin } from "./UpdateUser";
import { PopupConfirm } from "../Popup/PopupConfirm";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";

function ManageUserAdmin(){
    const [message, setMessage] = useState("");
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };

    return <>
        <UserList message={message} />
        <ApproveUser onUpdate={handleUpdate} />
    </>
}

function ManageOneUser(){
    const { id } = useParams<{ id: string }>();
    const { me, isAdmin } = useAuth();
    const [user, setUser] = useState<User | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const navigate = useNavigate()

    const [err, setError] = useState<ErrorMessage | null>(null)
    const [updErr, setUpdateError] = useState<ErrorMessage | null>(null)
    const [delErr, setDeleteError] = useState<ErrorMessage | null>(null)

    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        (async ()=> {
            const client = new AdminUserClass()
            try{
                if(id){
                    const use = await client.getUserByID(id)
                    if(!use){
                        setNotFound(true)
                        return
                    }
                    setUser(use)
                }
                setError(null)
            }catch(e){
                setError(client.errors)
            }
        })()
    }, [id, refresh])

    const handleDelete = async (id: string) => {
        setDeleteId(id)
        setShowConfirm(true)
    }

    const confirmDelete = async () => {
        if (deleteId) {
            const client = new UserClass()
            try{
                await client.deleteUser(deleteId)
                setRefresh((r) => r+1)
                setDeleteId(null)
                setShowConfirm(false)
                setDeleteError(null)
            } catch(e){
                setDeleteError(client.errors)
            }
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async (id: string, option: object) => {
        if(isAdmin){
            const client = new AdminUserClass()
            try{
                await client.updateUserAdmin(id, option)
                setUpdateError(null)
            } catch(e){
                setUpdateError(client.errors)
            }
        } else {
            const client = new UserClass()
            try{
                await client.updateUser(id, option)
                setUpdateError(null)
            } catch(e){
                setUpdateError(client.errors)
            }
        }
        setRefresh((r) => r+1)
    }

    const handleApprove = async (id: string, bool: boolean) => {
        if(isAdmin){
            const client = new AdminUserClass()
            try{
                await client.verifyUser(id, {approve: bool})
                setUpdateError(null)
            } catch(e){
                setUpdateError(client.errors)
            }
        } else {
            return
        }
        setRefresh((r) => r+1)
    }
    
    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

    if(user === null){
        return <Loading title="Chargement de l'utilisateur" />
    }

    return <>
        {user && me ? 
            <>
            <UpdateUser
                key={user._id}
                theuser={user}
                user={me}
                APIerror={err}
                onUpdate={(id, option: UpdateUserType | UpdateUserTypeAdmin) => handleUpdate(id, option)}
                onApprove={(id: string, bool: boolean) => handleApprove(id, bool)}
                onDelete={(id)=> handleDelete(id)}
            />
            </>
        : (<Navigate to={Route.user} replace />)}
        {showConfirm && (
            <PopupConfirm
            key={deleteId}
            title="Suppression d'un utilisateur"
            description={`Voulez-vous réellement supprimer cet utilisateur : ${user.email} ?`}
            errors={delErr}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            />
        )}
    </>
}

function ManageUser(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    const { me, isAdmin } = useAuth();

    useEffect(() => {
        if (!isAdmin && !id) {
            navigate(`${Route.base}`);
        }
    }, [isAdmin, id, navigate]);

    if(id){
        return <ManageOneUser />
    }

    return <ManageUserAdmin />

}

export default ManageUser