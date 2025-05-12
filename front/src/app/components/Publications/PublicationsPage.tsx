// app/pages/publications.tsx

import { useNavigate } from "react-router-dom";
import CreatePublication from "./PublicationCreate";
import { Route } from "../../constantes";
import PublicationList from "./PublicationsList";
import { useState } from "react";

function Publications(){
    const navigate = useNavigate()
    const [message, setMessage] = useState("");

    const handleUpdate = (newMsg:string) => {
        setMessage(newMsg);
    };
     
    return <>
        <PublicationList message={message} />
        <div>
            <CreatePublication onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyPublications)}>Gérer mes Publications</button>
        </div>
    </>
}

export default Publications;