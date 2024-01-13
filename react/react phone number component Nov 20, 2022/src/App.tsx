import React from 'react';
import Input from './Input';
import './App.css';

function App() {
    const [inputValue, setInputValue] = React.useState<string>('')
    const [numbersArray, setNumbersArray] = React.useState<number[]>([
        1234567890,
        9528262065,
        9528262064,
        9578262465,
        9538262065,
        9528262765,
        9548242065,
        9528362065,
        9428262065,
        9558762064,
        9578362465,
        9532262065,
        9528162765,
        9548682065,
        9548369065
    ]);

    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault();
        let numericPhone:number = Number(inputValue.replaceAll('-', ''));
        //checks that phone is not in the array already
        if (!numbersArray.includes(numericPhone)){
            setNumbersArray(numbersArray.concat([numericPhone]))
            setInputValue('');
        }
    }

  return (
    <div className="App">
        <form onSubmit={(e) => handleSubmit(e)}>
            <Input
                name="phone"
                mask={"999-999-99-99"}
                searchArray={numbersArray}
                value={inputValue}
                onChange={setInputValue}
            />
        </form>
    </div>
  );
}

export default App;
