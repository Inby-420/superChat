import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyCqfzEUFHTFv-4G-xkiZcp22qO4QeSd4ds",
  authDomain: "backend-for-chatapp.firebaseapp.com",
  projectId: "backend-for-chatapp",
  storageBucket: "backend-for-chatapp.appspot.com",
  messagingSenderId: "305336238377",
  appId: "1:305336238377:web:025f5ec1da9d2db13ef738",
  measurementId: "G-9C87QSK7HR"
})


const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

const logo = require('./logo.png');

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <img src={logo} className='imageLogo' />
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="btn btn-outline-primary sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Chat UI connected to Firebase which is acting as a backend, react app updates data in realtime</p>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out btn btn-outline-info" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="type something" />
      
      <label for="formFile" class="form-label"><i className="fa fa-paperclip"></i></label> 
      <input className="form-control" type="file" id="formFile" style={{backgroundColor: '#3a3a3a'}}></input>
      
      

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
