import { useEffect, useState } from "react"
import { Activity, ActivityClass, AdminActivityClass } from "../../../api/activity"
import { useNavigate, useParams } from "react-router-dom";
import { Route } from "../../constantes";
import Loading from "../shared/loading";
import { ShowActivity, ShowActivityButton } from "./SingleActivity";
import { useAuth } from "../shared/auth-context";
import { PopupConfirm } from "../Popup/PopupConfirm";
import NotFound from "../shared/notfound";
import { UpdateActivity } from "./UpdateActivity";


export function ManageMyActivity() {
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)
    const { me } = useAuth();
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        const activities = await client.getMyActivities();
        if(!activities){
          setNotFound(true)
          return
        }
        setActivities(activities);
      })();
    }, []);
    
    if(notFound){
      return <NotFound />
    }

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
    const [notFound, setNotFound] = useState<boolean>(false);
    const { me, isAdmin } = useAuth();

    useEffect(() => {
      (async () => {
        const client = new AdminActivityClass();
        await client.refreshUser()
        const activities = await client.getAllActivitiesAdmin();
        if(!activities){
          setNotFound(true)
          return
        }
        setActivities(activities);
      })();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.activity}`);
        }
    }, [isAdmin, navigate]);
    
    if(notFound){
      return <NotFound />
    }

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
                onManage={() => navigate(`${Route.manageActivity}/${activity._id}`)}
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
  const { me, isAdmin } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        if(id){
          const activitie = await client.getActivityByID(id);
          if(!activitie){
            setNotFound(true)
            return
          }
        }
      })();
    }, [id]);
  
    if(notFound){
      return <NotFound />
    }

    if (activity === null) {
      return <Loading title="Chargement de l'activité" />
    }

    const handlUpdate = async (id: string, option: object) => {
        const client = new ActivityClass()
        await client.updateActivity(id, option)
    }

    const handlDelete = async (id: string) => {
      setDeleteId(id)
      setShowConfirm(true)
    }

    const confirmDelete = async () => {
      if (deleteId) {
        const client = new ActivityClass();
        await client.deleteActivity(deleteId);
        setShowConfirm(false);
        setDeleteId(null);
      }
    };

    const cancelDelete = () => {
      setShowConfirm(false);
      setDeleteId(null);
    };
    
    return (
      <div>
        <UpdateActivity
          key={activity._id}
          activity={activity}
          user={me}
          onUpdate={(id: string, option: object) => handlUpdate(id, option)}
          onDelete={handlDelete}
        />
        {showConfirm && (
          <PopupConfirm
            key={deleteId}
            title="Suppression d'une activité"
            description="Voulez-vous réellement supprimer cette activité ?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    );
}


export function ManageActivity(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    const { me, isAdmin } = useAuth();

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