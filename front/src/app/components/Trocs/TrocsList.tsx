import { useEffect, useState } from "react"
import { Troc, TrocClass } from "../../../api/troc"
import { User } from "../../../api/user"
import { ShowTroc, ShowTrocButton } from "./SingleTroc"
import { useNavigate } from "react-router-dom"
import { Route } from "../../constantes"
import Loading from "../shared/loading"
import { useAuth } from "../shared/auth-context"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"
import "./Trocs.css"
import CreateTroc from "./TrocCreate"

type TrocListMessage = {
    limit?: number
}

function TrocList({limit}: TrocListMessage){
    const [troc, setTroc] = useState<Troc[] | null>(null)
    const { me, isAdmin } = useAuth();
    const navigate = useNavigate()
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const [refresh, setRefresh] = useState<number>(0)

    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            try{
                const tro = await client.getAllTrocs()
                setTroc(tro)
                setErrors(null)
            } catch(e){
                setErrors(client.errors)
            }
        })()
    }, [refresh])

    if(err != null){
        return <Errors errors={err} />
    }
    
    if(!troc){
        return <Loading title="Chargement des trocs..."/>
    }

    if(troc && troc.length == 0){
        return <p>Aucun Troc à afficher</p>
    }

    return <>
        <h2>Trocs</h2>
        <div>
            <CreateTroc onUpdate={() => setRefresh(r => r +1)} />
            <button onClick={() => navigate(Route.manageMyTrocs)}>
                Mes Trocs
            </button>
        </div>
        <section className="troc-container">
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