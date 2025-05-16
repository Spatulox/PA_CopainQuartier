import { useEffect, useState } from "react"
import { Activity, ActivityClass, AdminActivityClass } from "../../../api/activity"
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowActivity, ShowActivityButton, UpdateActivity } from "./SingleActivity";
import { User, UserRole } from "../../../api/user";
import { useAuth } from "../shared/auth-context";

const { me } = useAuth();

export function ManageMyActivity() {
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
                user={me}
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
                user={me}
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
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        if(id){
          const activitie = await client.getActivityByID(id);
          setActivities(activitie)
        }
      })();
    }, [id]);
  
    if (activity === null) {
      return <Loading title="Chargement de l'activité" />
    }

    const handlUpdate = async (id: string, option: object) => {
        const client = new ActivityClass()
        await client.updateActivity(id, option)
    }

    const handlDelete = async (id: string) => {
        const client = new ActivityClass()
        await client.deleteActivity(id)
    }
    
    return (
      <div>
        <h1>EN TRAVAUX</h1>
        <UpdateActivity
          key={activity._id}
          activity={activity}
          user={me}
          onUpdate={(id: string, option: object) => handlUpdate(id, option)}
          onDelete={handlDelete}
        />
      </div>
    );
}


export function ManageActivity(){
    const { id } = useParams<{ id: string }>();
    const [isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            const client = new ActivityClass()

            if(me?.role == UserRole.admin){
              setIsAdmin(true)
            } else {
              setIsAdmin(false)
            }
        })()
    }, [id])

    if(!id && !isAdmin){
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