import {useState, ChangeEvent} from 'react';
import { formatNumber } from './utils';

interface InputProps {
    name:string
    mask:string
    searchArray:number[]
    value:string
    onChange:Function
}

const Input = ({name, mask, searchArray, value, onChange}:InputProps) => {

    const [validNumber, setValidNumber] = useState<boolean>(false)
    let filteredArray = searchArray.filter(filterPhonesArray)

    //searches for current input in the 'searchArray'
    function filterPhonesArray(phone:number) {
        let strPhone = formatNumber(phone, mask);
        if (!value) return true
        return strPhone.startsWith(value)
    }

    function validatePhone (phone:string) {
        if (phone === formatNumber(phone, mask)) setValidNumber(true)
        else setValidNumber(false)
    }

    function handleChange (e:ChangeEvent<HTMLInputElement>) {
        if (e) {
            let newValue = e.target.value
            validatePhone(newValue)
            onChange(newValue)
        }
    }

    return(
        <div>
            <input
                type="text"
                name={name}
                className={filteredArray.length === 0 ? "phone-input phone-input_status_no-match" :"phone-input"}
                pattern={formatNumber(value, mask)}
                maxLength={mask.length}
                list="data"
                placeholder={mask}
                value={value}
                onChange={(e) => handleChange(e)}
                required
            />
            <input type="submit" value="Добавить номер" disabled={!validNumber} />

            <datalist id="data">
                {filteredArray.map((item, key) =>
                    <option key={key} value={formatNumber(item, mask)} />
                )}
            </datalist>

        </div>
    );
}

export default Input;
