import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {CompanyInterface} from '../types';

import editImg from '../images/dist/Edit.svg';
import saveImg from '../images/dist/Save.svg';

type Props = {
    company:CompanyInterface
    setCompany:Function
}

const GeneralInfo = ({company, setCompany}:Props) => {
    
    const authToken = useContext(AuthContext)
    const [editMode, setEditMode] = useState(false)

    const toggleEditMode = () => {
        setEditMode(!editMode)
        if (editMode) {
            updateData()
        }
    }

    const updateData = async () => {
        getCompanyType()
        let req = await fetch('/companies/12/', {
            headers: {
                "Authorization": authToken,
                "Content-Type": "application/json"
            },
            method: 'PATCH',
            body: JSON.stringify({
                name: companyName.current?.value,
                contract: {
                    no: contractNo.current?.value,
                    issue_date: contractDate.current?.valueAsDate
                },
                businessEntity: companyEntity.current?.value,
                'type': companyType,
            })
        })
        let res = await req.json()
        if (!res.error) setCompany(res)
        console.log('update happened, ', res)
}


    //Input data extraction and formating
    const companyName = React.createRef<HTMLInputElement>()
    const contractNo = React.createRef<HTMLInputElement>()
    const contractDate = React.createRef<HTMLInputElement>()
    const companyEntity = React.createRef<HTMLInputElement>()
    const companyAgent = React.createRef<HTMLInputElement>()
    const companyContractor = React.createRef<HTMLInputElement>()

    const padTo2Digits = (num:number) => {
        return num.toString().padStart(2, '0');
    }

    const tmpDate = new Date(Date.parse(company.contract.issue_date));
    const formatedDate = tmpDate.toLocaleDateString("ru-RU");
    const dateValue =   [
      tmpDate.getFullYear(),
      padTo2Digits(tmpDate.getMonth() + 1),
      padTo2Digits(tmpDate.getDate()),
    ].join('-')

    let companyType:string[] = [];
    const getCompanyType = () => {
        if (companyAgent.current?.checked) {
            companyType.push('agent')
        }
        if (companyContractor.current?.checked) {
            companyType.push('contractor')
        }
    }

    return(

        <div className="main-block__info">
            <div className="info__title">
                <h3>ОБЩАЯ ИНФОРМАЦИЯ</h3>
                <img src={editMode ? saveImg : editImg} alt="Редактировать" onClick={toggleEditMode}/>
            </div>

            <div className="info__data">
                <div className="data-item">
                    <div className="data-item__label">Полное название:</div>
                    {editMode ?
                    <input type="text"  defaultValue={company.name} ref={companyName}/>
                    :
                    <p className="data-item__text">{company.name}</p>
                    }
                </div>
                <div className="data-item">
                    <div className="data-item__label">Договор:</div>
                    {editMode ?
                        <div>
                            <input type="number" defaultValue={company.contract.no} ref={contractNo}/>
                            <input type="date" defaultValue={dateValue} ref={contractDate}/>
                        </div>
                    :
                    <p className="data-item__text">{company.contract.no} от {formatedDate}</p>
                    }
                </div>
                <div className="data-item">
                    <div className="data-item__label">Форма:</div>
                    {editMode ?
                    <input type="text" defaultValue={company.businessEntity} ref={companyEntity}/>
                    :
                    <p className="data-item__text">{company.businessEntity}</p>
                    }
                </div>
                <div className="data-item">
                    <div className="data-item__label">Тип:</div>
                    {editMode ?
                    <div>
                        <label>Агент
                            <input type="checkbox" defaultChecked={company.type.indexOf('agent') !== -1} value="agent" ref={companyAgent}/>
                        </label>
                        <label>Подрядчик
                            <input type="checkbox" defaultChecked={company.type.indexOf('contractor') !== -1} value="contractor" ref={companyContractor}/>
                        </label>
                    </div>
                    :
                    <p className="data-item__text">{company.type.map((cType:string, i:number) => {
                        let formatedType:string;

                        if (cType === 'agent') {
                            formatedType = 'Агент'
                        } else if (cType === 'contractor') {
                            formatedType = ' Подрядчик'
                        }
                        if (i + 1 !== company.type.length) {
                            formatedType! += ', '
                        }
                        return formatedType!
                    })}</p>
                    }
                </div>
            </div>

        </div>
          )
}

export default GeneralInfo;
