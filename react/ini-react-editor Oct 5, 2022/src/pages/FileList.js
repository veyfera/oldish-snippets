import { Link } from 'react-router-dom';
import { getFileList } from '../utils/fileOperations';

const FileList = () => {
    const fileList = getFileList();
    return(
        <div className="file-list">
            <h2>Your files</h2>
            <ul>
            {fileList.map((fileName, i) => (
                <li key={i}>
                <Link to={`/file/${fileName}`}>{fileName}.ini</Link>
                </li>
            ))}
            </ul>
        </div>
    )
}

export default FileList;
