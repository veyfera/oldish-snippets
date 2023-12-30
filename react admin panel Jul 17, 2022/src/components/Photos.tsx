import {FunctionComponent, useContext, useRef, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {PhotoType} from '../types';
import Photo from './Photo';


type Props = {
    photos:PhotoType[]
}

const AttachedPohotos:FunctionComponent<Props> = ({photos}) => {
    const fileInput = useRef<HTMLInputElement>(null)
    const authToken = useContext(AuthContext)

    const handleAddButtonClick = () => {
        if (fileInput.current !== null) {
            fileInput.current.click()
        }
    }

    let newPhoto:PhotoType;

    const handleFileInput = (e:any) => {
        if (e !== null) {
            updateData()
        }
    }
    const [newPhotos, setNewPhotos] = useState<PhotoType[]>(photos)

    const updateData = async () => {
        const body = new FormData();
        if (fileInput.current?.files) {
            body.append('file', fileInput.current?.files[0])
        }
        let req = await fetch('/companies/12/image', {
            headers: {
                "Authorization": authToken,
            },
            method: 'POST',
            body,
        })
        let res = await req.json()
        if (!res.error) setNewPhotos([...newPhotos, res])
    }

    return(
        <div className="main-block__info">
            <div className="info__title">
                <h3>ПРИЛОЖЕННЫЕ ФОТО</h3>
            </div>
            {newPhotos.map(photo => (
                <Photo photo={photo} key={photo.thumbpath} setNewPhotos={setNewPhotos} newPhotos={newPhotos} />
            ))}
            <div className="button" onClick={handleAddButtonClick}>
                <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M1.9 8a.6.6 0 01.6-.6h11a.6.6 0 110 1.2h-11a.6.6 0 01-.6-.6z" fill="#82B284"/><path fillRule="evenodd" clipRule="evenodd" d="M8 1.9a.6.6 0 01.6.6v11a.6.6 0 11-1.2 0v-11a.6.6 0 01.6-.6z" fill="#82B284"/></svg>
                <p>ДОБАВИТЬ ИЗОБРАЖЕНИЕ</p>
                <input type="file" accept="image/*" className="input_file" ref={fileInput} onChange={(event) => handleFileInput(event)}/>
            </div>
        </div>
    )
}

export default AttachedPohotos;
