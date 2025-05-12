import { useEffect, useState } from "react"
import { Activity, ActivityClass, AdminActivityClass } from "../../../api/activity"
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowActivity, ShowActivityButton } from "./SimpleActivity";
import { User } from "../../../api/user";

export function ManageMyActivity() {
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const [user, setUser] = useState<User | null>(null)
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        const activities = await client.getMyActivities();
        setActivities(activities);
        const use = await client.getMe()
        setUser(use)
      })();
    }, []);
  
    if (activities === null) {
      return <Loading title="Chargement des activités" />
    }
  
    if (activities.length === 0) {
      return <div>Aucune activité trouvée.</div>;
    }
  
    return (
      <div>
        <h1>Mes Activités</h1>
        <div>
          {activities.map((activity) => (
            <section>
              <ShowActivity
                activity={activity}
                user={user}
                onManage={(id) => navigate(`${Route.manageActivity}/${id}`)}
                onViewPublication={(id) => navigate(`${Route.publications}/${id}`)}
                buttonShow={ShowActivityButton.ViewPublication | ShowActivityButton.Manage}
              />
            </section>
            
          ))}
        </div>
      </div>
    );
}

function ManageActivityAdmin(){
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      (async () => {
        const client = new AdminActivityClass();
        if(!client.isAdmin()){
          return
        }
        const activities = await client.getAllActivitiesAdmin();
        setActivities(activities);
        
        const use = await client.getMe()
        setUser(use)
      })();
    }, []);
  
    if (activities === null) {
      return <Loading title="Chargement des activités" />
    }
  
    if (activities.length === 0) {
      return <div>Aucune activité trouvée.</div>;
    }
    return (
      <div>
        <h1>Activités</h1>
        <div>
          {activities.map((activity) => (
            <ShowActivity
                activity={activity}
                user={user}
                onViewPublication={(pubId) => navigate(`${Route.publications}/${pubId}`)}
                onManage={(actId) => navigate(`${Route.manageActivity}/${actId}`)}
                buttonShow={ShowActivityButton.All}
            />
          ))}
        </div>
      </div>
    );
}

function ManageOneActivity(){

  const [activity, setActivities] = useState<Activity | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
   const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        if(id){
          const activitie = await client.getActivityByID(id);
          setActivities(activitie);

          const use = await client.getMe()
          setUser(use)
        }
      })();
    }, [id]);
  
    if (activity === null) {
      return <Loading title="Chargement de l'activité" />
    }

    
    return (
      <div>
        <h1>EN TRAVAUX</h1>
        <ShowActivity
            activity={activity}
            user={user}
            onViewPublication={() => navigate(`${Route.publications}/${activity.publication._id}`)}
            onManage={() => navigate(`${Route.manageActivity}/${activity._id}`)}
            buttonShow={ShowActivityButton.None}
        />
      </div>
    );
}


export function ManageActivity(){
    const [userIsAdmin, setUserAdmin] = useState(false)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            setUserAdmin(client.isAdmin())
        })
    }, [])

    useEffect(() => {
        if (userIsAdmin === false && !id) {
            navigate(`${Route.manageMyActivity}`);
        }
    }, [userIsAdmin, navigate]);

    if(id){
        return <><ManageOneActivity/></>
    }
    return <>
      <button onClick={() => navigate(`${Route.manageMyActivity}`)}>Manage My Activies</button>
        <ManageActivityAdmin />
    </>
}


export default ManageActivity