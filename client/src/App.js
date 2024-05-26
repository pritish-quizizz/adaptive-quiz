// src/App.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import Summary from './Summary';

const socket = io('http://localhost:3001'); // Adjust the URL if your server runs on a different port or domain
const MAX = 5;

function App() {
  const [question, setQuestion] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [options, setOptions] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quest, setQues] = useState([]);

  useEffect(() => {
    socket.on('question', (ques) => {
      console.log("ques", ques);
      const { question, options, bloomLevel } = ques;
      setQuestion(question);
      setBloomLevel(bloomLevel);
      setOptions(options);
      setCount((count) => count + 1);
      setLoading(false);
      setQues((q) => [...q, ques])
    });

    socket.on('summary', (response) => {
      console.log("summ", response.summary);
      setSummary(response.summary);
      setLoading(false);
    })

    return () => {
      socket.off('question');
      socket.off('summary');
    };
  }, []);

  const generate = () => {
    const value = input.trim();
    if (value) {
      const data = { prompt: value }
      setIsStarted(true);
      socket.emit('start', data);
      setInput('');
      setCount(0);
      setLoading(true);
    }
  };

  const onNext = () => {
    if(selected === -1){
      alert("Please select an option before proceeding");
      return;
    }
    const event = count >= MAX ? 'quizEnd' : 'question';
    console.log("count", count, event);
    socket.emit(event, { response: options[selected] });
    setLoading(true);
    setSelected(-1);
  }

  console.log("quesss", quest);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}> {count === MAX ? 'Generating Summary' : 'Generating Question'} </div>
    )
  }



  return (
    <div className="App">
      <a href='https://quizizz.com/admin' _target="blank" className='logo'>
        <img src="https://cf.quizizz.com/img/logos/Purple.webp" height={40} alt="logo" />
      </a>
      <div className='container'>
        {!isStarted ?
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What quiz you want to generate today?"
              className='input'
            />
            <button className='button' onClick={generate}>Generate</button>
          </> : !summary.length ?
            <div style={{display:'flex',justifyContent: 'center', alignItems: 'center'}}>
              <div className='box'>
                <h1>{question}</h1>
                <div><b>{`BloomLevel: ${bloomLevel}`}</b></div>
                <ul>
                  {
                    options.map((option, index) => {
                      return (
                        <li onClick={() => setSelected(index)} style={{cursor: 'pointer'}}>
                          <input style={{ alignSelf: 'flex-start',cursor: 'pointer' }} type="radio" checked={index === selected} onClick={() => setSelected(index)} />
                          <span style={{ marginLeft: '4px' }}>{option}</span>
                        </li>
                      )
                    })
                  }
                </ul>
                <button className='button' style={{ marginTop: 40,alignSelf: 'flex-start' }} onClick={onNext}>{count === MAX ? 'Submit' : 'Next'}</button>
              </div></div> : <Summary summary={summary} ques={quest} />
        }



      </div>
    </div>
  );
}

export default App;
