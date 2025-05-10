// app/pages/publications.tsx

import { useNavigate } from "react-router-dom";
import CreatePublication from "./PublicationCreate";
import { Route } from "../../constantes";

function Publications(){
    const navigate = useNavigate()

    function handleUpdate(){
        alert("update")
    }
    
    return <>
        <h2>Publications</h2>
        <div>
            <CreatePublication onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyPublications)}>Gérer mes Activités</button>
        </div>
    </>
}

export default Publications;