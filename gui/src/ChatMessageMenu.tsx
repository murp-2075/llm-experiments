


const ChatMessageMenu = (props) => {

    return (
        // <!-- Card action START --> 
        <div class="dropdown btn-group  dropend" >
            <button class="btn btn-sm btn-link icon-md rounded-circle btn-primary-soft " type="button" role="button"
                id="chatcoversationDropdown" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="chatcoversationDropdown">
                <li>
                    <button class="dropdown-item btn btn-link ps-3" onClick={props.editMessageHandler}
                    ><i class="bi bi-pencil me-2 fw-icon"></i>Edit message</button>
                </li>
                <li>
                    <button class="dropdown-item btn btn-link ps-3" onClick={props.deleteMessageHandler}
                    ><i class="bi bi-trash me-2 fw-icon"></i>Delete message</button>
                </li>
            </ul>
        </div >
        // <!-- Card action END --> 
    )
}

export default ChatMessageMenu