import { useEffect, useState } from "react"
import { AdminUserClass, User } from "../../../api/user"
import Loading from "../shared/loading"
import { ShowUser, ShowUserButton } from "./SingleUser"

type ApproveUserType = {
  onUpdate: (message:string) => void
}

function ApproveUser({onUpdate}: ApproveUserType){
    const [user, setUser] = useState<User[]>([])
    const [me, setMe] = useState<User | null>(null)

    const handleApprove = async (troc_id: string, bool: boolean) => {
            const client = new AdminUserClass()
            const option = {"approve": bool}
            await client.verifyUser(troc_id, option)
            const app = await client.getUnverifiedUsers()
            setUser(app)
            onUpdate("update")
    }

    useEffect(() => {
        (async() => {
            const client = new AdminUserClass()
            const use = await client.getUnverifiedUsers()
            setUser(use)
            const me = await client.getMe()
            setMe(me)
        })()
    }, [])
    
    if(user && user.length == 0 && me == null){
        <Loading title="Chargement des utilisateur à approuver..." />
    }

    if(user && user.length == 0){
        return <p>Aucun utilisateur à approuver</p>
    }
    
    return <>
        <div>
            <h2>Approuver les utilisateurs</h2>
            {user && user.map((use) => (
                <ShowUser
                    key={use?._id}
                    theuser={use}
                    user={me}
                    onApprove={(handleApprove)}
                    buttonShow={ShowUserButton.Approve}
                />
            ))}
        </div>
    </>
}

export default ApproveUser