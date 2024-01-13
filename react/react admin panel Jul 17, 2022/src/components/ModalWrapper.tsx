import ReactDOM from 'react-dom';

const ModalWrapper = (props:any) => {
    const modalDiv = document.getElementById('modal');
    if (modalDiv){
        return ReactDOM.createPortal(props.children, modalDiv)
    }
    return <></>
}


export default ModalWrapper;
