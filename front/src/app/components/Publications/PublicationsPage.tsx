// app/pages/publications.tsx

import { useNavigate, useParams } from "react-router-dom";
import CreatePublication from "./PublicationCreate";
import { Route } from "../../constantes";
import PublicationList from "./PublicationsList";
import { useEffect, useState } from "react";
import { ShowPublication, ShowPublicationButton } from "./SimplePublication";
import { Publication, PublicationClass } from "../../../api/publications";
import { User } from "../../../api/user";
import Loading from "../shared/loading";


function Publications(){
    const navigate = useNavigate()
    const [message, setMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const [publications, setPublications] = useState<Publication | null>(null)
    const [user, setUser] = useState<User | null>(null)

    const handleUpdate = (newMsg:string) => {
        setMessage(newMsg);
    };

    useEffect(() => {
        (async () => {
            const client = new PublicationClass()
            if(id){
                const pub = await client.getPublicationById(id)
                setPublications(pub)
            }
            const use = await client.getMe()
            setUser(use)
        })()
    }, [id])

    if(id && publications == null){
        return <Loading title="Chargement de la publications" />
    }

    if(id && publications != null){
        return <section> 
            <ShowPublication
                key={publications._id}
                pub={publications}
                user={user}
                onManage={() => navigate(`${Route.managePublications}/${publications._id}`)}
                buttonShow={ShowPublicationButton.Manage}
            />
        </section>
    }
     
    return <>
        <PublicationList message={message} />
        <div>
            <CreatePublication onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyPublications)}>Gérer mes Publications</button>
        </div>
    </>
}

export default Publications;