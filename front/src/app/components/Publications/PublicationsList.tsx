import { useEffect, useRef, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { User } from "../../../api/user";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
import Loading from "../shared/loading";

type PublicationListMessage = {
    message: string
    limit?: number
}

function PublicationList({message, limit}: PublicationListMessage){
    const [publications, setPublications] = useState<Publication[] | null>(null)
    const [user, setUser] = useState<User>(null)
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            console.log('useEffect')
            const client = new PublicationClass()
            const use = await client.getMe()
            const pub = await client.getAllPublications()
            if(pub){
                setPublications(pub)
            }
            if(use){
                setUser(use)
            }
        })()
    }, [message])

    if (publications === null) {
        return <Loading title="Chargement des publications" />
    }

    if(publications.length == 0){
        return <p>Pas de publications trouvée...</p>
    }

    return <>    
        <h2>Publications</h2>
        <section>{publications
        .slice(0, limit ?? publications.length)
        .map((pub) => (
                <ShowPublication
                    key={pub._id}
                    pub={pub}
                    user={user}
                    onViewPublication={(id) => navigate(`${Route.publications}/${id}`)}
                    onViewActivity={(id) => navigate(`${Route.activity}/${id}`)}
                    onManage={(id) => navigate(`${Route.managePublications}/${id}`)}
                    buttonShow={ShowPublicationButton.All}
                />
            ))}</section>
        
    </>
}

export default PublicationList;