import { useEffect, useState } from "react";
import { Activity, ActivityClass } from "../../../api/activity";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";

type ActivityListMessage = {
    message: string
    limit?: number
}

function ActivityList({message, limit}: ActivityListMessage){
    const { me } = useAuth();

    const [activity, setActivity] = useState<Activity[]>([])
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            const activities = await client.getActivities()
            setActivity(activities)
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
            {activity
            .slice(0, limit ?? activity.length)
            .map((acti) => (
                <ShowActivity
                    key={acti._id}
                    activity={acti}
                    user={me}
                    onViewPublication={(pubId) => navigate(`${Route.publications}/${pubId}`)}
                    onManage={(actId) => navigate(`${Route.manageActivity}/${actId}`)}
                    buttonShow={ShowActivityButton.All}
                />
            ))}
        </section>
    </>
}

export default ActivityList;