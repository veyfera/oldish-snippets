import TradeTable from './TradeTable';
import '../styles/Trade.css';

const Trade = () => {
    const startTime = '09.11.2020 07:00';

    return(
        <>
            <h1>Ход трогов <span>Тестовые торги на аппарат ЛОТОС №2033564 ({startTime})</span></h1>
            <p>Уважаемые участники, во время вашего хода вы можете изменить параметры трогов, указанных в таблице:</p>

            <TradeTable startTime={startTime} />
        </>
    );
}

export default Trade;
