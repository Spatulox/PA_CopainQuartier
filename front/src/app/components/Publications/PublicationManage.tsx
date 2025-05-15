import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminPublicationClass, Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
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
                key={pub._id}
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
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      (async () => {
        const client = new AdminPublicationClass();
        await client.refreshUser()
        if(!client.isAdmin()){
          navigate(`${Route.publications}`)
          return
        }
        const publications = await client.getAllPublications();
        setPublications(publications);
        
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
    return (
      <div>
        <h1>Publications</h1>
        <div>
          {publications.map((pub) => (
            <ShowPublication
                key={pub._id}
                pub={pub}
                user={user}
                onViewPublication={(actiId) => navigate(`${Route.activity}/${actiId}`)}
                onManage={(pubId) => navigate(`${Route.managePublications}/${pubId}`)}
                buttonShow={ShowPublicationButton.All}
            />
          ))}
        </div>
      </div>
    );
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
                key={publication._id}
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