// app/pages/activity.tsx

import { useEffect, useState } from "react";
import ActivityList from "./ActivityList";
import CreateActivity from "./ActivityCreate";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { Activity, ActivityClass } from "../../../api/activity";
import { User } from "../../../api/user";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
import Loading from "../shared/loading";


function ShowActivityPage() {
    const { id } = useParams<{ id: string }>();
    const [activity, setActivity] = useState<Activity>();
    const [user, setUser] = useState<User>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const client = new ActivityClass();
            if (id) {
                const activity = await client.getActivityByID(id);
                const user = await client.getMe();
                setActivity(activity);
                setUser(user);
            }
        })();
    }, [id]);

    if (!activity) {
        return <Loading title="Chargement de l'activité" />;
    }

    return (
        <ShowActivity
            activity={activity}
            user={user}
            onViewPublication={(pubId) => navigate(`${Route.publications}/${pubId}`)}
            onManage={(actId) => navigate(`${Route.manageActivity}/${actId}`)}
            buttonShow={ShowActivityButton.ViewPublication | ShowActivityButton.Manage}
        />
    );
}

function ActivityComponent() {
    const [message, setMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };
    const navigate = useNavigate();

    if (id) {
        return <ShowActivityPage />;
    }

    return (
        <>
            <ActivityList message={message} />
            <div>
                <CreateActivity onUpdate={handleUpdate} />
                <button onClick={() => navigate(Route.manageMyActivity)}>
                    Gérer mes Activités
                </button>
            </div>
        </>
    );
}

export default ActivityComponent;