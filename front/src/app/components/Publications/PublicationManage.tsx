import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowPublication, ShowPublicationButton } from "./SimplePublication";
import { User } from "../../../api/user";

export function ManageMyPublications(){
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const [user, setUser] = useState<User>(null)
    const navigate = useNavigate()
    
    useEffect(() => {
        (async () => {
        const client = new PublicationClass();
        const pub = await client.getMyPublications();
        setPublications(pub);

        const use = await client.getMe()
        setUser(use)

        })();
    }, []);
    
    if (publications === null) {
        return <Loading title="Chargement des publications" />
    }
    
    if (publications.length === 0) {
        return <div>Aucune publications trouvée.</div>;
    }
    
    return <>    
        <h2>Mes Publications</h2>
        <section>{publications.map((pub) => (
            <ShowPublication
                pub={pub}
                user={user}
                onViewActivity={(id) => navigate(`${Route.activity}/${id}`)}
                onManage={(id) => navigate(`${Route.manageActivity}/${id}`)}
                buttonShow={ShowPublicationButton.ViewActivity | ShowPublicationButton.Manage}
            />
        ))}</section>
    </>
}

function ManagePublicationAdmin(){
    return <><h1>Admin Publi</h1></>
}

function ManageOnePublication(){
    const { id } = useParams<{ id: string }>();
    const [publication, setPublication] = useState<Publication | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const navigate = useNavigate()
    useEffect(() => {
        (async ()=> {
            const client = new PublicationClass()
            if(id){
                const pub = await client.getPublicationById(id)
                setPublication(pub)
            }
            const use = await client.getMe()
            setUser(use)
        })()
    }, [id])

    if(publication === null){
        <Loading title="Chargement de la publication" />
    }

    return <>

        <h1>EN TRAVAUX</h1>
        {publication && user ?
            <ShowPublication
                pub={publication}
                user={user}
                onViewActivity={(id) => navigate(`${Route.activity}/${id}`)}
                buttonShow={ShowPublicationButton.ViewActivity}
            />
        :() => navigate(Route.publications)}
    </>
}

function ManagePublication(){
    const { id } = useParams<{ id: string }>();
    const [userIsAdmin, setUserAdmin] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new PublicationClass()
            await client.refreshUser()
            const useAdmin = client.isAdmin()
            setUserAdmin(useAdmin)
            if (useAdmin === false && !id) {
                navigate(`${Route.publications}`);
            }
        })()
    }, [])


    if(id){
        return <><ManageOnePublication /></>
    }

    return <>
        <ManagePublicationAdmin />
        <button onClick={() => navigate(`${Route.manageMyPublications}`)}>Gérer mes Publications</button>
    </>

}

export default ManagePublication