import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";
//Define a user type
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isLoggedIn: boolean;
}

interface Preferences {
    speakResponses: boolean;
}

interface Thread {
    id: number;
    title: string;
}

interface ThreadState {
    list: Thread[]; // Assuming Thread is a defined type
    selectedThreadId: number | null;
}

interface Message {
    id: number;
    threadId: number;
    role: string;
    content: string;
    createdAt: string;
}

interface AppState {
    user: User;
    messages: Message[];
    preferences: Preferences;
    threads: ThreadState;
    fetchingCounter: number;
    audioMessageIdPlaying: number | null;
}

const [appState, setAppState] = createStore<AppState>({
    preferences: {
        speakResponses: false
    },
    user: {
        id: 0,
        email: "",
        firstName: "",
        lastName: "",
        isLoggedIn: false
    },
    threads: {
        list: [],
        selectedThreadId: null
    },
    messages: [],
    fetchingCounter: 0,
    audioMessageIdPlaying: null
});

function startFetching() {
    setAppState('fetchingCounter', appState.fetchingCounter + 1);
}
function stopFetching() {
    setAppState('fetchingCounter', appState.fetchingCounter - 1);
}

// createEffect(() => {
//     const stateString = JSON.stringify(appState, null, 2);
//     console.log(stateString);

// });

const selectThread = (threadId: number) => {
    setAppState('threads', 'selectedThreadId', threadId);
    getMessages(threadId);
}

const createThread = async (title: string) => {
    const res = await fetch('/api/createThread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    })
    const newThread: Thread = await res.json()
    setAppState('threads', 'list', (threads) => [newThread, ...threads]);
    selectThread(newThread.id);
}

const updateThread = async (threadId: number, title: string) => {
    const res = await fetch('/api/updateThread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threadId, title })
    })
    const newThread: Thread = await res.json()
    setAppState('threads', 'list', (threads) => threads.map((thread) => thread.id === threadId ? newThread : thread));
}

const getThreads = async () => {
    const res = await fetch('/api/getThreads')
    const threads = await res.json()
    console.log("got back ", threads)
    setAppState('threads', 'list', threads);
    console.log("appState is now ", appState.threads.list)
}

const deleteThread = async (threadId: number) => {
    const res = await fetch('/api/deleteThread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threadId })
    })
    setAppState('threads', 'list', (threads) => threads.filter((thread) => thread.id !== threadId));
    // if the deleted thread is the selected thread, select the first thread in the list and also delete all messages
    if (appState.threads.selectedThreadId === threadId) {
        // delete all messages
        setAppState('messages', []);
        selectThread(appState.threads.list[0].id);
    }
}

const toggleSpeakResponses = () => {
    setAppState('preferences', 'speakResponses', !appState.preferences.speakResponses);
}

const getMessages = (threadId: number) => {
    fetch(`/api/getMessages?threadId=${threadId}`)
        .then((res) => res.json())
        .then((messages) => {
            console.log("got back in getMessages ", messages)
            setAppState('messages', messages);
        });
}

const autoNameThread = (threadId: number) => {
    //Get new title from server
    startFetching()
    fetch(`/api/autoNameThread?threadId=${threadId}`)
        .then((res) => res.json())
        .then((updatedThread) => {
            setAppState('threads', 'list', (threads) => threads.map((thread) => thread.id === threadId ? updatedThread : thread));
        }).finally(() => {
            stopFetching()
        });
}

const editMessage = (messageId: number, content: string) => {
    //Submit to /api/editMessage a json object with messageId and content
    fetch('/api/updateMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, content })
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("got back ", data)
            setAppState('messages', (messages) => messages.map((message) => message.id === messageId ? data : message));
        });
}


