import { useEffect, useState } from "react"
import { Troc, TrocClass } from "../../../api/troc"
import { User } from "../../../api/user"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { useNavigate } from "react-router-dom"
import { Route } from "../../constantes"
import Loading from "../shared/loading"
import { useAuth } from "../shared/auth-context"

type TrocListMessage = {
    message: string
    limit?: number
}

function TrocList({message, limit}: TrocListMessage){
    const [troc, setTroc] = useState<Troc[] | null>(null)
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            const tro = await client.getAllTrocs()
            setTroc(tro)
        })()
    }, [message])

    if(!troc){
        return <Loading title="Chargement des trocs..."/>
    }

    if(troc && troc.length == 0){
        return <p>Aucun Troc à afficher</p>
    }

    return <>
        <h2>Trocs</h2>
        <section>
            {me && troc
            .slice(0, limit ?? troc.length)
            .map((theTroc) => (
                <ShowTroc
                    key={theTroc._id}
                    troc={theTroc}
                    user={me}
                    onViewTroc={() => navigate(`${Route.troc}/${theTroc._id}`)}
                    onManage={() => navigate(`${Route.manageTrocs}/${theTroc._id}`)}
                    buttonShow={ShowTrocButton.Troc | ShowTrocButton.Manage}
                />
            ))
            }
        </section>
    </>
}

export default TrocList;