import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Publication, PublicationClass } from "../../../api/publications";
import { Route } from "../../constantes";

export function ManageMyPublications(){
    return <><h1>My Publi</h1></>
}

function ManagePublicationAdmin(){
    return <><h1>Admin Publi</h1></>
}

function ManageOnePublication(){
    return <><h1>One Publi</h1></>
}

function ManagePublication(){
    const [publications, setPublications] = useState<Publication[] | null>(null);
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

    if(!publications){
        return <p>Chargement des publications</p>
    }

    if(id){
        return <><ManageOnePublication /></>
    }

    return <>
        <ManagePublicationAdmin />
    </>

}

export default ManagePublication