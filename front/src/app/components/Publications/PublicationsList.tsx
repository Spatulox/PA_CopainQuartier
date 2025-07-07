import { useEffect, useRef, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { User } from "../../../api/user";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
import Loading from "../shared/loading";
import { useAuth } from "../shared/auth-context";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";
import CreatePublication from "./PublicationCreate";

type PublicationListMessage = {
    limit?: number
    activity_id?: string
    buttonView?: boolean
}

function PublicationList({limit, activity_id, buttonView}: PublicationListMessage){
    const [publications, setPublications] = useState<Publication[] | null>(null)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const { me, isAdmin } = useAuth();
    const [refresh, setRefresh] = useState<number>(0)

    useEffect(() => {
        (async () => {
            const client = new PublicationClass()
            try{

                if(activity_id){
                    const pub = await client.getAllPublicationsViaActivityID(activity_id)
                    setPublications(pub)
                } else {
                    const pub = await client.getAllPublications()
                    if(pub){
                        setPublications(pub)
                    }
                }
                setErrors(null)
            } catch(e){
                setErrors(client.errors)
            }
        })()
    }, [refresh])

    if(err != null){
        return <Errors errors={err} />
    }

    if (publications === null) {
        return <Loading title="Chargement des publications" />
    }

    if(publications.length == 0){
        return <p>Pas de publications trouvée...</p>
    }

    return <>    
        <h2>Publications {activity_id ? "associés" : ""}</h2>
        {buttonView != false && (
            <div className="publication-buttons">
                <CreatePublication onUpdate={() => setRefresh(r => r+1)}/>
                <button onClick={() => navigate(Route.manageMyPublications)}>Gérer mes Publications</button>
            </div>
        )}

        <div className="">{publications
        .slice(0, limit ?? publications.length)
        .map((pub) => (
                <ShowPublication
                    key={pub._id}
                    pub={pub}
                    user={me}
                    onViewPublication={(id) => navigate(`${Route.publications}/${id}`)}
                    onViewActivity={(id) => navigate(`${Route.activity}/${id}`)}
                    onManage={(id) => navigate(`${Route.managePublications}/${id}`)}
                    buttonShow={ShowPublicationButton.All}
                />
            ))}</div>
        
    </>
}

export default PublicationList;