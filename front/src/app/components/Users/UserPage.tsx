import { useEffect, useState } from "react"
import { AdminUserClass, User, UserClass } from "../../../api/user"
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ShowUser, ShowUserButton } from "./SingleUser";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import Errors from "../shared/errors";
import { ErrorMessage } from "../../../api/client";

function Users(){
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const { me, isAdmin } = useAuth();
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            if(id){
                if(!isAdmin){
                    const client = new UserClass()
                    try{
                        await client.refreshUser()
                        const use = await client.getUserByID(id)
                        if(!use){
                            setNotFound(true)
                            return
                        }
                        setNotFound(false)
                        setUser(use)
                        setErrors(null)
                    } catch(e){
                        setErrors(client.errors)
                    }
                } else if(isAdmin){
                    const client = new AdminUserClass()
                    try{
                        const use = await client.getUserByID(id)
                        if(!use){
                            setNotFound(true)
                            return
                        }
                        setNotFound(false)
                        setUser(use)
                        setErrors(null)
                    } catch(e){
                        setErrors(client.errors)
                    }
                }
            }
        })()
    }, [id, isAdmin])

    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }
    if(id == "me"){
        navigate(`${Route.user}`)
        return
    }

    if(!user && !me){
        return <Loading title="Chargement de l'utilisateur" />
    }

    if(!id && me){
        return <>
            {isAdmin && < Navigate to={Route.manageUser} />}
            {!isAdmin &&
            <Navigate to={Route.account} />}
        </>
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