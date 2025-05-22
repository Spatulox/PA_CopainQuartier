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

    const [refresh, setRefresh] = useState(0)

    useEffect(() => {
        (async ()=> {
            const client = new AdminUserClass()
            if(id){
                const use = await client.getUserByID(id)
                if(!use){
                    setNotFound(true)
                    return
                }
                setUser(use)
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
            await client.deleteUser(deleteId)
            setRefresh((r) => r+1)
            setDeleteId(null)
            setShowConfirm(false)
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteId(null);
    };

    const handleUpdate = async (id: string, option: object) => {
        if(isAdmin){
            const client = new AdminUserClass()
            await client.updateUserAdmin(id, option)
        } else {
            const client = new UserClass()
            await client.updateUser(id, option)
        }
        setRefresh((r) => r+1)
    }

    const handleApprove = async (id: string, bool: boolean) => {
        if(isAdmin){
            const client = new AdminUserClass()
            await client.verifyUser(id, {approve: bool})
        } else {
            return
        }
        setRefresh((r) => r+1)
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