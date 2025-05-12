import { useEffect, useRef, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";
import { User } from "../../../api/user";
import { useNavigate } from "react-router-dom";
import { Route } from "../../constantes";

type PublicationListMessage = {
    message: string
  }

function PublicationList({message}: PublicationListMessage){
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
        return <div>Chargement des publications...</div>;
    }

    if(publications.length == 0){
        return <p>Pas de publications trouvée...</p>
    }

    return <>    
        <h2>Publications</h2>
        <section>{publications.map((pub) => (
            <div key={pub._id}>
                <div>
                    <h3>{pub.name}</h3>
                    <span>{new Date(pub.created_at).toLocaleDateString()}</span>
                </div>
                <p>{pub.body}</p>
                <div>
                    {typeof pub.author_id === "object" && pub.author_id !== null
                        ? pub.author_id.name
                        : pub.author_id?.toString()}
                    {typeof pub.author_id === "object" && pub.author_id !== null && user?._id == pub.author_id?._id ?
                    <button onClick={() => navigate(`${Route.managePublications}/${pub._id}`)}>Gérer la publication</button>:""
                    }
                </div>
            </div>
        ))}</section>
    </>
}

export default PublicationList;