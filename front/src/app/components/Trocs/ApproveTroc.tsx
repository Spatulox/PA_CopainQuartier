import { useEffect, useState } from "react"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { AdminTrocClass, Troc } from "../../../api/troc"
import { useAuth } from "../shared/auth-context"

function ApproveTroc(){
    const { me, isAdmin } = useAuth();
    const [troc, setTroc] = useState<Troc[]>([])

    const handleApprove = async (troc_id: string, bool: boolean) => {
        const client = new AdminTrocClass()
        const option = {"approve": bool}
        await client.approveTroc(troc_id, option)
        const app = await client.getWaitingTroc()
        setTroc(app)
    }

    useEffect(() => {
        (async () => {
            const client = new AdminTrocClass()
            const trok = await client.getWaitingTroc()
            setTroc(trok)
        })()
    }, [])

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