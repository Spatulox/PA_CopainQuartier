import { useEffect, useState } from "react"
import { AdminUserClass, User } from "../../../api/user"
import Loading from "../shared/loading"
import { ShowUser, ShowUserButton } from "./SingleUser"
import { useAuth } from "../shared/auth-context"
import NotFound from "../shared/notfound"
import { useNavigate } from "react-router-dom"
import { Route } from "../../constantes"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"

type ApproveUserType = {
  onUpdate: (message:string) => void
}

function ApproveUser({onUpdate}: ApproveUserType){
    const [user, setUser] = useState<User[]>([])
    const { me, isAdmin } = useAuth();
    const [notFound, setNotFound] = useState<boolean>(false)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()

    const handleApprove = async (troc_id: string, bool: boolean) => {
            const client = new AdminUserClass()
            try{
                const option = {"approve": bool}
                await client.verifyUser(troc_id, option)
                const app = await client.getUnverifiedUsers()
                if(!app){
                    setNotFound(true)
                    return
                }
                setNotFound(false)
                setUser(app)
                onUpdate("update")
                setErrors(null)
            } catch(e){
                setErrors(client.errors)
            }
    }

    useEffect(() => {
        (async() => {
            const client = new AdminUserClass()
            try{
                const use = await client.getUnverifiedUsers()
                setUser(use)
                setErrors(null)
            } catch(e){
                setErrors(client.errors)
            }
        })()
    }, [])
    
    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

    if(user && user.length == 0 && me == null){
        return <Loading title="Chargement des utilisateur à approuver..." />
    }

    if(user && user.length == 0){
        return <p>Aucun utilisateur à approuver</p>
    }
    
    return <>
        <div className="user-card">
            <h2>Approuver les utilisateurs</h2>
            {user && user.map((use) => (
                <ShowUser
                    key={use?._id}
                    theuser={use}
                    user={me}
                    onManage={() => navigate(`${Route.manageUser}/${use?._id}`)}
                    onApprove={(handleApprove)}
                    buttonShow={ShowUserButton.Approve | ShowUserButton.Manage}
                />
            ))}
        </div>
    </>
}

export default ApproveUser