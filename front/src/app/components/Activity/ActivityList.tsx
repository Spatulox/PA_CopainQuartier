import { act, useEffect, useState } from "react";
import { Activity, ActivityClass } from "../../../api/activity";
import CreateActivity from "./ActivityCreate";
import { User, UserClass } from "../../../api/user";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";
import { ShowActivity } from "./SimpleActivity";
import Loading from "../shared/loading";

type ActivityListMessage = {
    message: string
  }

function ActivityList({message}: ActivityListMessage){

    const [activity, setActivity] = useState<Activity[]>([])
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)


    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            const activities = await client.getActivities()
            setActivity(activities)

            const use = await client.getMe()
            setUser(use)
        })()
    }, [message])
    
    if(activity == null){
        return <Loading title="Chargement des activités" />
    }

    if(activity && activity.length == 0){
        return <>Aucune Activités trouvées</>
    }

    return <>
        <h2>Activités</h2>
        <section>
        {activity.map((acti) => (
            <ShowActivity
                activity={acti}
                user={user}
                onViewPublication={(pubId) => navigate(`${Route.publications}/${pubId}`)}
                onManage={(actId) => navigate(`${Route.manageActivity}/${actId}`)}
            />
        ))}
        
        </section>
    </>
}

export default ActivityList;