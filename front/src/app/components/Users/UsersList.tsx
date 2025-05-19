import { useEffect, useRef, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { AdminUserClass, User } from "../../../api/user";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowUser, ShowUserButton } from "./SingleUser";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";

type UserListType = {
    message: string
}

function UserList({message}: UserListType){
    const [users, setUsers] = useState<User[] | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const navigate = useNavigate()
    const {me, isAdmin} = useAuth()


    useEffect(() => {
        (async () => {
            console.log('useEffect')
            const client = new AdminUserClass()
            const use = await client.getUsers()
            if(use){
                setUsers(use)
            } else {
                setNotFound(false)
            }
        })()
    }, [message])
    
    if(notFound){
        return <NotFound />
    }

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