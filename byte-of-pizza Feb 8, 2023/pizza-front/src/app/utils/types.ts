
export type Order = {
    _id:string,
    user:Client,
    orderInfo:OrderInfo,
    status: Category
    createdAt:string,
    updatedAt:string,
}

export type Client = {
    id:string,
    username:string,
    name:string,
    team_id:object,
    img:string
}

export type OrderInfo = {
    pizza_name: SelectOption,
    pizza_size: SelectOption,
    pizza_dough: SelectOption,
    pizza_border: SelectOption,
    pizza_additive: SelectOption,
    pizza_address: string,
    pizza_comment: string,
}

export type SelectOption = {
    text: {
        type: string,
        text: string,
        emoji: string
    },
    value: string
}

export type Category = {
    text:string,
    value:string
}

export type User = {
    id:string,
    username:string,
    token?:string,

}
