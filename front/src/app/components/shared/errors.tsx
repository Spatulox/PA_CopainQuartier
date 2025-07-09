import { ErrorMessage } from "../../../api/client"

type ErrorProp = {
    errors?: ErrorMessage[] | ErrorMessage
}

function Errors({errors}: ErrorProp){

    console.log("Errors", errors)

    try{
        if(errors && Array.isArray(errors) && errors.length > 0){
            return <>
                <p>Multiples erreurs</p>
                {errors.map((err) => {
                    err.message
                })}
                </>
        } else if(typeof errors === "string"){
            return <p>Erreur</p>
        } else if(errors && "message" in errors){
            return <p>{errors?.message}</p>
        } else {
            {console.log(errors)}
            <p>Erreur dans les erreurs (ou pas d'erreur, wth) (welp)</p>
        }
    } catch (e) {
        console.error("Error when rendering \"Errors\" component:", e);
    }
}

export default Errors