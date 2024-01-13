import homeImg from '../images/dist/Home.svg';
import marketImg from '../images/dist/Market.svg';
import searchImg from '../images/dist/Search.svg';
import settingsImg from '../images/dist/Settings.svg';
import chatImg from '../images/dist/Chat.svg';
import exitImg from '../images/dist/Exit.svg';
import buildingImg from '../images/dist/Building.svg';

const Aside = () => {
    return (
        <aside className="side-menu">
            <nav className="side-menu__navigation">
                <div className="navigation__icons navigation__icons_position_top">
                    <a href="#"><img src={homeImg} alt="Главнвя" /></a>
                    <a href="#" className="icon_selected"><img src={marketImg} alt="Рынок"/></a>
                    <a href="#"><img src={searchImg} alt="Поиск" /></a>
                </div>
                <div className="navigation__icons navigation__icons_position_bottom">
                    <a href="#"><img src={settingsImg} alt="Настройки" /></a>
                    <a href="#"><img src={chatImg} alt="Чат" /></a>
                    <a href="#"><img src={exitImg} alt="Выход" /></a>
                </div>
            </nav>

            <div className="aside__content">
                <div className="logo">
                    ЧЕСТНЫЙ АГЕНТ
                    <span>МЕНЕДЖЕР ПРОЦЕССА</span>
                </div>
                <div className="content__organisations">
                    <div className="organisation__item">
                        <img src={buildingImg} alt="Организации" />
                        <p>Организации</p>
                    </div>
                </div>
            </div>
        </aside>

    )
}

export default Aside
