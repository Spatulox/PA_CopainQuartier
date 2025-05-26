import { ErrorMessage } from "../../../api/client"

type ErrorProp = {
    errors?: ErrorMessage[] | ErrorMessage
}

function Errors({errors}: ErrorProp){

    if(Array.isArray(errors)){
        return <>
            <p>Multiples erreurs</p>
            {errors.map((err) => {
                err.message
            })}
            </>
    } else {
        return <p>Une erreur</p>
    }
}

export default Errors