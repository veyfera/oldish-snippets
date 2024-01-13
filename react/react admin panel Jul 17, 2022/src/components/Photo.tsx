import {FunctionComponent, useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import closeImg from '../images/dist/Close-menu.svg';
import {PhotoType} from '../types';

type Props = {
    photo:PhotoType
    newPhotos:PhotoType[]
    setNewPhotos:Function
}

const Photo:FunctionComponent<Props> = ({photo, newPhotos, setNewPhotos}) => {
    const authToken = useContext(AuthContext)

    const handleImageRemove = async () => {
        console.log('remove photo with name: ', photo.name)
        let req = await fetch(`/companies/12/image/${photo.name}`, {
            headers: {
                "Authorization": authToken,
            },
            method: 'DELETE',
        })
        setNewPhotos(newPhotos.filter(p => p.name !== photo.name))
        console.log(req)
    }


    return(
        <div className="photo" key={photo.filepath}>
            <img src={photo.thumbpath} alt="Фотография" className="photo__img" />
            <p className="photo__name">{photo.name}</p>
            <p className="photo__date">11 июня 2018</p>
            <img className="photo__delete" src={closeImg} alt="Удалить" onClick={handleImageRemove} />
        </div>
    )

    }

export default Photo;
