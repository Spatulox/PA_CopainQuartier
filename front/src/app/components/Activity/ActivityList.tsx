import { act, useEffect, useState } from "react";
import { Activity, ActivityClass } from "../../../api/activity";
import CreateActivity from "./CreateActivity";
import { UserClass } from "../../../api/user";

type ActivityListMessage = {
    message: string
  }

function ActivityList({message}: ActivityListMessage){

    const [activity, setActivity] = useState<Activity[]>([])


    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            const activities = await client.getActivities()
            console.log(activities)
            setActivity(activities)
        })()
    }, [message])

    return <>
        <h2>Activités</h2>
        <section>
        { activity?.length == 0 ? (<p>Aucune Activités trouvée</p>) : (
            activity?.map((acti) => (
                <div key={acti._id}>
                    <h3>{acti.title}</h3>
                    <span>
                        Auteur : {acti.author_id?.email ? acti.author_id.email : "Unknow" } - Date de création : {new Date(acti.created_at).toLocaleDateString()}
                    </span>
                    <p>{acti.description}</p>
                    <span>
                        Date de participation : {new Date(acti.date_reservation).toLocaleDateString()}
                    </span><br></br>
                    <button id={acti.publication._id}>Voir la publication : {acti.publication.name}</button>
                </div>
            )))
        }
        </section>
    </>
}

export default ActivityList;