const createMessage = async (content: string) => {
    const selectedThreadId = appState?.threads?.selectedThreadId || 1;
    if (selectedThreadId) {
        //Subit to /api/createMessage a json object with threadId and content
        startFetching()
        fetch('/api/createMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                threadId: selectedThreadId,
                role: 'user',
                speakResponses: appState.preferences.speakResponses,
                content: content
            })
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("got back ", data)
                console.log("speakResponses is ", appState.preferences.speakResponses)
                if (appState.preferences.speakResponses && data.audioMessage.hasFile) {
                    //stream the audio from /api/getAudioFile?messageId=xxx
                    console.log("playing message ", data.audioMessage.audioFileIds)
                    playAudioFiles(data.audioMessage.audioFileIds, 0, data.messages[1].id);
                }
                setAppState('messages', (originalMessages) => [...originalMessages, ...data.messages]);
                //Now see if there have now been so many responses we should have the bot rename the chat
                autoNameIfAppropriate();
            }).finally(() => {
                stopFetching()
            });
    }
}

const createMessageFromAudio = async (audioBlob: Blob) => {
    const selectedThreadId = appState?.threads?.selectedThreadId || 1;
    if (selectedThreadId) {
        const formData = new FormData();
        formData.append('threadId', selectedThreadId);
        formData.append('role', 'user');
        formData.append('content', audioBlob, 'audio.wav');
        formData.append('speakResponses', appState.preferences.speakResponses.toString());
        // formData.append('content', audioBlob, 'audio.webm');
        // or 'recording.wav' depending on your blob type
        startFetching()
        fetch('/api/createMessageFromAudio', {
            method: 'POST',
            body: formData
        })
            .then((res) => res.json())
            .then((data) => {
                if (appState.preferences.speakResponses && data.audioMessage.hasFile) {
                    //stream the audio from /api/getAudioFile?messageId=xxx
                    console.log("playing message ", data.audioMessage.audioFileIds)
                    playAudioFiles(data.audioMessage.audioFileIds, 0, data.messages[1].id);
                }
                setAppState('messages', (messages) => [...messages, ...data.messages]);
                //Now see if there have now been so many responses we should have the bot rename the chat
                autoNameIfAppropriate();
            }).finally(() => {
                stopFetching()
            })
    }
}
let audio: HTMLAudioElement | undefined;
function playAudioFiles(audioFileIds: number[], index: number, messageId?: number) {
    if (index < audioFileIds.length) {
        console.log("playing audio ", audioFileIds[index])
        audio = new Audio(`/api/getAudioFile/${audioFileIds[index]}`);
        audio.play();
        setAppState('audioMessageIdPlaying', messageId || null);
        audio.onended = () => {
            playAudioFiles(audioFileIds, index + 1, messageId);
        }
    } else {
        setAppState('audioMessageIdPlaying', null);
    }
}

function stopAudio() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    setAppState('audioMessageIdPlaying', null);
}

function pauseAudio() {
    if (audio) {
        audio.pause();
    }
}

function playAudio() {
    if (audio) {
        audio.play();
    }
}

const getAudioFileIdsFromMessage = (messageId: number) => {
    startFetching()
    fetch(`/api/getAudioFileIdsFromMessage/${messageId}`)
        .then((res) => res.json())
        .then((audioFileIds) => {
            console.log("got back ", audioFileIds)
            playAudioFiles(audioFileIds, 0, messageId);
        }).finally(() => {
            stopFetching()
        });
}

function autoNameIfAppropriate() {
    //Now see if there have now been so many responses we should have the bot rename the chat
    if (appState.messages.length >= 2) {
        //get the current thread title
        const currentThread = appState.threads.list.find((thread) => thread.id === appState.threads.selectedThreadId);
        if (currentThread?.title === 'New Thread') {
            if (appState.threads.selectedThreadId)
                autoNameThread(appState.threads.selectedThreadId);
        }
    }
}

//Load the current user. User should always already be logged in, so we can just fetch it.
(() => {
    fetch('/api/getUser')
        .then((res) => res.json())
        .then((user) => {
            setAppState('user', user);
        });
})()


export {
    appState, setAppState,
    selectThread, getThreads, createThread, updateThread, deleteThread, autoNameThread,
    getMessages, createMessage, editMessage, createMessageFromAudio,
    getAudioFileIdsFromMessage, stopAudio, pauseAudio, playAudio,
    toggleSpeakResponses
}
