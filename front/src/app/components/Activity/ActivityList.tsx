import { useEffect, useState } from "react";
import { Activity, ActivityClass } from "../../../api/activity";
import { Route } from "../../constantes";
import { useNavigate } from "react-router-dom";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";
import "./Activity.css"
import CreateActivity from "./ActivityCreate";
import { useLocation } from "react-router-dom";

type ActivityListMessage = {
    limit?: number
    buttonView?: boolean
}

function ActivityList({limit, buttonView}: ActivityListMessage){
    const { me } = useAuth();

    const [activity, setActivity] = useState<Activity[] | null>(null)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const [resfresh, setRefresh] = useState<number>(0)
    const location = useLocation();

    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            try{
                const activities = await client.getActivities()
                setActivity(activities)
                setErrors(null)
            } catch(e){
                setErrors(client.errors)
            }
        })()
    }, [resfresh])
    
    if(err != null){
        return <Errors errors={err} />
    }

    if(activity == null){
        return <Loading title="Chargement des activités" />
    }

    if(activity && activity.length == 0){
        if(location.pathname ===  Route.base){
            return <p>Aucune Activités trouvées</p>
        }else {
            return <>
                <div className="activity-buttons">
                    <CreateActivity onUpdate={() => setRefresh(r => r + 1)}/>
                    <button onClick={() => navigate(Route.manageMyActivity)}>
                        Gérer mes Activités
                    </button>
                </div>
                <p>Aucune Activités trouvées</p>
            </>
        }
    }

    return <>
    <h2>Activités</h2>
    {buttonView != false && (
        <div className="activity-buttons">
            <CreateActivity onUpdate={() => setRefresh(r => r + 1)} />
            <button onClick={() => navigate(Route.manageMyActivity)}>
                Gérer mes Activités
            </button>
        </div>
    )}

    <div className="activity-section">
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
    </div>
    </>
}

export default ActivityList;