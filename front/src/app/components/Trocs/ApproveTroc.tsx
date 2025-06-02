import { useEffect, useState } from "react"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { AdminTrocClass, Troc } from "../../../api/troc"
import { useAuth } from "../shared/auth-context"
import NotFound from "../shared/notfound";
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";

function ApproveTroc(){
    const { me, isAdmin } = useAuth();
    const [troc, setTroc] = useState<Troc[]>([])
    const [notFound, setNotFound] = useState<boolean>(false)
    const [refresh, setRefresh] = useState(0)
    const [err, setError] = useState<ErrorMessage | null>(null)

    const handleApprove = async (troc_id: string, bool: boolean) => {
        const client = new AdminTrocClass()
        try{
            const option = {"approve": bool}
            await client.approveTroc(troc_id, option)
            const app = await client.getWaitingTroc()
            setTroc(app)
            if(!app){
                setNotFound(true)
            }
            setNotFound(false)
            setRefresh(r => r + 1)
            setError(null)
        }catch(e){
            setError(client.errors)
        }
    }

    useEffect(() => {
        (async () => {
            const client = new AdminTrocClass()
            try{
                const trok = await client.getWaitingTroc()
                if(!trok){
                    setNotFound(true)
                }
                setNotFound(false)
                setTroc(trok)
                setError(null)
            } catch(e){
                setError(client.errors)
            }
        })()
    }, [refresh])

    if(err != null){
        return <Errors errors={err} />
    }

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