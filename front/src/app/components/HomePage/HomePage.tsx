import { Link } from "react-router-dom"
import { Route } from "../../constantes";
import PublicationList from "../Publications/PublicationsList";
import ActivityList from "../Activity/ActivityList";
import TrocList from "../Trocs/TrocsList";

// app/pages/home_page.tsx
function HomePage() {
    return (
      <>
        <h1>Home Page</h1>
        <div>
          <PublicationList />
          <ActivityList />
          <TrocList />
        </div>
      </>
    );
}

export default HomePage