import { useEffect, useState } from "react"
import { AdminJavaClass, Java, JavaClass } from "../../../api/java"
import NotFound from "../shared/notfound"
import Loading from "../shared/loading"
import { ErrorMessage } from "../../../api/client"
import Errors from "../shared/errors"
import { FieldForm, PopupForm } from "../Popup/PopupForm"
import { CreateFormData } from "../../../api/utils/formData"

export default function JavaList(){
    const [java, setJava] = useState<Java[] | null>(null)
    const [notfound, setnotFound] = useState(false)
    const [error, setError] = useState<ErrorMessage | null>(null)
    const [resfresh, setRefresh] = useState(0)

    useEffect(() => {
        (async () => {
            const client = new JavaClass()
            try {
                const ja = await client.getJavaVersion()
                if(!ja){
                    setnotFound(true)
                    setError(null)
                    return
                }
                setError(null)
                setnotFound(false)
                setJava(ja)
            } catch (error) {
                console.error(error)
                setError(client.errors)
            }
        })()
    }, [resfresh])

    function onClickVersion(){
        const client = new JavaClass()
        try {
            client.downloadJavaApp("win")
        } catch (error) {
            console.error(error)
            setError(client.errors)
        }
    }

    if(notfound){
        return <NotFound />
    }

    if(java == null){
        return <Loading />
    }
    
    if(error != null){
        return <Errors errors={error} />
    }

    return <>
        <h1>JavaList</h1>
        <ul>
            {java.map((ja) => (
                <li>{ja.version} - {new Date(ja.createdAt).toDateString()}</li>
            ))}
        </ul>
        <button  onClick={() => onClickVersion()}>Télécharger l'application Java</button>
        <UploadJava onUploadSuccess={() => setRefresh(r => r + 1)} />
    </>
}

function UploadJava({ onUploadSuccess }: { onUploadSuccess: () => void }){
    const [err, setErr] = useState<any>()

    const fields: FieldForm[] = [
        { name: "version", label: "Nom", type: "text", required: true },
        { name: "jar", label: "Fichier jar", type: "file", required: true}
    ];

    type JavaForm = {
        version: string,
        jar: File | null,
    };

    async function handleCreateJavaVersion(formData: JavaForm){
        const client = new AdminJavaClass()
        try {
            if(!formData.jar){
                return
            }
            const file = CreateFormData(formData)
            await client.uploadNewJavaVersion(file)
            onUploadSuccess()
        } catch (error) {
            console.error(error)
            setErr(client.errors)
        }
    }

    return (
    <PopupForm<JavaForm>
        title="Ajouter une version"
        fields={fields}
        APIerrors={err}
        initialFormData={{ version: "", jar: null }}
        onSubmit={handleCreateJavaVersion}
        submitLabel="Créer"
        buttonLabel="Créer une version"
    />
    );
}