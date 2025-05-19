// app/pages/trocs.tsx

import { useEffect, useState } from "react";
import CreateTroc from "./TrocCreate";
import TrocList from "./TrocsList";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowTroc, ShowTrocButton } from "./SimpleTroc";
import Loading from "../shared/loading";
import { Troc, TrocClass } from "../../../api/troc";
import { User } from "../../../api/user";
import NotFound from "../shared/notfound";


function ShowTrocPage() {
    const { id } = useParams<{ id: string }>();
    const [troc, setTroc] = useState<Troc>();
    const [user, setUser] = useState<User>();
    const [notFound, setNotFound] = useState<boolean>(false)
    const navigate = useNavigate();
    
    useEffect(() => {
        (async () => {
            const client = new TrocClass();
            if (id) {
                const trok = await client.getTrocByID(id);
                if(!trok){
                    setNotFound(true)
                    return
                }
                setTroc(trok);
            }
        })();
    }, [id]);

    if(notFound){
        return <NotFound />
    }
    if(id == "me"){
        navigate(`${Route.manageMyTrocs}`)
        return
    }
    if (!troc) {
        return <Loading title="Chargement de l'activité" />;
    }

    return (
        <ShowTroc
            key={troc._id}
            troc={troc}
            user={user}
            onManage={(actId) => navigate(`${Route.manageTrocs}/${actId}`)}
            buttonShow={ShowTrocButton.Manage}
        />
    );
}


function Trocs(){
    const [message, setMessage] = useState<string>("")
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };
    
    if (id) {
        return <ShowTrocPage />;
    }

    return <>
        <TrocList message={message} />
        <div>
            <CreateTroc onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyTrocs)}>
                Gérer mes Trocs
            </button>
        </div>
    </>
}

export default Trocs;