import TextMode from '../components/TextMode';
import VisualMode from '../components/VisualMode';

import visualIcon from '../images/eye.svg'
import textIcon from '../images/text.svg'

const Editor = ({fileText, setFileText, textMode, setTextMode}) => {
    return(
        <div className="editor">
            <div className="editor__modes">
                <img onClick={()=> setTextMode(true)} src={textIcon} alt="Text mode" className={textMode? 'active' : null} />
                <img onClick={()=> setTextMode(false)} src={visualIcon} alt="Visual mode" className={!textMode? 'active' : null}  />
            </div>

            {textMode ?
                <TextMode text={fileText} setterFunc={setFileText} />
                :
                <VisualMode text={fileText} setterFunc={setFileText} />
            }
        </div>
    )
}

export default Editor;
