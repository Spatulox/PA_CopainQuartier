import { useEffect, useState } from "react"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { AdminTrocClass, Troc } from "../../../api/troc"
import { useAuth } from "../shared/auth-context"
import NotFound from "../shared/notfound";

function ApproveTroc(){
    const { me, isAdmin } = useAuth();
    const [troc, setTroc] = useState<Troc[]>([])
    const [notFound, setNotFound] = useState<boolean>(false)
    const [refresh, setRefresh] = useState(0)

    const handleApprove = async (troc_id: string, bool: boolean) => {
        const client = new AdminTrocClass()
        const option = {"approve": bool}
        await client.approveTroc(troc_id, option)
        const app = await client.getWaitingTroc()
        if(!app){
            setNotFound(true)
            return
        }
        setTroc(app)
        setRefresh(r => r + 1)
    }

    useEffect(() => {
        (async () => {
            const client = new AdminTrocClass()
            const trok = await client.getWaitingTroc()
            setTroc(trok)
        })()
    }, [refresh])

    if(notFound){
        return <NotFound />
    }

    return <>
        <div>
            <h1>Approuver Troc</h1>
            {troc.map((trok) => (
                <ShowTroc
                    key={trok._id}
                    troc={trok}
                    user={me}
                    onApprove={handleApprove}
                    buttonShow={ShowTrocButton.Approve}
                />
            ))}
        </div>
    </>
}


export default ApproveTroc