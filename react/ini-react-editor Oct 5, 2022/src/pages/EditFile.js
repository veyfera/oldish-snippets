import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

import Editor from '../components/Editor';
import { getFile, saveFile } from '../utils/fileOperations'

const EditFile = () => {
    const {fileName} = useParams();
    const [textMode, setTextMode] = useState(true);
    const [fileText, setFileText] = useState('');

    const handleFileSave = () => {
        saveFile(fileName, fileText)
    }

    useEffect(() => {
        setFileText(getFile(fileName));
    }, [fileName]);

    return(
        <div className="editor-wrapper">
            <h2>You are editing: {fileName}.ini</h2>
            <Editor fileText={fileText} setFileText={setFileText} textMode={textMode} setTextMode={setTextMode}/>
            <button onClick={handleFileSave} className="save-button">Save</button>
        </div>
    )
}

export default EditFile;
