import { useEffect, useRef, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { AdminUserClass, User } from "../../../api/user";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowUser, ShowUserButton } from "./SimpleUser";
import Loading from "../shared/loading";

type UserListType = {
    message: string
}

function UserList({message}: UserListType){
    const [users, setUsers] = useState<User[] | null>(null)
    const [me, setMe] = useState<User>(null)
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            console.log('useEffect')
            const client = new AdminUserClass()
            const me = await client.getMe()
            const use = await client.getUsers()
            if(use){
                setUsers(use)
            }
            if(me){
                setMe(me)
            }
        })()
    }, [message])

    if (users === null) {
        return <Loading title="Chargement des utilisateurs" />
    }

    if(users.length == 0){
        return <p>Pas d'utilisateurs trouvés...</p>
    }

    return <>
        <div>
            <h2>Utilisateurs</h2>
            <section>{me && users && users
            .map((use) => (
                    <ShowUser
                        key={use?._id}
                        theuser={use}
                        user={me}
                        onViewUser={(id) => navigate(`${Route.user}/${id}`)}
                        onManage={(id) => navigate(`${Route.manageUser}/${id}`)}
                        buttonShow={ShowUserButton.ViewUser | ShowUserButton.Manage}
                    />
                ))}</section>
        </div>
    </>
}

export default UserList;