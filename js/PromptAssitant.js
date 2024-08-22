function App() {
    const [input, setInput] = React.useState('');
    const [editableOutput, setEditableOutput] = React.useState('');
    const [strategies, setStrategies] = React.useState({
        C: { selected: false, content: '' },
        O: { selected: false, content: '' },
        S: { selected: false, content: '' },
        T: { selected: false, content: '' },
        A: { selected: false, content: '' },
        R: { selected: false, content: '' }
    });

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleStrategyChange = (strategy) => {
        setStrategies(prev => ({
            ...prev,
            [strategy]: { ...prev[strategy], selected: !prev[strategy].selected }
        }));
    };

    const handleStrategyContentChange = (strategy, content) => {
        setStrategies(prev => ({
            ...prev,
            [strategy]: { ...prev[strategy], content: content }
        }));
    };

    const generatePrompt = () => {
        let prompt = "";
        if (strategies.C.selected) prompt += `${strategies.C.content}\n`;
        prompt += `\n作为一个专业的${input}专家，请你根据要求完成以下任务：`;
        if (strategies.O.selected) prompt += `${strategies.O.content}\n`;
        if (strategies.S.selected) prompt += `${strategies.S.content}\n`;
        if (strategies.T.selected) prompt += `${strategies.T.content}\n`;
        if (strategies.A.selected) prompt += `${strategies.A.content}\n`;
        if (strategies.R.selected) prompt += `${strategies.R.content}\n`;

        setEditableOutput(prompt);
    };

    const handleEditableOutputChange = (e) => {
        setEditableOutput(e.target.value);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(editableOutput).then(() => {
            alert('提示词已复制到剪贴板！');
        });
    };

    const strategyLabels = {
        C: '上下文', O: '目标', S: '风格', T: '语气', A: '受众', R: '响应'
    };

    return (
        <div className="container">
            <h1>提示词助手</h1>
            <textarea 
                value={input} 
                onChange={handleInputChange} 
                placeholder="请输入你的专业领域..."
            />
            <h2>选择并填写 CO-STAR 策略：</h2>
            {Object.entries(strategies).map(([key, value]) => (
                <div key={key} className="strategy-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={value.selected}
                            onChange={() => handleStrategyChange(key)}
                        />
                        {strategyLabels[key]}
                    </label>
                    {value.selected && (
                        <input
                            type="text"
                            value={value.content}
                            onChange={(e) => handleStrategyContentChange(key, e.target.value)}
                            placeholder={`输入${strategyLabels[key]}内容...`}
                        />
                    )}
                </div>
            ))}
            <button onClick={generatePrompt}>生成提示词</button>
            <div id="output">
                <h3>生成的提示词：</h3>
                <textarea 
                    value={editableOutput} 
                    onChange={handleEditableOutputChange} 
                    style={{height: '200px'}}
                />
                <button onClick={copyToClipboard}>复制提示词</button>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));