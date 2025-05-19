import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { AdminUserClass, User } from "../../../api/user";
import UserList from "./UsersList";
import ApproveUser from "./ApproveUser";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";

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
    }, [id])

    const handleDelete = (id: string) => {
        console.log(id)
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
            <ShowUser
                key={user._id}
                theuser={user}
                user={me}
                onViewUser={(id) => navigate(`${Route.user}/${id}`)}
                onDelete={handleDelete}
                buttonShow={ShowUserButton.ViewUser | ShowUserButton.Delete}
            />
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