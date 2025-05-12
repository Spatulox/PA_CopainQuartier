import { useState } from "react"
import { Troc } from "../../../api/Troc"

type TrocListMessage = {
    message: string
    limit?: number
}

function TrocList({message, limit}: TrocListMessage){

    const [troc, setTroc] = useState<Troc>()

    return <h2>TrocList</h2>
}

export default TrocList;