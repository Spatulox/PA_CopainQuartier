import { useEffect, useState } from "react"
import { ShowTroc, ShowTrocButton } from "./SimpleTroc"
import { AdminTrocClass, Troc, TrocClass } from "../../../api/troc"
import { User } from "../../../api/user"

function ApproveTroc(){

    const [troc, setTroc] = useState<Troc[]>([])
    const [user, setUser] = useState<User | null>(null)


    const handleApprove = async (troc_id: string, bool: boolean) => {
        const client = new AdminTrocClass()
        const option = {"approve": bool}
        await client.approveTroc(troc_id, option)
    }

    useEffect(() => {
        (async () => {
            const client = new AdminTrocClass()
            const trok = await client.getAllAdminTroc()
            setTroc(trok)
            const use = await client.getMe()
            setUser(use)
        })()
    }, [])

    return <>
        <div>
            <h1>Approuver Troc</h1>
            {troc.map((trok) => (
                <ShowTroc
                    key={trok._id}
                    troc={trok}
                    user={user}
                    onApprove={handleApprove}
                    buttonShow={ShowTrocButton.Approve}
                />
            ))}
        </div>
    </>
}


export default ApproveTroc