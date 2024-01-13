import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import Editor from '../components/Editor';
import { saveFile, fileExists } from '../utils/fileOperations'

const EditFile = () => {
    const fileName = useRef();
    const navigate = useNavigate();

    const [textMode, setTextMode] = useState(true);
    const [fileText, setFileText] = useState('');

    const handleFileSave = () => {
        if (fileExists(fileName.current.value)) {
            alert('File with this name already exists, please choose another name');
        } else {
            saveFile(fileName.current.value, fileText);
            navigate(`/file/${fileName.current.value}`);
        }
    }

    return(
        <div className="editor-wrapper">
            <label>
                Enter a name for your file:
                <input type="text" placeholder="Filename" ref={fileName} />
            </label>
            <Editor fileText={fileText} setFileText={setFileText} textMode={textMode} setTextMode={setTextMode}/>
            <button onClick={handleFileSave} className="save-button">Save</button>
        </div>
    )
}

export default EditFile;
