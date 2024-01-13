import { useState, useEffect, useContext } from 'react';
import { TableContext } from './TradeTable';

import { initialiseTradeTimer } from '../utils';
import { TableProp, TableData } from '../types';



const TradeTableBody = () => {

    const {tableParams, tableData} = useContext(TableContext);

    return(
        <tbody>
            {tableParams.map((param:TableProp, c:number) => (
                <tr key={param.label}>
                    <td>{param.label}</td>
                    {tableData.map((data:TableData) => <td key={data.userName}>{data[param.name as keyof TableData]}</td>)}
                </tr>
                ))
            }
        </tbody>
    );
}

export default TradeTableBody;
