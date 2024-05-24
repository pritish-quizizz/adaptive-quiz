export default function Summary(props) {
    const { summary,ques } = props;
    return (
        <div>
            <h1>Summary of QUIZ</h1>
            {
                summary.map((s,index) => {
                    const { question, correctAnswer, userAnswer, bloomLevel, options } = s;
                    const isCorrect = correctAnswer === userAnswer;
                    return (
                        <div>
                            <h3>{question}</h3>
                            <ul>
                                {ques[index].options.map(option => {
                                    const optionToColor = option === userAnswer;
                                    return (
                                        <li style={{color: optionToColor ? isCorrect ? 'green' : 'red' : ''} }>{option}</li>
                                    )
                                })}
                            </ul>
                            <div>{bloomLevel}</div>
                        </div>
                    )

                })
            }

        </div>
    )
}