import { useEffect, useState } from "react"
import { Activity, ActivityClass } from "../../../api/activity"
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";

function ManageMyActivity() {
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        const activities = await client.getMyActivities();
        setActivities(activities);
      })();
    }, []);
  
    if (activities === null) {
      return <div>Chargement des activités...</div>;
    }
  
    if (activities.length === 0) {
      return <div>Aucune activité trouvée.</div>;
    }
  
    return (
      <div>
        <h1>Mes Activités</h1>
        <div>
          {activities.map((activity) => (
            <div key={activity._id}>
              <h2>{activity.title}</h2>
              <div>
                Créée le {new Date(activity.created_at).toLocaleDateString()}<br />
                Réservation : {new Date(activity.date_reservation).toLocaleString()}
              </div>
              <div>
                <strong>Description :</strong>
                <div>{activity.description}</div>
              </div>
              <div>
                <strong>Auteur :</strong> {activity.author_id?.name}
              </div>
              <div>
                <strong>Participants ({activity.participants.length}) :</strong>
                <ul>
                  {activity.participants.map((user) => (
                    <li key={user?._id}>{user?.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <button onClick={() => navigate(Route.publications+"/"+activity.publication._id)}>Voir la Publication</button>
                <button onClick={() => navigate(Route.activity+"/manage/"+activity._id)}>Editer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}

function ManageActivityAdmin(){
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        if(!client.isAdmin()){
          return
        }
        const activities = await client.getAllActivitiesAdmin();
        setActivities(activities);
      })();
    }, []);
  
    if (activities === null) {
      return <div>Chargement des activités...</div>;
    }
  
    if (activities.length === 0) {
      return <div>Aucune activité trouvée.</div>;
    }
  
    return (
      <div>
        <h1>Activités</h1>
        <div>
          {activities.map((activity) => (
            <div key={activity._id}>
              <h2>{activity.title}</h2>
              <div>
                Créée le {new Date(activity.created_at).toLocaleDateString()}<br />
                Réservation : {new Date(activity.date_reservation).toLocaleString()}
              </div>
              <div>
                <strong>Description :</strong>
                <div>{activity.description}</div>
              </div>
              <div>
                <strong>Auteur :</strong> {activity.author_id?.name}
              </div>
              <div>
                <strong>Participants ({activity.participants.length}) :</strong>
                <ul>
                  {activity.participants.map((user) => (
                    <li key={user?._id}>{user?.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <button onClick={() => navigate(Route.publications+"/"+activity.publication._id)}>Voir la Publication</button>
                <button onClick={() => navigate(Route.activity+"/manage/"+activity._id)}>Editer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}


function ManageOneActivity(){

  const [activity, setActivities] = useState<Activity | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        if(id){
          const activitie = await client.getactivityAdminById(id);
          setActivities(activitie);
        }
      })();
    }, [id]);
  
    if (activity === null) {
      return <div>Chargement des activités...</div>;
    }
    return (
      <div>
        <h1>EN TRAVAUX</h1>
        <div key={activity._id}>
          <h2>{activity.title}</h2>
          <div>
            Créée le {new Date(activity.created_at).toLocaleDateString()}<br />
            Réservation : {new Date(activity.date_reservation).toLocaleString()}
          </div>
          <div>
            <strong>Description :</strong>
            <div>{activity.description}</div>
          </div>
          <div>
            <strong>Auteur :</strong> {activity.author_id?.name}
          </div>
          <div>
            <strong>Participants ({activity.participants.length}) :</strong>
            <ul>
              {activity.participants ? activity.participants.map((user) => (
                <li key={user?._id}>{user?.name}</li>
              )): "Rien"}
            </ul>
          </div>
          <div>
            <button onClick={() => navigate(Route.publications+"/manage/"+activity.publication._id)}>Voir/Gérer la Publication</button>
          </div>
        </div>
      </div>
    );
}


export function ManageActivity(){
    const [userIsAdmin, setUserAdmin] = useState(false)
    const { id } = useParams<{ id: string }>();
    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            setUserAdmin(client.isAdmin())
        })
    }, [])

    if(id){
        return <><ManageOneActivity/></>
    }
    return <>
        {userIsAdmin ?
            (
                <ManageActivityAdmin />
            ) : 

            (
                <ManageMyActivity />
            )
        }
    </>
}


export default ManageActivity