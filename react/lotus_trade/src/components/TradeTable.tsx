import { useState, useEffect, createContext } from 'react';
import TradeTableHead from './TradeTableHead';
import TradeTableBody from './TradeTableBody';
import { initialiseTradeTimer } from '../utils';

interface TableProps {
    startTime:string
}

export const TableContext = createContext({} as any);

const TradeTable = ({startTime}:TableProps) => {

    const tableParams = [
        {label: 'Наличие комплекса мероприятий, повышающих стандарты качества изготовления', name: 'param1'},
        {label: 'Срок изготовления лота, дней', name: 'param2'},
        {label: 'Гарантийные обязательства, мес', name: 'param3'},
        {label: 'Условия оплаты', name: 'param4'},
        {label: 'Стоимость изготовления лота руб (без НДС)', name: 'param5'},
    ]

    const tradeData = [
        {
            userName: 'Петр I',
            param1: '-',
            param2: 80,
            param3: 24,
            param4: 30,
            param5: 3700000,
        },
        {
            userName: 'Никола́й II',
            param1: '-',
            param2: 90,
            param3: 23,
            param4: 100,
            param5: 3200000,
        },
        {
            userName: 'Алекса́ндр III',
            param1: '-',
            param2: 75,
            param3: 22,
            param4: 60,
            param5: 2800000,
        },
        {
            userName: 'Ива́н IV',
            param1: 'есть',
            param2: 120,
            param3: 36,
            param4: 50,
            param5: 2500000,
        },
    ]

    //const turnDuration = 120;
    const turnDuration = 15;

    const providerValue = {startTime: startTime, turnDuration: turnDuration, tableData: tradeData, tableParams: tableParams }

    return(
        <table>
            <TableContext.Provider value={providerValue}>
                <TradeTableHead />
                <TradeTableBody />
            </TableContext.Provider>
        </table>
    );
}

export default TradeTable;
