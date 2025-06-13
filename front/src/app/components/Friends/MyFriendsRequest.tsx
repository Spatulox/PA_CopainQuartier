import { useEffect, useState } from "react"
import { FriendsClass } from "../../../api/friend"
import { useAuth } from "../shared/auth-context"
import { User, UserClass } from "../../../api/user"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"

function MyFriendRequest(){
    const [error, setErrors] = useState<ErrorMessage | null>(null)
    const [users, setUsers] = useState<User[]>([]);

    const {me, updateConnection} = useAuth()

    useEffect(() => {
        if (!me?.friends_request) return;

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

        Promise.all(me.friends_request.map(fetchUser))
            .then(results => setUsers(results.filter(Boolean)))
            .catch(err => setErrors(err.message));
    }, [me?.friends_request]);

    async function handleAppoveContact(id: string | undefined){
        if(id == undefined){
            return
        }
        const client = new FriendsClass()
        try {
            await client.validateAFriendsRequest(id)
            setErrors(null)
            await updateConnection()
        } catch (e) {
            console.error(e)
            setErrors(client.errors)
        }
    }

    if(error){
        return <Errors errors={error} />
    }

    if(me?.friends_request && me?.friends_request.length > 0){
        return (
            <div>
                <h3>Demandes de contact</h3>
                <ul>
                {users.map(user  => (
                    <>
                    <li key={user?._id}>
                        {user?.name} {user?.lastname}
                    </li>
                    <button onClick={() => handleAppoveContact(user?._id)}>Accepter</button>
                    </>
                ))}
                </ul>
            </div>
        )
    } else {
        return
    }

}

export default MyFriendRequest