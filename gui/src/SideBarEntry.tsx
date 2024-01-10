import { appState, selectThread, deleteThread, updateThread, autoNameThread } from "./Store";


const SideBarEntry = (props: any) => {
    let popupMenuRef: any = null;
    const { thread } = props;

    const createdAt = props.thread.createdAt && new Date(props.thread.createdAt);
    const date = createdAt && new Date(createdAt).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" });

    function hidePopupMenu() {
        popupMenuRef.classList.remove('show');
    }
    const deleteThreadHandler = (id: number) => {
        // if (confirm('Are you sure you want to delete this thread?')) {
        deleteThread(id);
        // }
        hidePopupMenu()
    }
    const autonameThreadHandler = (id: number) => {
        autoNameThread(id);
        hidePopupMenu()
    }
    const selectThreadHandler = (id: number) => {
        if (id !== appState.threads.selectedThreadId) {
            selectThread(id);
        }
    }
    const renameThreadHandler = (id: number) => {
        const title = prompt('Enter new thread title');
        if (title) {
            updateThread(id, title)
        }
        hidePopupMenu()
    }

    return (
        <a href="#" class={`nav-link ${appState.threads.selectedThreadId === thread.id ? 'active' : ''} text-start`} role="tab"
            onClick={() => { selectThreadHandler(thread.id) }}>
            <div class="d-flex">
                <div class="flex-shrink-0 avatar avatar-story me-2 status-online">
                    <img class="avatar-img rounded-circle" src="assets/images/avatar/10.jpg" alt="" />
                </div>
                <div class="flex-grow-1 d-block">
                    <h6 class="mb-0 mt-1">{thread.title}</h6>
                    <div class="small text-secondary">{date}</div>
                </div>
                {/* <!-- Card action START --> */}
                <div class="dropdown btn-group  dropend">
                    <button class="btn btn-sm btn-link icon-md rounded-circle btn-primary-soft " type="button" role="button"
                        id="chatcoversationDropdown" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="chatcoversationDropdown" ref={popupMenuRef}>
                        <li>
                            <button class="dropdown-item btn btn-link ps-3" onClick={() => { renameThreadHandler(thread.id) }}
                            ><i class="bi bi-pencil me-2 fw-icon"></i>Rename chat</button>
                        </li>
                        <li>
                            <button class="dropdown-item btn btn-link ps-3" onClick={()=>{ autonameThreadHandler(thread.id) }}
                            ><i class="bi bi-archive me-2 fw-icon"></i>Autoname chat</button>
                        </li>
                        <li class="dropdown-divider"></li>
                        <li>
                            <button class="dropdown-item btn btn-link ps-3" onClick={() => { deleteThreadHandler(thread.id) }}
                            ><i class="bi bi-trash me-2 fw-icon"></i>Delete chat</button>
                        </li>
                    </ul>
                </div>
                {/* <!-- Card action END --> */}
                {/* <div class="flex-grow-0 d-block">
                    <button type="button" class="btn btn-outline-danger btn-sm" onClick={() => { deleteThreadHandler(thread.id) }}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div> */}
            </div>
        </a>
    )
}

export default SideBarEntry