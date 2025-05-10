// app/pages/activity.tsx

import { useEffect, useRef, useState } from "react";
import ActivityList from "./ActivityList";
import CreateActivity from "./ActivityCreate";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { Activity, ActivityClass } from "../../../api/activity";
import { User } from "../../../api/user";


function ShowActivity(){
    const { id } = useParams<{ id: string }>();
    const [activity, setActivity] = useState<Activity>()
    const [user, setUser] = useState<User>()
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            if(id){
                const activity = await client.getActivityByID(id)
                const user = await client.getMe()
                setActivity(activity)
                setUser(user)
            }
        })()
    }, [id])


    if(!activity){
        return <>Loading</>
    }

    return <>
    
    {activity && id ?
        (
            <div key={activity._id}>
                <h2>{activity.title}</h2>
                <div>
                Créée le {new Date(activity.created_at).toLocaleDateString()}<br />
                Réservation : {new Date(activity.date_reservation).toLocaleString()}
                </div>
                <div>
                <strong>Description :</strong>
                <div>{activity.description}</div>
                </div>
                <div>
                <strong>Auteur :</strong> {activity.author_id?.name}
                </div>
                <div>
                <strong>Publication :</strong> {activity.publication?.name}
                <button onClick={() => navigate(`${Route.publications}/${activity.publication._id}`)}>Voir la Publication associée</button>
                {(activity.author_id?._id && activity.author_id?._id == user?._id ) ? <button onClick={() => navigate(`${Route.manageActivity}/${activity._id}`)}>Gérer l'activité</button> : ""}
                </div>
            </div>
        )
        
        :
        (
            <p>This Activity don't exist</p>
        )
    }

    </>
}


function ActivityComponent(){

    const [message, setMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const handleUpdate = (newMsg:string) => {
        setMessage(newMsg);
    };
    const navigate = useNavigate()

    if(id){
        return <><ShowActivity/></>
    }

    return <>
    <ActivityList message={message} />
    <div>
        <CreateActivity onUpdate={handleUpdate} />
        <button onClick={() => navigate(Route.manageMyActivity)}>Gérer mes Activités</button>
    </div>
    </>
}

export default ActivityComponent;