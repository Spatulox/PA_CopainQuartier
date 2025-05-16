import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminPublicationClass, Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
import { User, UserRole } from "../../../api/user";
import { useAuth } from "../shared/auth-context";

const { me } = useAuth();

export function ManageMyPublications(){
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const navigate = useNavigate()
    
    useEffect(() => {
        (async () => {
        const client = new PublicationClass();
        const pub = await client.getMyPublications();
        setPublications(pub);
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
                user={me}
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
  
    useEffect(() => {
      (async () => {
        const client = new AdminPublicationClass();

        if(me?.role != UserRole.admin){
            navigate(`${Route.publications}`)
            return
        }

        const publications = await client.getAllPublications();
        setPublications(publications);

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
                user={me}
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
    const navigate = useNavigate()
    useEffect(() => {
        (async ()=> {
            const client = new PublicationClass()
            if(id){
                const pub = await client.getPublicationById(id)
                setPublication(pub)
            }
        })()
    }, [id])

    if(publication === null){
        <Loading title="Chargement de la publication" />
    }

    return <>

        <h1>EN TRAVAUX</h1>
        {publication && me ?
            <ShowPublication
                key={publication._id}
                pub={publication}
                user={me}
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