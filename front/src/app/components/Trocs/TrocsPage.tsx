// app/pages/trocs.tsx

import { useState } from "react";
import CreateTroc from "./TrocCreate";
import TrocList from "./TrocsList";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";

function Trocs(){
    const [message, setMessage] = useState<string>("")
    const navigate = useNavigate()
    
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };
    
    return <>
        <TrocList message={message}/>
        <div>
            <CreateTroc onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyTrocs)}>
                Gérer mes Trocs
            </button>
        </div>
    </>
}

export default Trocs;