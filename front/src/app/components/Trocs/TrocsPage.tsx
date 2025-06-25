// app/pages/trocs.tsx

import { useEffect, useState } from "react";
import CreateTroc from "./TrocCreate";
import TrocList from "./TrocsList";
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import { ShowTroc, ShowTrocButton } from "./SingleTroc";
import Loading from "../shared/loading";
import { Troc, TrocClass } from "../../../api/troc";
import { User } from "../../../api/user";
import NotFound from "../shared/notfound";
import { ErrorMessage } from "../../../api/client";
import { useAuth } from "../shared/auth-context";
import "./Trocs.css"

function ShowTrocPage() {
    const { id } = useParams<{ id: string }>();
    const [troc, setTroc] = useState<Troc>();
    const [notFound, setNotFound] = useState<boolean>(false)
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const [refresh, setRefresh] = useState(0);
    const navigate = useNavigate();
    const {me} = useAuth()

    useEffect(() => {
        (async () => {
            const client = new TrocClass();
            try{
                if (id) {
                    const trok = await client.getTrocByID(id);
                    if(!trok){
                        setNotFound(true)
                        return
                    }
                    setNotFound(false)
                    setTroc(trok);
                }
                setErrors(null)
            }catch(e){
                setErrors(client.errors)
            }
        })();
    }, [id, refresh]);

    async function onReserveTroc(id: string){
        const client = new TrocClass()
        try {
            await client.reservedTroc(id)
            setErrors(null)
            setRefresh(r => r+1)
        } catch (e) {
            setErrors(client.errors)
        }
    }

    async function onCancelTroc(id: string){
        const client = new TrocClass()
        try {
            await client.cancelTroc(id)
            setErrors(null)
            setRefresh(r => r+1)
        } catch (e) {
            setErrors(client.errors)
        }
    }

    async function onCompleteTroc(id: string){
        const client = new TrocClass()
        try {
            await client.completeTroc(id)
            setErrors(null)
            setRefresh(r => r+1)
        } catch (e) {
            setErrors(client.errors)
        }
    }

    async function onLeaveTroc(id: string){
        const client = new TrocClass()
        try {
            await client.leaveTroc(id)
            setErrors(null)
            setRefresh(r => r+1)
        } catch (e) {
            setErrors(client.errors)
        }
    }

    if(notFound){
        return <NotFound />
    }
    if(id == "me"){
        navigate(`${Route.manageMyTrocs}`)
        return
    }
    if (!troc) {
        return <Loading title="Chargement de l'activité" />;
    }
    return (
        <ShowTroc
            key={troc._id}
            troc={troc}
            user={me}
            onManage={(actId) => navigate(`${Route.manageTrocs}/${actId}`)}
            onComplete={(id: string) => onCompleteTroc(id)}
            onReserve={(id: string) => onReserveTroc(id)}
            onCancel={(id: string) => onCancelTroc(id)}
            onLeave={(id: string) => onLeaveTroc(id)}
            buttonShow={ShowTrocButton.Manage | ShowTrocButton.Reserve | ShowTrocButton.Cancel | ShowTrocButton.Complete | ShowTrocButton.Leave | ShowTrocButton.ShowChannel}
        />
    );
}


function Trocs(){
    const [message, setMessage] = useState<string>("")
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    
    const handleUpdate = (newMsg: string) => {
        setMessage(newMsg);
    };
    
    if (id) {
        return <ShowTrocPage />;
    }

    return <>
        <TrocList message={message} />
        <div>
            <CreateTroc onUpdate={handleUpdate} />
            <button onClick={() => navigate(Route.manageMyTrocs)}>
                Mes Trocs
            </button>
        </div>
    </>
}

export default Trocs;