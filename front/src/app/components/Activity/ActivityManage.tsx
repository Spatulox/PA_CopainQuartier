import { useEffect, useState } from "react"
import { Activity, ActivityClass, AdminActivityClass } from "../../../api/activity"
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
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
      return <div>Aucune activitée trouvée.</div>;
    }
  
    return (
      <div>
        <h1>Mes Activités</h1>
        <div>
          {activities.map((activity) => (
            <section>
              <ShowActivity
                key={activity._id}
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
        await client.refreshUser()
        if(!client.isAdmin()){
          navigate(`${Route.activity}`)
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
      return <div>Aucune activitée trouvée.</div>;
    }
    return (
      <div>
        <h1>Activités</h1>
        <div>
          {activities.map((activity) => (
            <ShowActivity
                key={activity._id}
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
            key={activity._id}
            activity={activity}
            user={user}
            buttonShow={ShowActivityButton.None}
        />
      </div>
    );
}


export function ManageActivity(){
    const [userIsAdmin, setUserAdmin] = useState<boolean>()
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new ActivityClass()
            await client.refreshUser()
            setUserAdmin(client.isAdmin())
        })()
    }, [])

    useEffect(() => {
        if (userIsAdmin === false && !id) {
          navigate(`${Route.manageMyActivity}`);
        }
    }, [userIsAdmin, navigate, id]);


    if(!id || userIsAdmin){
      return <Loading />
    }

    if(id){
        return <><ManageOneActivity/></>
    }
    return <>
        <ManageActivityAdmin />
        <button onClick={() => navigate(`${Route.manageMyActivity}`)}>Gérer mes Activités</button>
    </>
}


export default ManageActivity