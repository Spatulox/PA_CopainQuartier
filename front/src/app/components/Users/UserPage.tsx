import { useEffect, useState } from "react"
import { AdminUserClass, User, UserClass } from "../../../api/user"
import { useNavigate, useParams } from "react-router-dom";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { Route } from "../../constantes";
import Loading from "../shared/loading";

function Users(){
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null)
    const [me, setMe] = useState<User | null>(null)
    const [isAdmin, setAdmin] = useState<boolean>(false)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            if(id){
                if(!isAdmin){
                    const client = new UserClass()
                    await client.refreshUser()
                    const use = await client.getUserByID(id)
                    if(isAdmin != client.isAdmin()){
                        setAdmin(client.isAdmin())
                        return
                    }
                    setUser(use)
                    const me = await client.getMe()
                    setMe(me)
                } else if(isAdmin){
                    const client = new AdminUserClass()
                    const use = await client.getUserByID(id)
                    setUser(use)
                    const me = await client.getMe()
                    setMe(me)
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