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
          <PublicationList message="" />
          <ActivityList message="" />
          <TrocList message="" />
        </div>
      </>
    );
}

export default HomePage