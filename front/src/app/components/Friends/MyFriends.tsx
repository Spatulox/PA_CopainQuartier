import { useEffect, useState } from "react"
import { FriendsClass } from "../../../api/friend"
import { useAuth } from "../shared/auth-context"
import { User, UserClass } from "../../../api/user"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"
import NotFound from "../shared/notfound"

function MyFriends(){
    const [error, setErrors] = useState<ErrorMessage | null>(null)
    const [users, setUsers] = useState<User[]>([]);
    const {me} = useAuth()

    useEffect(() => {
        if (!me?.friends) return;

        const fetchUser = async (id: string) => {
            const client = new UserClass()
            try {
                return await client.getUserByID(id)
            } catch (err) {
                console.error(err);
                setErrors(client.errors)
                return null;
            }
        };

        Promise.all(me.friends.map(fetchUser))
            .then(results => setUsers(results.filter(Boolean)))
            .catch(err => setErrors(err.message));
    }, [me?.friends_request]);


    if(error){
        return <Errors errors={error} />
    }

    if(users.length == 0){
        return <div>
            <h3>Mes contacts</h3>
            Pas de contacts
        </div>
    }

    return (
        <div>
            <h3>Mes contacts</h3>
            <ul>
            {users.map(user  => (
                <li key={user?._id}>
                    {user?.name} {user?.lastname}
                </li>
            ))}
            </ul>
        </div>
    )
}

export default MyFriends