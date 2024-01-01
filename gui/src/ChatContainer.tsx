import { Component, onMount, Show, For, createEffect } from 'solid-js';
import { createSignal } from 'solid-js';
import { appState, createMessage, createMessageFromAudio, getThreads, createThread, selectThread, toggleSpeakResponses } from './Store';
import ChatMessage from './ChatMessage';
import AudioRecorder from './utils/AudioRecorder';
import PreLoader from './PreLoader';

declare const bootstrap: any;

const ChatContainer: Component = () => {

  const [container, setContainer] = createSignal();
  const [text, setText] = createSignal("");
  let audioRecorder: AudioRecorder | null = null
  let inputRef: any = null;
  let recordingBtnRef: any = null;
  let toggleSpeakResponsesRef: any = null;
  let longPressButtonRef: any = null;

  let currentSelectedThreadId = appState.threads.selectedThreadId;
  createEffect(() => {
    if (appState.threads.selectedThreadId !== currentSelectedThreadId) {
      currentSelectedThreadId = appState.threads.selectedThreadId;
      inputRef.focus();
    }
  })

  async function handleKeyDown(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage()
    }
  }

  async function sendMessage() {
    await createMessage(text());
    setText('');
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    const currentContainer = container();
    if (currentContainer) {
      const currentContainer = container() as HTMLElement;
      currentContainer.scrollTop = currentContainer.scrollHeight;
    }
  };

  // Scroll to bottom on new message
  createEffect(() => {
    appState.messages;
    scrollToBottom();
  });

  createEffect(() => {
    //if appState.messages changes, run Prismjs highlightAll
    // setTimeout(() => {
    //   console.log(Prism)
    // Prism.highlightAll();
    // console.log("highlighted")
    // },1000)
  })

  onMount(async () => {
    inputRef.focus();
    await getThreads();
    console.log(appState.threads.list)
    if (!appState.threads.list || appState.threads.list.length === 0) {
      await createThread('New Thread');
    }
    selectThread(appState.threads.list[0].id);
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });

  const recordingClickHandler = async (skipSilenceDetector = false) => {
    // Function to handle audio play and message creation
    const handleAudioPlayback = async (audioBlob: any) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      await createMessageFromAudio(audioBlob);
    };

    // Function to toggle button class
    const toggleButtonClass = (isRecording: boolean) => {
      recordingBtnRef.classList.remove(isRecording ? 'btn-success-soft' : 'btn-danger-soft');
      recordingBtnRef.classList.add(isRecording ? 'btn-danger-soft' : 'btn-success-soft');

    };

    // Check and initialize the audioRecorder
    if (!audioRecorder) {
      audioRecorder = new AudioRecorder(async (promise: Promise<any>) => {
        const audioBlob = await promise;
        if (!audioBlob) return;
        toggleButtonClass(true);
        await handleAudioPlayback(audioBlob);
      });
    }

    // Main recording logic
    if (audioRecorder.isRecording()) {
      const audioBlob = await audioRecorder.stopRecording();
      if (!audioBlob) return;
      toggleButtonClass(true);
      await handleAudioPlayback(audioBlob);
    } else {
      toggleButtonClass(false);
      audioRecorder.startRecording(skipSilenceDetector);
    }
  };

  const toggleSpeakResponsesHandler = () => {
    toggleSpeakResponses();
    //Remove btn-primary-soft and add btn-primary
    toggleSpeakResponsesRef.classList.toggle('btn-primary-soft');
    toggleSpeakResponsesRef.classList.toggle('btn-primary');
  }

  const longPressTalkButtonHandler = (pressDirection: string) => {
    if (pressDirection === 'down' && !appState.preferences.speakResponses) {
      toggleSpeakResponsesHandler();
      longPressButtonRef.classList.remove('btn-primary');
      longPressButtonRef.classList.add('btn-success-soft');
    }

    if (pressDirection === 'down') {
      recordingClickHandler(true);
    } else {
      longPressButtonRef.classList.remove('btn-success-soft');
      longPressButtonRef.classList.add('btn-primary');
      recordingClickHandler();
    }
  }


  return (
    // <!-- Chat conversation START -->
    <div class="col-lg-8 col-xxl-9">
      <div class="card card-chat rounded-start-lg-0 border-start-lg-0">
        <div class="card-body h-100">
          <div class="tab-content py-0 mb-0 h-100" id="chatTabsContent">
            {/* <!-- Conversation item START --> */}
            <div class="fade tab-pane show active h-100" id="chat-1" role="tabpanel" aria-labelledby="chat-1-tab">
              {/* <!-- Top avatar and status START --> */}
              <div class="d-sm-flex justify-content-between align-items-center">
                <div class="d-flex mb-2 mb-sm-0">
                  <div class="flex-shrink-0 avatar me-2">
                    <img class="avatar-img rounded-circle" src="assets/images/avatar/10.jpg" alt="" />
                  </div>
                  <div class="d-block flex-grow-1">
                    <h6 class="mb-0 mt-1">{appState.user.firstName} {appState.user.lastName}</h6>
                    <div class="small text-secondary"><i class="fa-solid fa-circle text-success me-1"></i>Online
                    </div>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  {/* <!-- Call button --> */}
                  <a href="#!" class="icon-md rounded-circle btn btn-primary-soft me-2 px-2"
                    data-bs-toggle="modal" data-bs-placement="bottom" data-bs-target="#phoneModal" title="Audio call"><i
                      class="bi bi-telephone-fill"></i></a>
                  <a href="#!" class="icon-md rounded-circle btn btn-primary-soft me-2 px-2"
                    ref={toggleSpeakResponsesRef}
                    onClick={toggleSpeakResponsesHandler}
                    data-bs-toggle="tooltip" data-bs-placement="top" title="Speak responses"><i
                      class="bi bi-volume-up-fill"></i></a>
                  {/* <!-- Card action START --> */}
                  <div class="dropdown">
                    <a class="icon-md rounded-circle btn btn-primary-soft me-2 px-2" href="#"
                      id="chatcoversationDropdown" role="button" data-bs-toggle="dropdown"
                      data-bs-auto-close="outside" aria-expanded="false"><i
                        class="bi bi-three-dots-vertical"></i></a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="chatcoversationDropdown">
                      <li><a class="dropdown-item" href="#"><i class="bi bi-check-lg me-2 fw-icon"></i>Mark as
                        read</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-mic-mute me-2 fw-icon"></i>Mute
                        conversation</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-person-check me-2 fw-icon"></i>View
                        profile</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-trash me-2 fw-icon"></i>Delete chat</a>
                      </li>
                      <li class="dropdown-divider"></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-archive me-2 fw-icon"></i>Archive
                        chat</a></li>
                    </ul>
                  </div>
                  {/* <!-- Card action END --> */}
                </div>
              </div>
              {/* <!-- Top avatar and status END --> */}
              <hr />
              {/* <!-- Chat conversation START --> */}
              {/* <div class="chat-conversation-content  custom-scrollbar" style="max-height: 60vh; overflow-y: auto;"> */}
              <div class="chat-conversation-content  custom-scrollbar" style="max-height: 60vh; overflow-y: auto;" ref={setContainer}>
                <For each={appState.messages}>{(message) => <ChatMessage {...message} />}</For>
              </div>
              {/* <!-- Chat conversation END --> */}
            </div>
            {/* <!-- Conversation item END --> */}
          </div>
        </div>
        <div class="card-footer">
          {/* <Show when={appState.fetchingCounter == 0}> */}
          <div class="d-sm-flex align-items-end">
            <textarea class="form-control mb-sm-0 mb-3" data-autoresize placeholder="Type a message"
              value={text()}
              onInput={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            ></textarea>
            <button class="btn btn-sm btn-danger-soft ms-sm-2" onClick={() => { recordingClickHandler(true) }} ref={recordingBtnRef}><i class="fa-solid bi-mic fs-6"></i></button>
            <button class="btn btn-sm btn-secondary-soft ms-2" data-bs-toggle="modal" data-bs-target="#fileModal"><i class="fa-solid fa-paperclip fs-6"></i></button>
            <button class="btn btn-sm btn-primary ms-2" onClick={sendMessage}><i class="fa-solid fa-paper-plane fs-6"></i></button>
          </div>
          {/* </Show> */}
        </div>
      </div>
      {/* <!-- Voice chat modal START --> */}
      <div class="modal fade" id="phoneModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen-sm-down">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="voiceChatModalLabel">Voice Chat</h5>
              <PreLoader />
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body d-flex flex-column justify-content-end" style="min-height: 80vh;">
              <div class="mt-auto">
                <button type="button" ref={longPressButtonRef} onMouseDown={() => { longPressTalkButtonHandler('down') }} onMouseUp={() => { longPressTalkButtonHandler('up') }} class="btn btn-primary btn-lg w-100" style="font-size: 2rem; padding: 20px 40px;">Activate Voice Command</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Voice chat modal END --> */}

      <div class="modal fade" id="fileModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="voiceChatModalLabel">Image Upload</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body d-flex flex-column justify-content-end">
              <div class="mt-auto">
                <input type="file" class="form-control" id="formFile" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger-soft me-2" data-bs-dismiss="modal"> Cancel</button>
              <button type="button" class="btn btn-success-soft">Create now</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}


export default ChatContainer;