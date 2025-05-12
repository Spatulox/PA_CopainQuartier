import { useEffect, useState } from "react";
import { Publication, PublicationClass } from "../../../api/publications";

type PublicationListMessage = {
    message: string
  }

function PublicationList({message}: PublicationListMessage){
    const [publications, setPublications] = useState<Publication[]>([])


    useEffect(() => {
        (async () => {
            console.log('useEffect')
            const client = new PublicationClass()
            const pub = await client.getAllPublications()
            console.log(pub)
            if(pub){
                setPublications(pub)
            }
        })()
    }, [message])

    if(publications.length == 0){
        return <p>Chargement des publications ou pas de publications...</p>
    }

    return <>    
        <h2>Publications</h2>
        <section>{publications.map((pub) => (
            <div key={pub._id}>
                <h3>{pub.name}</h3>
                <span>{new Date(pub.created_at).toLocaleDateString()}</span>
                <p>{pub.body}</p>
                <div>
                    {typeof pub.author_id === "object" && pub.author_id !== null
                        ? pub.author_id.name
                        : pub.author_id?.toString()}
                </div>
            </div>
        ))}</section>
    </>
}

export default PublicationList;