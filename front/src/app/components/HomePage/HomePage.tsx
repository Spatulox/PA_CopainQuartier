import { Link } from "react-router-dom"
import { Route } from "../../constantes";
import PublicationList from "../Publications/PublicationsList";
import ActivityList from "../Activity/ActivityList";
import TrocList from "../Trocs/TrocsList";
import { useAuth } from "../shared/auth-context";

const { me } = useAuth();

function HomePage() {
    return (
      <>
        <h1>Home Page</h1>
        <span>Parcourez les dernières actualités {me?.name} !</span>
        <div>
          <PublicationList message="" limit={3} />
          <ActivityList message="" limit={3} />
          <TrocList message="" limit={3} />
        </div>
      </>
    );
}

export default HomePage