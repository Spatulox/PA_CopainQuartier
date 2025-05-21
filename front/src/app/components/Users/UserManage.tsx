import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { AdminUserClass, User, UserClass, UserRole } from "../../../api/user";
import UserList from "./UsersList";
import ApproveUser from "./ApproveUser";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { UpdateUser, UpdateUserType, UpdateUserTypeAdmin } from "./UpdateUser";

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
        const client = new UserClass()
        await client.deleteUser(id)
        setRefresh((r) => r+1)
    }

    const handleUpdate = async (id: string, option: object) => {
        if(isAdmin){
            const client = new AdminUserClass()
            await client.updateUser(id, option)
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

        <h1>EN TRAVAUX</h1>
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
        :() => navigate(Route.user)}
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
        return <><ManageOneUser /></>
    }

    return <>
        <ManageUserAdmin />
    </>

}

export default ManageUser