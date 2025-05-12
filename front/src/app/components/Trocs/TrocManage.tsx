import { useEffect, useState } from "react";
import { Route } from "../../constantes";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTrocClass, Troc, TrocClass } from "../../../api/Troc";
import { ShowTroc, ShowTrocButton } from "./SimpleTroc";
import { User } from "../../../api/user";
import Loading from "../shared/loading";

export function ManageMyTroc(){
    const [trocs, setTrocs] = useState<Troc[] | null>(null);
    const [user, setUser] = useState<User | null>(null)
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new TrocClass();
        const troc = await client.getAllMyTrocs();
        setTrocs(troc);
        const use = await client.getMe()
        setUser(use)
      })();
    }, []);
  
    if (trocs === null) {
      return <Loading title="Chargement des trocs" />
    }
  
    if (trocs.length === 0) {
      return <div>Aucun trocs trouvés.</div>;
    }
  
    return (
      <div>
        <h1>Mes Trocs</h1>
        <div>
          {trocs.map((trok) => (
            <section>
              <ShowTroc
                troc={trok}
                user={user}
                onManage={(id) => navigate(`${Route.manageTrocs}/${id}`)}
                onViewTroc={(id) => navigate(`${Route.troc}/${id}`)}
                buttonShow={ShowTrocButton.Troc | ShowTrocButton.Manage}
              />
            </section>
            
          ))}
        </div>
      </div>
    );
}

function ManageTrocAdmin(){
    const [trocs, setTrocs] = useState<Troc[] | null>(null);
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      (async () => {
        const client = new AdminTrocClass();
        if(!client.isAdmin()){
          return
        }
        const activities = await client.getAllAdminTroc();
        setTrocs(activities);
        
        const use = await client.getMe()
        setUser(use)
      })();
    }, []);
  
    if (trocs === null) {
      return <Loading title="Chargement des trocs" />
    }
  
    if (trocs.length === 0) {
      return <div>Aucune activité trouvée.</div>;
    }
    return (
      <div>
        <h1>Troc</h1>
        <div>
          {trocs.map((trok) => (
            <ShowTroc
                troc={trok}
                user={user}
                onManage={(trocId) => navigate(`${Route.manageTrocs}/${trocId}`)}
                buttonShow={ShowTrocButton.All}
            />
          ))}
        </div>
      </div>
    );
}

function ManageOneTroc(){
    const [troc, setActivities] = useState<Troc | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
   const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      (async () => {
        const client = new TrocClass();
        if(id){
          const activitie = await client.getTrocByID(id);
          setActivities(activitie);

          const use = await client.getMe()
          setUser(use)
        }
      })();
    }, [id]);
  
    if (troc === null) {
      return <Loading title="Chargement du troc" />
    }

    
    return (
      <div>
        <h1>EN TRAVAUX</h1>
        <ShowTroc
            troc={troc}
            user={user}
            buttonShow={ShowTrocButton.None}
        />
      </div>
    );
}

export function ManageTroc(){
    const [userIsAdmin, setUserAdmin] = useState(false)
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            setUserAdmin(client.isAdmin())
        })
    }, [])
    
    useEffect(() => {
        if (userIsAdmin === false && !id) {
            navigate(`${Route.manageMyActivity}`);
        }
    }, [userIsAdmin, navigate]);

    if(id){
        return <><ManageOneTroc/></>
    }
    return <>
      <button onClick={() => navigate(`${Route.manageMyActivity}`)}>Manage My Activies</button>
        <ManageTrocAdmin />
    </>
}


export default ManageTroc