// app/pages/activity.tsx

import { act, useEffect, useState } from "react";
import ActivityList from "./ActivityList";
import CreateActivity from "./ActivityCreate";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { Activity, ActivityClass } from "../../../api/activity";
import { User } from "../../../api/user";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";
import PublicationList from "../Publications/PublicationsList";

function ShowActivityPage() {
    const { id } = useParams<{ id: string }>();
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const [activity, setActivity] = useState<Activity>();
    const [notFound, setNotFound] = useState<boolean>(false)
    const navigate = useNavigate();
    const { me, isAdmin } = useAuth();

    useEffect(() => {
        (async () => {
            const client = new ActivityClass();
            try{
                if (id) {
                    const activity = await client.getActivityByID(id);
                    if(!activity){
                        setNotFound(true)
                        return
                    }
            
                    setActivity(activity);
                    setErrors(null)
                }
            } catch (e){
                setErrors(client.errors)
            }
            
        })();
    }, [id]);

    async function handleJoin(actId: string) {
        const client = new ActivityClass();
        try {
            await client.joinActivity(actId);
            setErrors(null);
            const acti = await client.getActivityByID(actId);
            setActivity(acti);
        } catch (e) {
            setErrors(client.errors);
        }
    }

    async function handleLeave(actId: string) {
        const client = new ActivityClass();
        try {
            await client.leaveActivity(actId);
            setErrors(null);
            const acti = await client.getActivityByID(actId);
            setActivity(acti);
        } catch (e) {
            setErrors(client.errors);
        }
    }

    if(err != null && activity == null){
        return <Errors errors={err} />
    }
    
    if(notFound){
        return <NotFound />
    }
    
    if (!activity) {
        return <Loading title="Chargement de l'activité" />;
    }

    
    let buttonShow = ShowActivityButton.ViewPublication | ShowActivityButton.Manage;
    if(activity.participants != null){
        const isParticipant = activity.participants.some(
            participant => participant && participant._id === me?._id
        );

        if (isParticipant) {
            buttonShow |= ShowActivityButton.Leave;
            buttonShow |= ShowActivityButton.Chat;
        } else {
            buttonShow |= ShowActivityButton.Join;
        }
    } else {
        buttonShow |= ShowActivityButton.Join
    }

    return (
        <>
        <ShowActivity
            key={activity._id}
            activity={activity}
            user={me}
            onViewPublication={(pubId) => navigate(`${Route.publications}/${pubId}`)}
            onManage={(actId) => navigate(`${Route.manageActivity}/${actId}`)}
            onJoin={(actId) => handleJoin(actId)}
            onLeave={(actiId) => handleLeave(actiId)}
            buttonShow={buttonShow}
        />
        <PublicationList message="" activity_id={activity._id} />
        </>
    );
}

function ActivityComponent() {
    const [message, setMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };
    const navigate = useNavigate();

    if(id == "me"){
        navigate(`${Route.manageMyActivity}`)
        return
    }
    
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