import MicroModal from "micromodal"
import {useContext} from "react"
import {AuthContext} from "../context/AuthContext"

type Props = {
    id:string
}

const DeleteModal = ({id}:Props) => {
    const authToken = useContext(AuthContext)
    const deleteCompany = async () => {
        let req = await fetch(`/companies/${id}`, {
            headers: {
                "Authorization": authToken,
            },
            method: 'DELETE',
        })
        console.log('compny delted', req)
        MicroModal.close('modal-delete-company')
    }
    return(
        <div className="modal micromodal-slide" id="modal-delete-company" aria-hidden="true">
			<div className="modal__overlay" tabIndex={-1} data-micromodal-close>
				<div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">

					<header className="modal__header">
						<h2>Удалить карточку</h2>
					</header>

					<div className="modal__content">
						<p>Отправить карточку организации в архив?</p>
                        
                        <div className="content__buttons">
                            <div data-micromodal-close>ОТМЕНА</div>
                            <div onClick={deleteCompany}>УДАЛИТЬ</div>
                        </div>
				</div>
			</div>
		</div>
    </div>

        
    )
}

export default DeleteModal;
