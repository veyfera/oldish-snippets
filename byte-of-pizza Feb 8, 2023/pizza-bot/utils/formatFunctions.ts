
type Order = {
  user:object,
  orderInfo:object
}

export const formatOrder = (data: any) => {
  console.log('Reply form slack: ', data);
  const formatedOrder:Order= { user: data.user, orderInfo: {} };
  formatedOrder.user.img = `https://ca.slack-edge.com/${data.user.team_id}-${data.user.id}-09b1bde6579a-72`
  Object.keys(data.state.values).forEach(key => formatedOrder.orderInfo[key] = data.state.values[key].pizza_option.selected_option || data.state.values[key].pizza_option.value)
  console.log(formatedOrder);

  return formatedOrder
}