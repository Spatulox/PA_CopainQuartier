// app/pages/activity.tsx

import { useState } from "react";
import ActivityList from "./ActivityList";
import CreateActivity from "./CreateActivity";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";

function Activity(){

    const [message, setMessage] = useState("");
    const handleUpdate = (newMsg:string) => {
        setMessage(newMsg);
    };
    const navigate = useNavigate()

    return <>
    <ActivityList message={message} />
    <div>
        <CreateActivity onUpdate={handleUpdate} />
        <button onClick={() => navigate(Route.manageActivity)}>Gérer mes Activités</button>
    </div>
    </>
}

export default Activity;