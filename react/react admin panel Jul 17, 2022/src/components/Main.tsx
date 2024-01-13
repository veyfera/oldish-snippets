import React, {FunctionComponent, useContext, useEffect, useState} from 'react';
import MicroModal from 'micromodal';

import Header from './Header';
import GeneralInfo from './GeneralInfo';
import ContactInfo from './ContactInfo';
import AttachedPohotos from './Photos';

import {AuthContext} from '../context/AuthContext';
import {CompanyInterface} from '../types';

import editImg from '../images/dist/Edit.svg';
import saveImg from '../images/dist/Save.svg';
import ModalWrapper from './ModalWrapper';
import DeleteModal from './DeleteModal';



const Main:FunctionComponent = () => {

    const authToken = useContext(AuthContext)
    const [company, setCompany] = useState<CompanyInterface>()
    
    const getCompany = async () => {
        let res = await fetch('/companies/12', {
            headers: {
                "Authorization": authToken,
                "Content-Type": "application/json"
            }
        });
        let data = await res.json()
        setCompany(data)
        console.log(data)
    }

    useEffect(() => {
        if (authToken){
            getCompany()
        }
    }, [authToken])

    useEffect(() => {
        MicroModal.init({
        openTrigger: 'data-micromodal-open',
        closeTrigger: 'data-micromodal-close',
        disableScroll: true,
        disableFocus: true,
        awaitOpenAnimation: true,
        awaitCloseAnimation: true
        })
    })


    const [editMode, setEditMode] = useState(false)
    const shortName = React.createRef<HTMLInputElement>()

    const ToggleEditMode = async () => {
        setEditMode(!editMode)
        if (editMode) {
            updateData()
        }
    }

    const updateData = async () => {
    let req = await fetch('/companies/12/', {
        headers: {
            "Authorization": authToken,
            "Content-Type": "application/json"
        },
        method: 'PATCH',
        body: JSON.stringify({
            shortName: shortName.current?.value
        })
    })
    let res = await req.json()
    if (!res.error) setCompany(res)
    console.log('update happened, ', res)
}


    return (
        <main>
            <Header />

            <div className="main-block">
                <div className="main-block__title">
                    {editMode ?
                        <div className="label__container">
                            <label className="label_floating" htmlFor="shortName">Короткое название</label>
                            <input type="text" defaultValue={company?.shortName} id="shortName" className="input_short-name" ref={shortName} autoComplete="off" />
                        </div>
                    :
                        <h2>{company && company.shortName}</h2>
                    }
                    <img src={editMode ? saveImg : editImg} alt="Редактировать" onClick={ToggleEditMode}/>
                </div>

                {company && <GeneralInfo company={company} setCompany={setCompany} />}

                {company && <ContactInfo contactId={company.contactId} />}

                {company && <AttachedPohotos photos={company.photos} />}

            </div>
            <ModalWrapper>
                {company && <DeleteModal id={company.id}/>}
            </ModalWrapper>
        </main>

    )}
export default Main;
