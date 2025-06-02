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
import Errors from "../shared/errors";
import { ErrorMessage } from "../../../api/client";
import { popup } from "../../scripts/popup-slide";


export function ManageMyActivity() {
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false)
    const { me } = useAuth();
  
    useEffect(() => {
      (async () => {
        const client = new ActivityClass();
        try{
          const activities = await client.getMyActivities();
          if(!activities){
            setNotFound(true)
            return
          }
          setNotFound(false)
          setActivities(activities);
          setErrors(null)
        } catch (e){
          setErrors(client.errors)
        }
      })();
    }, []);
    
    if(err != null){
        return <Errors errors={err} />
    }

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
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
    const [notFound, setNotFound] = useState<boolean>(false);
    const { me, isAdmin } = useAuth();

    useEffect(() => {
      (async () => {
        const client = new AdminActivityClass();
        try{
          await client.refreshUser()
          const activities = await client.getAllActivitiesAdmin();
          if(!activities){
            setNotFound(true)
            return
          }
          setNotFound(false)
          setActivities(activities);
        } catch(e){
          setErrors(client.errors)
        }
      })();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.activity}`);
        }
    }, [isAdmin, navigate]);
  
    if(err != null){
        return <Errors errors={err} />
    }

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
                buttonShow={ShowActivityButton.All | ShowActivityButton.Chat}
            />
          ))}
        </div>
      </div>
    );
}

function ManageOneActivity(){

  const [activity, setActivities] = useState<Activity | null>(null);
  const [err, setErrors] = useState<ErrorMessage | null>(null)
  const [delErr, setDelErrors] = useState<ErrorMessage | null>(null)
  const [updErr, setUpdateErrors] = useState<any | null>(null)
  const { id } = useParams<{ id: string }>();
  const { me, isAdmin } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        if(id){
          if(isAdmin){
            const client = new AdminActivityClass();
            try{
              const activitie = await client.getActivityAdminById(id);
              if(!activitie){
                setNotFound(true)
                return
              }
              setNotFound(false)
              setActivities(activitie)
              setErrors(null)
            } catch(e){
              setErrors(client.errors)
            }
          } else {
            const client = new ActivityClass();
            try{
              const activitie = await client.getActivityByID(id);
              if(!activitie){
                setNotFound(true)
                return
              }
              setNotFound(false)
              setErrors(null)
              setActivities(activitie)
            } catch(e){
              setErrors(client.errors)
            }
          }
        }
      })();
    }, [id]);

    if(err != null){
        return <Errors errors={err} />
    }

    if(notFound){
      return <NotFound />
    }

    if(!id){
      navigate(`${Route.activity}`)
      return
  }

    if (activity === null) {
      return <Loading title="Chargement de l'activité" />
    }

    const handlUpdate = async (id: string, option: object) => {
        const client = new ActivityClass()
        try{
          await client.updateActivity(id, option)
          setUpdateErrors(null)
        } catch(e){
          setUpdateErrors(client.errors)
        }
    }

    const handlDelete = async (id: string) => {
      setDeleteId(id)
      setShowConfirm(true)
    }

    const confirmDelete = async () => {
      if (deleteId) {
        const client = new ActivityClass();
        try{
          await client.deleteActivity(deleteId);
          setShowConfirm(false);
          setDeleteId(null);
          setDelErrors(null)
        } catch(e){
          setDelErrors(client.errors)
        }
      }
    };

    const cancelDelete = () => {
      setShowConfirm(false);
      setDeleteId(null);
    };

    if(delErr){
      popup(delErr.message)
    }

    return (
      <div>
        <UpdateActivity
          key={activity._id}
          activity={activity}
          APIerror={updErr}
          user={me}
          onUpdate={(id: string, option: object) => handlUpdate(id, option)}
          onDelete={handlDelete}
        />
        {showConfirm && (
          <PopupConfirm
            key={deleteId}
            title="Suppression d'une activité"
            description="Voulez-vous réellement supprimer cette activité ?"
            errors={delErr}
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