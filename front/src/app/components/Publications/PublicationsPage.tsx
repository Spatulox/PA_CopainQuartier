// app/pages/publications.tsx

import {useNavigate, useParams} from "react-router-dom";
import {Route} from "../../constantes";
import PublicationList from "./PublicationsList";
import {useEffect, useState} from "react";
import {ShowPublication, ShowPublicationButton} from "./SinglePublication";
import {AdminPublicationClass, Publication, PublicationClass} from "../../../api/publications";
import Loading from "../shared/loading";
import {useAuth} from "../shared/auth-context";
import NotFound from "../shared/notfound";
import {ErrorMessage} from "../../../api/client";
import Errors from "../shared/errors";


function Publications() {
    const navigate = useNavigate()
    const {id} = useParams<{ id: string }>();
    const [publications, setPublications] = useState<Publication | null>(null)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const [notFound, setNotFound] = useState<boolean>(false)
    const {me, isAdmin} = useAuth();

    useEffect(() => {
        (async () => {
            if (id) {
                if (isAdmin) {
                    const client = new AdminPublicationClass()
                    try {
                        const pub = await client.getAdminPublicationById(id)
                        if (!pub) {
                            setNotFound(true)
                            return
                        }
                        setNotFound(false)
                        setPublications(pub)
                        setErrors(null)
                    } catch (e) {
                        setErrors(client.errors)
                    }
                } else {
                    const client = new PublicationClass()
                    try {
                        const pub = await client.getPublicationById(id)
                        if (!pub) {
                            setNotFound(true)
                            return
                        }

                        setNotFound(false)
                        setPublications(pub)
                        setErrors(null)
                    } catch (e) {
                        setErrors(client.errors)
                    }
                }
            }
        })()
    }, [id])

    if (err != null) {
        return <Errors errors={err}/>
    }

    if (notFound) {
        return <NotFound/>
    }
    if (id == "me") {
        navigate(`${Route.manageMyPublications}`)
        return
    }
    if (id && publications == null) {
        return <Loading title="Chargement de la publications"/>
    }

    if (id && publications != null) {
        return <section>
            <ShowPublication
                key={publications._id}
                pub={publications}
                user={me}
                onManage={() => navigate(`${Route.managePublications}/${publications._id}`)}
                onViewActivity={() => navigate(`${Route.activity}/${publications.activity?._id}`)}
                buttonShow={ShowPublicationButton.Manage | ShowPublicationButton.ViewActivity}
            />
        </section>
    }

    return <>
        <PublicationList/>
    </>
}

export default Publications;