import type { Component } from 'solid-js';
import NavBar from './NavBar';
import SideBar from './SideBar';
import ChatContainer from './ChatContainer';
import styles from './App.module.css';


function queryServer() {
    fetch('/test')
        .then(response => response.json())
        .then(data => console.log(data)).catch(err => console.log(err));
}


const App: Component = () => {
    return (
        <div>
            <NavBar />
            {/* <!-- **************** MAIN CONTENT START **************** --> */}
            <main>
                {/* <!-- Container START --> */}
                <div class="container-fluid">
                    <div class="row gx-0">
                        <SideBar />
                        <ChatContainer />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;