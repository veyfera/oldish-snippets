import backImg from '../images/dist/Long.svg';
import linkImg from '../images/dist/Linked.svg';
import reloadImg from '../images/dist/Rotation.svg';
import deleteImg from '../images/dist/Delete.svg';

const Header = () => {
    return (
        <header>
            <div className="header__content-wrapper">
                <div className="back-button">
                    <img src={backImg} alt="Назад" />
                    <p>К СПИСКУ ЮРИДИЧЕСКИХ ЛИЦ</p>
                </div>
                <div className="actions">
                    <img src={linkImg} alt="Ссылка" />
                    <img src={reloadImg} alt="Перезагрузить" />
                    <img src={deleteImg} alt="Удалить" data-micromodal-open="modal-delete-company" />
                </div>
            </div>
        </header>
        )
}


export default Header;
