import {Link, useLocation} from 'react-router-dom';

const Header = () => {
    const currentLocation = useLocation();
    return(
        <div className="main-header">
            {currentLocation.pathname !== '/' ? <Link to="/">Home</Link> : null}
        </div>
    )
}

export default Header;
