import { Link } from "react-router-dom"
import { Route } from "../../constantes";
import PublicationList from "../Publications/PublicationsList";
import ActivityList from "../Activity/ActivityList";
import TrocList from "../Trocs/TrocsList";

function HomePage() {
    return (
      <>
        <h1>Home Page</h1>
        <div>
          <PublicationList message="" limit={3} />
          <ActivityList message="" limit={3} />
          <TrocList message="" limit={3} />
        </div>
      </>
    );
}

export default HomePage