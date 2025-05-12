import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";

export function ManageMyPublications(){
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const navigate = useNavigate()
    
    useEffect(() => {
        (async () => {
        const client = new PublicationClass();
        const pub = await client.getMyPublications();
        console.log(pub)
        setPublications(pub);
        })();
    }, []);
    
    if (publications === null) {
        return <div>Chargement des publications...</div>;
    }
    
    if (publications.length === 0) {
        return <div>Aucune publications trouvée.</div>;
    }
    
    return <>    
        <h2>Mes Publications</h2>
        <section>{publications.map((pub) => (
            <div key={pub._id}>
                <h3>{pub.name}</h3>
                <span>{new Date(pub.created_at).toLocaleDateString()}</span>
                <p>{pub.body}</p>
                <div>
                    <button onClick={() => navigate(`${Route.managePublications}/${pub._id}`)}>Gérer la publications</button>
                    {pub.activity_id ?
                        <button onClick={() => navigate(`${Route.manageActivity}/${pub.activity_id}`)}>Gérer l'activité lié</button>: ""
                    }
                </div>
            </div>
        ))}</section>
    </>
}

function ManagePublicationAdmin(){
    return <><h1>Admin Publi</h1></>
}

function ManageOnePublication(){
    return <><h1>One Publi</h1></>
}

function ManagePublication(){
    const { id } = useParams<{ id: string }>();
    const [userIsAdmin, setUserAdmin] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new PublicationClass()
            setUserAdmin(client.isAdmin())
        })
    }, [])

    useEffect(() => {
        if (userIsAdmin === false && !id) {
            navigate(`${Route.manageMyPublications}`);
        }
    }, [userIsAdmin, navigate]);


    if(id){
        return <><ManageOnePublication /></>
    }

    return <>
        <ManagePublicationAdmin />
    </>

}

export default ManagePublication