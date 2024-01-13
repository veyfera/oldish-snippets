export interface CompanyInterface  {
    shortName:string
    name:string
    contract:ContractType
    businessEntity:string
    'type':string[]
    contactId:number
    photos:PhotoType[]
    id:string
}

export interface ContactInterface {
    lastname:string
    firstname:string
    patronymic:string
    phone:string
    email:string
    updatedAt:string
}

type ContractType = {
    no:string
    issue_date:string
}

export type PhotoType = {
    name:string
    filepath:string
    thumbpath:string
}
