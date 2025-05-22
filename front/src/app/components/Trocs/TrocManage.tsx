import { use, useEffect, useState } from "react";
import { Route } from "../../constantes";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTrocClass, Troc, TrocClass } from "../../../api/troc";
import { ShowTroc, ShowTrocButton } from "./SimpleTroc";
import { User } from "../../../api/user";
import Loading from "../shared/loading";
import ApproveTroc from "./ApproveTroc";
import { useAuth } from "../shared/auth-context";
import NotFound from "../shared/notfound";
import { UpdateTroc } from "./UpdateTroc";
import { PopupConfirm } from "../Popup/PopupConfirm";

export function ManageMyTroc(){
  const { me, isAdmin } = useAuth();
    const [trocs, setTrocs] = useState<Troc[] | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false)
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new TrocClass();
        const troc = await client.getAllMyTrocs();
        if(!troc){
          setNotFound(true)
          return
      }
        setTrocs(troc);
      })();
    }, []);
    
    if(notFound){
      return <NotFound />
    }

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
    const [notFound, setNotFound] = useState<boolean>(false)
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new AdminTrocClass();
        const troc = await client.getAllAdminTroc();
        if(!troc){
          setNotFound(true)
          return
        }
        setTrocs(troc);
      })();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.troc}`);
        }
    }, [isAdmin, navigate]);
    
    if(notFound){
      return <NotFound />
    }

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
    const [troc, setTroc] = useState<Troc | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false)
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(0);

    const { me, isAdmin } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        if(id){
          if(isAdmin){
            const client = new AdminTrocClass();
            const rto = await client.getAdminTrocByID(id);
            if(!rto){
              setNotFound(true)
              return
            }
            setTroc(rto);
          } else {
            const client = new TrocClass();
            const rto = await client.getTrocByID(id);
            if(!rto){
              setNotFound(true)
              return
            }
            setTroc(rto);
          }
        }
      })();
    }, [id, refresh]);

    if(notFound){
      return <NotFound />
    }

    if(!id){
      navigate(`${Route.troc}`)
      return
    }

    if (troc === null) {
      return <Loading title="Chargement du troc" />
    }

    
    const handlUpdate = async (id: string, option: object) => {
      if(troc.author?._id == me?._id || isAdmin){
        const client = new TrocClass()
        await client.updateTroc(id, option)
        setRefresh(r => r + 1)
      }
    }
    
    const handlDelete = async (id: string) => {
      setDeleteId(id)
      setShowConfirm(true)
    }

    const confirmCancelReservation = async () => {
      if (deleteId) {
        const client = new TrocClass();
        await client.cancelTroc(id);
        setShowConfirm(false);
        setDeleteId(null);
      }
    };

    const confirmDelete = async () => {
        if (deleteId) {
          const client = new TrocClass();
          if(troc.author?._id == me?._id || isAdmin){
            await client.deleteTroc(deleteId);
            setShowConfirm(false);
            setDeleteId(null);
            setRefresh(r => r + 1)
          }
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteId(null);
    };
    
    return <>
        <UpdateTroc
            key={troc!._id}
            troc={troc!}
            user={me}
            onUpdate={(id: string, option: object) => handlUpdate(id, option)}
            onDelete={handlDelete}
            onCancelReservation={confirmCancelReservation}
        />
        {showConfirm && (
            <PopupConfirm
            key={deleteId}
            title="Suppression d'une publication"
            description="Voulez-vous réellement supprimer cette publication ?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            />
        )}
    </>
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