import { useEffect, useState } from "react"
import { AdminUserClass, User, UserClass } from "../../../api/user"
import { useNavigate, useParams } from "react-router-dom";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";

function Users(){
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null)
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            if(id){
                if(!isAdmin){
                    const client = new UserClass()
                    await client.refreshUser()
                    const use = await client.getUserByID(id)
                    setUser(use)
                } else if(isAdmin){
                    const client = new AdminUserClass()
                    const use = await client.getUserByID(id)
                    setUser(use)
                }
            }
        })()
    }, [id, isAdmin])

    if(!user && !me){
        return <Loading title="Chargement de l'utilisateur" />
    }

    if(!user && me){
        return <p>Cet utilisateur n'existe pas</p>
    }

    const handleDelete = (id: string) => {
        console.log(id)
    }

    const handleApprove = (id: string, bool: boolean) => {
        console.log(id)
    }

    return <>
        <ShowUser
        theuser={user}
        user={me}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onManage={(id) => navigate(`${Route.manageUser}/${id}`)}
        buttonShow={ShowUserButton.Approve | ShowUserButton.Manage}
        />
    </>
}

export default Users