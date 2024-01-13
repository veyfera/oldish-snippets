
export const initialiseTradeTimer = (startTime:number, turnDuration:number, numberOfUsers:number) => {
    let curentTime = Date.now();

    let diff = Math.abs(startTime - curentTime) / 1000;

    let fullCycles= Math.floor(diff/(turnDuration * numberOfUsers));
    let secondsFromStartOfNewCycle = diff - fullCycles * turnDuration * numberOfUsers;
    let activeUser = Math.ceil(secondsFromStartOfNewCycle / turnDuration);

    let timeTillNextTurn = Math.floor((activeUser * turnDuration) - secondsFromStartOfNewCycle);

    console.log(fullCycles, ' full cycles', secondsFromStartOfNewCycle, ', seconds reminder')
    console.log('It is turn of user №', activeUser, ' seconds left till next turn', timeTillNextTurn)


    return [activeUser, timeTillNextTurn]

}
