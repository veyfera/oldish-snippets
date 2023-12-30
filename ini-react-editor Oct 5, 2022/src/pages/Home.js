import {Link} from 'react-router-dom';

const Home = () => {
    return(
        <div className="home">
            <h1>INI editor olnine</h1>
            <nav className="menu">
                <Link to="file/new" className="buttons__add">
                    Create new file
                </Link>
                <Link to="list" className="buttons__edit">
                    Edit an existing file
                </Link>
            </nav>
        </div>
    )
}

export default Home;
