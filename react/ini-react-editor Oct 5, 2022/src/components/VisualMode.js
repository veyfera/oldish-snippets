import { useState, useEffect, useRef } from 'react';
import { parse, stringify } from 'ini';

const VisualMode = ({text, setterFunc}) => {
    if (!text) text = '';
    const [parsedText, setParsedText] = useState(parse(text));
    const sectionName = useRef('NewSection');

    const handleChange = (e) => {
        const {name, value, id} = e.target;
        setParsedText(current => ({...current, [name]:{...current[name], [id]: value}}));
    }

    const addSection = () => {
        let newSection = sectionName.current.value;
        if (newSection !== '') {
            setParsedText(current => ({...current, [newSection]: {}}));
            sectionName.current.value = '';
        } else {
            sectionName.current.reportValidity()
        }
    }

    const addKey = (e) => {
        e.preventDefault();
        const keyName = e.target[0].value;
        const sectionName = e.target[0].name;
        setParsedText(current => ({...current, [sectionName]: {...current[sectionName], [keyName]: ''}}));
        e.target.reset()
    }

    const keyValuePairs = (section) => (
        Object.keys(parsedText[section]).map((key) => (
            <label key={key}>
                {key}
                <input type={Number(parsedText[section][key]) ? 'number': 'text'} name={section}  id={key} value={parsedText[section][key]} onChange={handleChange} autoComplete='off'/>
            </label>
        ))
    );

    const sectionItem = (section) => (
        <fieldset key={section}>
            <legend>{section}</legend>
            {keyValuePairs(section)}
            <form onSubmit={addKey} className="add-section">
                <input type="text" name={section} placeholder="Enter key name" autoComplete='off' required />
                <button>Add key</button>
            </form>
        </fieldset>
    );

    useEffect(() => {
        setterFunc(stringify(parsedText));
    }, [parsedText, setterFunc])

    return(
        <div className="editor__visual">
            {Object.keys(parsedText).map((section) => (
                sectionItem(section)
            ))}
            <div className="add-section editor__footer">
                <input type="text" placeholder="Enter section name" ref={sectionName} required />
                <button onClick={addSection}>Add new section</button>
            </div>
        </div>
    )
}

export default VisualMode;
