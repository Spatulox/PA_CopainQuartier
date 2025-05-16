import { use, useEffect, useState } from "react";
import { Route } from "../../constantes";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTrocClass, Troc, TrocClass } from "../../../api/troc";
import { ShowTroc, ShowTrocButton } from "./SimpleTroc";
import { User } from "../../../api/user";
import Loading from "../shared/loading";
import ApproveTroc from "./ApproveTroc";
import { useAuth } from "../shared/auth-context";

export function ManageMyTroc(){
  const { me, isAdmin } = useAuth();
    const [trocs, setTrocs] = useState<Troc[] | null>(null);
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new TrocClass();
        const troc = await client.getAllMyTrocs();
        setTrocs(troc);
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
                key={trok._id}
                troc={trok}
                user={me}
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
    const { me, isAdmin } = useAuth();
    const [trocs, setTrocs] = useState<Troc[] | null>(null);
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new AdminTrocClass();
        await client.refreshUser()
        const troc = await client.getAllAdminTroc();
        setTrocs(troc);
      })();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.troc}`);
        }
    }, [isAdmin, navigate]);
  
    if (trocs === null) {
      return <Loading title="Chargement des trocs" />
    }
  
    if (trocs.length === 0) {
      return <div>Aucuns Trocs trouvés.</div>;
    }
    return (
      <div>
        <h1>Troc</h1>
        {trocs.map((trok) => (
          <ShowTroc
              key={trok._id}
              troc={trok}
              user={me}
              onManage={(trocId) => navigate(`${Route.manageTrocs}/${trocId}`)}
              buttonShow={ShowTrocButton.Troc | ShowTrocButton.Manage}
          />
        ))}
      </div>
    );
}

function ManageOneTroc(){
    const [troc, setActivities] = useState<Troc | null>(null);
    const { me, isAdmin } = useAuth();
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
            key={troc._id}
            troc={troc}
            user={user}
            buttonShow={ShowTrocButton.None}
        />
      </div>
    );
}

export function ManageTroc(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    
    // USed to redirect someone if in the url it's /manage and it's not an admin user
    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            await client.refreshUser()
            if(client.isAdmin() === false && !id){
              navigate(`${Route.manageMyTrocs}`);
            }
        })()
    }, [])

    if(id){
        return <><ManageOneTroc/></>
    }
    return <>
        <ManageTrocAdmin />
        <ApproveTroc />
        <button onClick={() => navigate(`${Route.manageMyTrocs}`)}>Gérer mes Trocs</button>
    </>
}


export default ManageTroc