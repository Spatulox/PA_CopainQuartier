import { useEffect, useState } from "react"
import { Troc, TrocClass } from "../../../api/troc"
import { User } from "../../../api/user"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { useNavigate } from "react-router-dom"
import { Route } from "../../constantes"
import Loading from "../shared/loading"

type TrocListMessage = {
    message: string
    limit?: number
}

function TrocList({message, limit}: TrocListMessage){
    const [troc, setTroc] = useState<Troc[]>([])
    const [user, setUser] = useState<User | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            const tro = await client.getAllTrocs()
            setTroc(tro)
            const use = await client.getMe()
            setUser(use)
        })()
    }, [message])

    if(troc && troc.length == 0){
        return <Loading title="Chargement des trocs..."/>
    }

    
    return <>
        <h2>Trocs</h2>
        <section>
            {troc
            .slice(0, limit ?? troc.length)
            .map((theTroc) => (
                <ShowTroc
                    key={theTroc._id}
                    troc={theTroc}
                    user={user}
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