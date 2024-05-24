export default function Summary(props) {
    const { summary } = props;
    return (
        <div>
            <h1>Summary of QUIZ</h1>
            {
                summary.map((s) => {
                    const { question, correctAnswer, userAnswer, bloomLevel, options } = s;
                    const isCorrect = correctAnswer === userAnswer;
                    return (
                        <div>
                            <h3>{question}</h3>
                            <ul>
                                {options.map(option => {
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