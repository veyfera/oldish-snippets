import CodeEditor from '@uiw/react-textarea-code-editor';

const TextMode = ({text, setterFunc}) => {
    document.documentElement.setAttribute('data-color-mode', 'light')
    const handleChange = (e) => {
        setterFunc(e.target.value)
    }
    return(
        <div>
            <CodeEditor
                value={text}
                onChange={handleChange}
                language='ini'
                placeholder='Enter your text here'
                style={{
                    fontSize: 18,
                    border: '1px solid #333',
                }}
            />
        </div>
    )
}

export default TextMode;
