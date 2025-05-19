// app/pages/publications.tsx

import { useNavigate, useParams } from "react-router-dom";
import CreatePublication from "./PublicationCreate";
import { Route } from "../../constantes";
import PublicationList from "./PublicationsList";
import { useEffect, useState } from "react";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
import { AdminPublicationClass, Publication, PublicationClass } from "../../../api/publications";
import { User } from "../../../api/user";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { AdminActivityClass } from "../../../api/activity";


function Publications(){
    const navigate = useNavigate()
    const [message, setMessage] = useState("");
    const { id } = useParams<{ id: string }>();
    const [publications, setPublications] = useState<Publication | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const { me, isAdmin } = useAuth();

    const handleUpdate = (newMsg:string) => {
        setMessage(newMsg);
    };

    useEffect(() => {
        (async () => {
            if(id){
                if(isAdmin){
                    const client = new AdminPublicationClass()
                    const pub = await client.getAdminPublicationById(id)
                    if(!pub){
                        setNotFound(true)
                        return
                    }
                    setPublications(pub)
                } else {
                    const client = new PublicationClass()
                    const pub = await client.getPublicationById(id)
                    if(!pub){
                        setNotFound(true)
                        return
                    }
                    setPublications(pub)
                }
            }
        })()
    }, [id])

    if(notFound){
        return <NotFound />
    }
    if(id == "me"){
        navigate(`${Route.manageMyPublications}`)
        return
    }
    if(id && publications == null){
        return <Loading title="Chargement de la publications" />
    }

    if(id && publications != null){
        return <section> 
            <ShowPublication
                key={publications._id}
                pub={publications}
                user={me}
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