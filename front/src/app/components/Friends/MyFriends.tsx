import React, { useEffect, useRef, useState } from "react"
import { FriendsClass } from "../../../api/friend"
import { useAuth } from "../shared/auth-context"
import { User, UserClass } from "../../../api/user"
import { ApiClient, ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"
import NotFound from "../shared/notfound"
import { setupWebSocket } from "../shared/websocket"
import { useNavigate } from "react-router-dom"
import { Route } from "../../constantes"

function MyFriends(){
    const [error, setErrors] = useState<ErrorMessage | null>(null)
    const [users, setUsers] = useState<User[]>([]);
    const [connected, setConnected] = useState<string[]>()
    const wsRef = useRef<WebSocket | null>(null);
    const {me} = useAuth()
    const navigate = useNavigate()

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

        const friendIds = Object.keys(me.friends);

        Promise.all(friendIds.map(fetchUser))
            .then(results => setUsers(results.filter(Boolean)))
            .catch(err => setErrors(err.message));
    }, [me?.friends_request]);

    const onReconnect = () => {
        openWebSocket();
    };
    
    const openWebSocket = React.useCallback(() => {
        const user = new ApiClient();
    
        setupWebSocket({
            wsUrl: `/online`,
            wsRef,
            authToken: user.getAuthToken(),
            handlers: {
                onOpen: () => {},
                onClose: () => {},
                onError: () => {},
                onMessage: {
                    ERROR(msg) {
                        alert(msg.error);
                        wsRef.current?.close();
                        return;
                    },
                    CONNECTED_CHANNEL(msg) {
                        onConnected(msg)
                    },
                }
            },
            onReconnect,
        });
    }, []);

    
    async function onConnected(msg: {type: string, token_connected_client: string[]}){
        setConnected(msg.token_connected_client)
    }
    

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
                <li className="clickable" key={user?._id} onClick={() => navigate(`${Route.friends}/${user?._id}`)}>
                    {user?.name} {user?.lastname}
                </li>
            ))}
            </ul>
        </div>
    )
}

export default MyFriends