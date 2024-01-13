export const getFile = (fileName) => {
    const fileContent = localStorage.getItem(fileName);
    return fileContent
};

export const saveFile = (fileName, fileContent) => {
    localStorage.setItem(fileName, fileContent);
    if (!fileExists(fileName)) addFileToList(fileName);
};

export const getFileList = () => {
    const fileList = localStorage.getItem('fileList');
    if (fileList) {
        let newFileList = fileList.split(',');
        return newFileList
    }
    return []
};

function addFileToList (fileName) {
    const fileList = localStorage.getItem('fileList');
    let newFileList;
    if (!fileList) {
        newFileList = fileName;
    } else {
        newFileList = fileList + `,${fileName}`;
    }
    localStorage.setItem('fileList', newFileList);
};

export function fileExists (fileName) {
    const fileList = localStorage.getItem('fileList');
    if (!fileList) {
        return false
    }
    const fileArray = fileList.split(',');
    if (fileName === 'new' || fileArray.includes(fileName)) return true;
    return false;
};
