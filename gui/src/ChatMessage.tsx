import { Show, createSignal, onCleanup } from 'solid-js';
import ChatType from './types/ChatType';
import CodeHighlighter from './utils/CodeHighlighter';
import { getAudioFileIdsFromMessage, editMessage, playAudio, pauseAudio, stopAudio, skipBackwarddAudio, skipForwardAudio, appState } from './Store';
import ChatMessageMenu from './ChatMessageMenu';



const ChatMessage = (chat: ChatType) => {
    let popupMenuRef: any = null;
    let pressTimer: number | undefined;
    const [showMenu, setShowMenu] = createSignal(false);

    const handleDoubleClick = () => {
        getAudioFileIdsFromMessage(chat.id)
    };

    const handleTouchStart = () => {
        pressTimer = setTimeout(() => {
            getAudioFileIdsFromMessage(chat.id);
        }, 500); // Trigger after 500ms for long press
    };

    const deleteMessageHandler = () => {
        if (confirm('Are you sure you want to delete this message?')) {
            editMessage(chat.id, '')
        }
        setShowMenu(false)
    }
    const editMessageHandler = () => {
        const content = prompt('Enter new message');
        if (content) {
            editMessage(chat.id, content)
        }
        setShowMenu(false)
    }

    const handlePlayClick = () => {
        playAudio();
    };
    const handleForwardClick = () => {
        skipForwardAudio();
    };
    const handleBackwardClick = () => {
        skipBackwarddAudio();
    }
    const handlePauseClick = () => {
        pauseAudio();
    };
    const handleStopClick = () => {
        stopAudio();
    };

    onCleanup(() => {
        clearTimeout(pressTimer);
    });

    const date = chat.createdAt && new Date(chat.createdAt).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" });
    const time = chat.createdAt && new Date(chat.createdAt).toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' });
    const prettyTime = `${date} ${time}`;
    if (chat.role === 'user') {
        return (
            <div class="d-flex justify-content-end text-end mb-1" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
                <div class="w-100" onDblClick={handleDoubleClick}
                // onTouchStart={handleTouchStart}
                // onTouchEnd={handleTouchEnd}
                >
                    <div class="d-flex flex-column align-items-end">
                        <div class="bg-primary text-white p-2 px-3 rounded-2">{chat.content}</div>
                        <Show when={appState.audioMessageIdPlaying == chat.id}>
                            <div class="d-flex justify-content-end align-items-center">
                                <button class="btn-icon" onClick={handlePlayClick}><i class="fas fa-play"></i></button>
                                <button class="btn-icon" onClick={handlePauseClick}><i class="fas fa-pause"></i></button>
                                <button class="btn-icon" onClick={handleStopClick}><i class="fas fa-stop"></i></button>
                            </div>
                        </Show>
                        {/* // {chat.content} */}
                        {/* <Show when={showMenu()}> */}
                        <ChatMessageMenu
                            chat={chat}
                            deleteMessageHandler={deleteMessageHandler}
                            editMessageHandler={editMessageHandler} />
                        {/* </Show> */}
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div class="d-flex mb-1" onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
                <Show when={chat.img}>
                    <div class="flex-shrink-0 avatar avatar-xs me-2">
                        <img class="avatar-img rounded-circle" src="assets/images/avatar/10.jpg" alt="" />
                    </div>
                </Show>
                <div class="flex-grow-1">
                    <div class="w-100">
                        <div class="d-flex flex-column align-items-start">
                            <div class="bg-light text-secondary p-2 px-3 rounded-2">
                                <div onDblClick={handleDoubleClick}>
                                    <CodeHighlighter content={chat.content} />
                                </div>
                                <Show when={appState.audioMessageIdPlaying == chat.id}>
                                    <div class="d-flex justify-content-end align-items-center">
                                        <button class="btn-icon" onClick={handlePlayClick}><i class="fas fa-play"></i></button>
                                        <button class="btn-icon" onClick={handleBackwardClick}><i class="fas fa-backward"></i></button>
                                        <button class="btn-icon" onClick={handleForwardClick}><i class="fas fa-forward"></i></button>
                                        <button class="btn-icon" onClick={handlePauseClick}><i class="fas fa-pause"></i></button>
                                        <button class="btn-icon" onClick={handleStopClick}><i class="fas fa-stop"></i></button>
                                    </div>
                                </Show>
                                {/* // {chat.content} */}
                                {/* <Show when={showMenu()}> */}
                                <ChatMessageMenu
                                    chat={chat}
                                    deleteMessageHandler={deleteMessageHandler}
                                    editMessageHandler={editMessageHandler} />
                                {/* </Show> */}
                            </div>
                            <Show when={chat.createdAt}>
                                <div class="small my-2">{prettyTime}</div>
                            </Show>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ChatMessage;
