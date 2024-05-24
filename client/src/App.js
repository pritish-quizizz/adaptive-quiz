// src/App.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import Summary from './Summary';

const socket = io('http://localhost:3001'); // Adjust the URL if your server runs on a different port or domain
const MAX = 5;

function App() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on('question', (ques) => {
      const { question, options } = ques;
      setQuestion(question)
      setOptions(options);
      setCount(count + 1);
      setLoading(false);
    });

    socket.on('summary', ({ summary }) => {
      setSummary(summary);
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
    const event = count === MAX ? 'quizEnd' : 'question';
    socket.emit(event, { response: options[selected] });
    setLoading(true);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>Loading..........</div>
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
          </> : summary.length ?
            <div className='box'>
              <h1>{question}</h1>
              <ul>
                {
                  options.map((option, index) => {
                    return (
                      <li>
                        <input style={{ alignSelf: 'flex-start' }} type="radio" checked={index === selected} onClick={() => setSelected(index)} />
                        <span>{option}</span>
                      </li>
                    )
                  })
                }
              </ul>
              <button className='button' style={{ width: '100%', marginTop: 40 }} onClick={onNext}>{count === MAX ? 'Submit' : 'Next'}</button>
            </div> : <Summary summary={summary} />
        }



      </div>
    </div>
  );
}

export default App;
