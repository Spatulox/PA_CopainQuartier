import {Link} from "react-router-dom"
import {Route} from "../../constantes";
import PublicationList from "../Publications/PublicationsList";
import ActivityList from "../Activity/ActivityList";
import TrocList from "../Trocs/TrocsList";
import {useAuth} from "../shared/auth-context";
import "./Home.css"

function HomePage() {
    const {me, isAdmin} = useAuth();
    return (
        <div className="homepage-container">
            <h1>Home Page</h1>
            <span>Parcourez les dernières actualités {me?.name} !</span>
            <div className="section-wrapper">
                <div className="section">
                    <PublicationList limit={3}/>
                </div>
                <div className="section">
                    <ActivityList limit={3}/>
                </div>
                <div className="section">
                    <TrocList limit={3}/>
                </div>
            </div>
        </div>
    );
}

export default HomePage