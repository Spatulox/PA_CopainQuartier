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
import { ErrorMessage } from "../../../api/client";
import Errors from "../shared/errors";

type ManageTrocType = "applied" | "uploaded";

export function ManageMyTroc(){
  return <>
    <ManageMyTrocsType type="applied" />
    <ManageMyTrocsType type="uploaded" />
  </>
}

function ManageMyTrocsType({ type }: { type: ManageTrocType }) {
  const { me, isAdmin } = useAuth();
  const [trocs, setTrocs] = useState<Troc[] | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [err, setErrors] = useState<ErrorMessage | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const client = new TrocClass();
      try {
        const troc = type === "applied"
          ? await client.getAllTrocsApplied()
          : await client.getAllMyTrocs();
        if (!troc) {
          setNotFound(true);
          return;
        }
        setNotFound(false);
        setTrocs(troc);
        setErrors(null);
      } catch (e) {
        setErrors(client.errors);
      }
    })();
  }, [type]);

  if (err != null) {
    return <Errors errors={err} />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (trocs === null) {
    return <Loading title="Chargement des trocs" />;
  }

  if (trocs.length === 0) {
    return <div>Aucun trocs trouvés.</div>;
  }

  return (
    <div>
      <h1>{type === "uploaded" ? "Gérer mes Trocs" : "Gérer mes demandes"}</h1>
      <div>
        {trocs.map((trok) => (
          <section key={trok._id}>
            <ShowTroc
              key={trok._id}
              troc={trok}
              user={me}
              onViewTroc={(id) => navigate(`${Route.troc}/${id}`)}
              onManage={
                type === "uploaded"
                  ? (id) => navigate(`${Route.manageTrocs}/${id}`)
                  : undefined
              }
              buttonShow={
                type === "uploaded"
                  ? ShowTrocButton.Troc | ShowTrocButton.Manage
                  : ShowTrocButton.Troc
              }
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
    const [err, setErrors] = useState<ErrorMessage | null>(null)
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        const client = new AdminTrocClass();
        try{
          const troc = await client.getAllAdminTroc();
          if(!troc){
            setNotFound(true)
            return
          }

          setNotFound(false)
          setTrocs(troc);
          setErrors(null)
        } catch(e){
          setErrors(client.errors)
        }
      })();
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            navigate(`${Route.troc}`);
        }
    }, [isAdmin, navigate]);
    
    if(err != null){
        return <Errors errors={err} />
    }

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

    const [err, setError] = useState<ErrorMessage | null>(null)
    const [delErr, setDeleteError] = useState<ErrorMessage | null>(null)
    const [updErr, setUpdateError] = useState<ErrorMessage | null>(null)

    const { me, isAdmin } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
  
    useEffect(() => {
      (async () => {
        if(id){
          if(isAdmin){
            const client = new AdminTrocClass();
            try{
              const rto = await client.getAdminTrocByID(id);
              if(!rto){
                setNotFound(true)
                return
              }
              setNotFound(false)
              setTroc(rto);
              setError(null)
            } catch(e){
              setError(client.errors)
            }
          } else {
            const client = new TrocClass();
            try{
              const rto = await client.getTrocByID(id);
              if(!rto){
                setNotFound(true)
                return
              }
              setNotFound(false)
              setTroc(rto);
              setError(null)
            } catch(e){
              setError(client.errors)
            }
          }
        }
      })();
    }, [id, refresh]);

    if(err != null){
        return <Errors errors={err} />
    }

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
        try{
          await client.updateTroc(id, option)
          setRefresh(r => r + 1)
          setUpdateError(null)
        } catch(e){
          setUpdateError(client.errors)
        }
      }
    }
    
    const handlDelete = async (id: string) => {
      setDeleteId(id)
      setShowConfirm(true)
    }

    const confirmCancelReservation = async () => {
      if (deleteId) {
        const client = new TrocClass();
        try{
          await client.cancelTroc(id);
          setShowConfirm(false);
          setDeleteId(null);
          setDeleteError(null)
        } catch(e){
          setDeleteError(client.errors)
        }
      }
    };

    const confirmDelete = async () => {
        if (deleteId) {
          const client = new TrocClass();
          try{
            if(troc.author?._id == me?._id || isAdmin){
              await client.deleteTroc(deleteId);
              setShowConfirm(false);
              setDeleteId(null);
              setRefresh(r => r + 1)
            }
            setDeleteError(null)
          }catch(e){
            setDeleteError(client.errors)
          }
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteId(null);
        setDeleteError(null)
    };

    const approveTroc = async (id: string) => {
      const client = new AdminTrocClass()
      try{
          const option = {"approve": true}
          await client.approveTroc(id, option)
          const app = await client.getWaitingTroc()
          setTroc(troc)
          if(!app){
              setNotFound(true)
              return
          }
          setNotFound(false)
          setRefresh(r => r + 1)
          setError(null)
      }catch(e){
          setError(client.errors)
      }
    }

    return <>
        <UpdateTroc
            key={troc!._id}
            troc={troc!}
            user={me}
            APIerror={updErr}
            onUpdate={(id: string, option: object) => handlUpdate(id, option)}
            onDelete={handlDelete}
            onCancelReservation={confirmCancelReservation}
            approveTroc={(id: string) => approveTroc(id)}
        />
        {showConfirm && (
            <PopupConfirm
            key={deleteId}
            title="Suppression d'une publication"
            description="Voulez-vous réellement supprimer cette publication ?"
            errors={delErr}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            />
        )}
    </>
}

export function ManageTroc(){
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate()
    const [err, setErrors] = useState<ErrorMessage | null>(null)

    // USed to redirect someone if in the url it's /manage and it's not an admin user
    useEffect(() => {
        (async () => {
            const client = new TrocClass()
            try{
              await client.refreshUser()
              if(client.isAdmin() === false && !id){
                navigate(`${Route.manageMyTrocs}`);
              }
              setErrors(null)
            } catch(e){
              setErrors(client.errors)
            }
        })()
    }, [])

    if(err != null){
        return <Errors errors={err} />
    }
    
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