import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowUser, ShowUserButton } from "./SimpleUser";
import { AdminUserClass, User } from "../../../api/user";
import UserList from "./UsersList";
import ApproveUser from "./ApproveUser";


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
    const [user, setUser] = useState<User | null>(null)
    const [me, setMe] = useState<User | null>(null)
    const navigate = useNavigate()
    useEffect(() => {
        (async ()=> {
            const client = new AdminUserClass()
            if(id){
                const use = await client.getUserByID(id)
                setUser(use)
            }
            const use = await client.getMe()
            setMe(use)
        })()
    }, [id])

    if(user === null){
        <Loading title="Chargement de la User" />
    }

    return <>

        <h1>EN TRAVAUX</h1>
        {user && me ?
            <ShowUser
                key={user._id}
                theuser={user}
                user={me}
                onViewUser={(id) => navigate(`${Route.user}/${id}`)}
                buttonShow={ShowUserButton.ViewUser}
            />
        :() => navigate(Route.user)}
    </>
}

function ManageUser(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new AdminUserClass()
            await client.refreshUser()
            const useAdmin = client.isAdmin()
            if (useAdmin === false) {
                navigate(`${Route.base}`);
            }
        })()
    }, [])


    if(id){
        return <><ManageOneUser /></>
    }

    return <>
        <ManageUserAdmin />
    </>

}

export default ManageUser