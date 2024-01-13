import { useState, useEffect, useContext } from 'react';
import { initialiseTradeTimer } from '../utils';
import { TableContext } from './TradeTable';
import { TableData } from '../types';

import TurnTimer from './TurnTimer';

const TradeTableHead= () => {

    let {startTime, turnDuration, tableData} = useContext(TableContext);

    const [delaySeconds, setDelaySeconds] = useState(turnDuration);
    const [activeUser, setActiveUser] = useState(1);

    const changeActiveUser = () => {
        setActiveUser(activeUser < tableData.length ? activeUser+1 : 1);
        if (delaySeconds !== turnDuration) setDelaySeconds(turnDuration);
        console.log('changed to user: ', activeUser)
    }

    useEffect(() => {
        const [activeUser, delay] = initialiseTradeTimer(Date.parse(startTime), turnDuration, tableData.length);
        setDelaySeconds(delay);
        setActiveUser(activeUser);
    }, [])

    return (
        <thead>
            <tr>
                <th>Ход</th>
                {tableData.map((data:TableData, i:number) =>
                    i+1 === activeUser ?
                    <th key={Math.random()} className="turn-timer"><TurnTimer delaySeconds={delaySeconds} nextUser={changeActiveUser} /></th> :
                    <th key={Math.random()}></th>)}
            </tr>
            <tr>
                <th>Параметры и требования</th>
                {tableData.map((data:TableData, c:number) => <th key={c}>Участник №{c+1}<span>{data.userName}</span></th>)}
            </tr>
        </thead>
    );
}

export default TradeTableHead;
