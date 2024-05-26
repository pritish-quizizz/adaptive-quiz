export default function Summary(props) {
    const { summary,ques } = props;
    console.log("ques",ques);
    return (
        <div style={{display: 'flex',flexFlow: 'column'}}>
            <h1 style={{textAlign: 'center',overflowY: 'scroll'}}>Summary of Adaptive Quiz</h1>
            <h2 style={{textAlign: 'center',overflowY: 'scroll'}}>Final Bloom Level: {`${summary[summary.length - 1].bloomLevel}`}</h2>
            <div style={{height: 600,overflowY: 'scroll',border: '0.5px solid black',borderRadius: 10, marginBottom: 20}}>
            
            {
                summary.map((s,index) => {
                    const { question, correctAnswer, userAnswer, bloomLevel, options } = s;
                    const isCorrect = correctAnswer === userAnswer;
                    return (
                        <div style={{marginBottom: 4, padding: 10}}>
                            <h3 style={{maxWidth: '60%'}}>Q{index+1}: {question}</h3>
                            <ul>
                                {ques[index].options.map(option => {
                                    const optionToColor = option === userAnswer;
                                    return (
                                        <li style={{color: optionToColor ? isCorrect ? 'green' : 'red' : ''} }>{option}</li>
                                    )
                                })}
                            </ul>
                            <div style={{marginBottom: 10}}>{isCorrect ? 'Yay you got it right 🎉' : `Oops! The correct answer is ${correctAnswer}`}</div>

                            <div><strong>Level:</strong> {bloomLevel}</div>
                        </div>
                    )

                })
            }
            </div>

            <button className="button" style={{alignSelf: 'flex-end'}} onClick={() => window.location.reload()}>Start a New Quiz?</button>

        </div>
    )
}