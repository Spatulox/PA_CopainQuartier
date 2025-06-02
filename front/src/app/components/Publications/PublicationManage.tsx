import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminPublicationClass, Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowPublication, ShowPublicationButton } from "./SinglePublication";
import { User, UserRole } from "../../../api/user";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { UpdatePublication } from "./UpdatePublication";
import { PopupConfirm } from "../Popup/PopupConfirm";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";

export function ManageMyPublications(){
    const { me, isAdmin } = useAuth();
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)
    
    useEffect(() => {
        (async () => {
        const client = new PublicationClass();
        try{
            const pub = await client.getMyPublications();
            if(!pub){
                setNotFound(true)
                return
            }
            setNotFound(false)
            setPublications(pub);
            setErrors
        } catch(e){
            setErrors(client.errors)
        }
        })();
    }, []);
    
    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

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
    const { me, isAdmin } = useAuth();
    const [publications, setPublications] = useState<Publication[] | null>(null);
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)
  
    useEffect(() => {
      (async () => {
        const client = new AdminPublicationClass();
        try{
            const publications = await client.getAdminAllPublication();
            if(!publications){
                setNotFound(true)
                return
            }
            setNotFound(false)
            setPublications(publications);
            setErrors(null)
        } catch(e){
            setErrors(client.errors)
        }
      })();
    }, []);

    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

    if(!isAdmin){
        navigate(`${Route.publications}`)
        return
    }
  
    if (publications === null) {
      return <Loading title="Chargement des publications" />
    }
  
    if (publications && publications.length === 0) {
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
    const { me, isAdmin } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [publication, setPublication] = useState<Publication | null>(null)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const [updErr, setUpdateErrors] = useState<any | null>(null)
    const [delErr, setDeleteErrors] = useState<ErrorMessage | null>(null)
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)

    useEffect(() => {
        (async ()=> {
            if(id){
                if(isAdmin){
                    const client = new AdminPublicationClass()
                    try{
                        const pub = await client.getAdminPublicationById(id)
                        if(!pub){
                            setNotFound(true)
                            return
                        }
                        setNotFound(false)
                        setPublication(pub)
                        setErrors(null)
                    } catch(e){
                        setErrors(client.errors)
                    }
                } else {
                    const client = new PublicationClass()
                    try{
                        const pub = await client.getPublicationById(id)
                        if(!pub){
                            setNotFound(true)
                            return
                        }
                        setNotFound(false)
                        setPublication(pub)
                        setErrors(null)
                    } catch(e){
                        setErrors(client.errors)
                    }
                }
            }
        })()
    }, [id])

    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
        return <NotFound />
    }

    if(!id){
        navigate(`${Route.publications}`)
        return
    }

    if(publication === null){
        return <Loading title="Chargement de la publication" />
    }

    const handlUpdate = async (id: string, option: object) => {
        const client = new PublicationClass()
        try{
            await client.updatePublication(id, option)
            setUpdateErrors(null)
        } catch(e){
            setUpdateErrors(client.errors)
        }
    }
    
    const handlDelete = async (id: string) => {
        setDeleteId(id)
        setShowConfirm(true)
        setDeleteErrors(null)
    }

    const confirmDelete = async () => {
        if (deleteId) {
        const client = new AdminPublicationClass();
        try{
            await client.deletePublication(deleteId);
            setShowConfirm(false);
            setDeleteId(null);
            setDeleteErrors(null)
        } catch(e){
            setDeleteErrors(client.errors)
        }
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteId(null);
        setDeleteErrors(null)
    };
    
    return <>
        <UpdatePublication
            key={publication!._id}
            publication={publication!}
            user={me}
            APIerror={updErr}
            onUpdate={(id: string, option: object) => handlUpdate(id, option)}
            onDelete={handlDelete}
        />
        {showConfirm && (
            <PopupConfirm
            key={deleteId}
            title="Suppression d'une publication"
            description="Voulez-vous réellement supprimer cette publication ?"
            errors={delErr}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            />
        )}
    </>
}

function ManagePublication(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    const { me, isAdmin } = useAuth();

    useEffect(() => {
        if (!isAdmin && !id) {
            navigate(`${Route.publications}`);
        }
    }, [isAdmin, id, navigate]);

    if(id){
        return <><ManageOnePublication /></>
    }

    return <>
        <ManagePublicationAdmin />
        <button onClick={() => navigate(`${Route.manageMyPublications}`)}>Gérer mes Publications</button>
    </>

}

export default ManagePublication